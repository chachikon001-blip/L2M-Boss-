import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// In-memory Room State for real-time collaborative tracking
interface GuildData {
  id: string | number;
  name: string;
  level: string;
  icon: string;
  note: string;
  status: boolean;
  targetBoss?: string;
  updatedAt?: number;
}

interface ClientMeta {
  ws: WebSocket;
  userId: string;
  userName: string;
  roomId: string;
  color: string;
  joinedAt: number;
}

interface RoomRecord {
  roomId: string;
  guilds: GuildData[];
  lastUpdated: number;
  clients: Set<WebSocket>;
}

const rooms = new Map<string, RoomRecord>();
const clientMetadata = new Map<WebSocket, ClientMeta>();

const USER_COLORS = [
  '#6366f1', // Indigo
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#f97316', // Orange
  '#14b8a6', // Teal
];

function getRandomColor(): string {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

// REST endpoints for health check and room inspection
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    activeRooms: rooms.size,
    totalConnections: clientMetadata.size,
    timestamp: Date.now(),
  });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const room = rooms.get(roomId);
  if (!room) {
    return res.json({ exists: false, guilds: [] });
  }
  return res.json({
    exists: true,
    roomId,
    guilds: room.guilds,
    userCount: room.clients.size,
    lastUpdated: room.lastUpdated,
  });
});

// WebSocket Server attached to the same HTTP server
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcastToRoom(roomId: string, message: any, excludeWs?: WebSocket) {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(message);
  for (const client of room.clients) {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      try {
        client.send(data);
      } catch (err) {
        console.error('Error broadcasting to client:', err);
      }
    }
  }
}

function getRoomMemberList(roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return [];
  const memberMap = new Map<string, { id: string; name: string; color: string }>();
  for (const client of room.clients) {
    const meta = clientMetadata.get(client);
    if (meta && !memberMap.has(meta.userId)) {
      memberMap.set(meta.userId, {
        id: meta.userId,
        name: meta.userName,
        color: meta.color,
      });
    }
  }
  return Array.from(memberMap.values());
}

wss.on('connection', (ws: WebSocket) => {
  // Setup heartbeat
  (ws as any).isAlive = true;
  ws.on('pong', () => {
    (ws as any).isAlive = true;
  });

  ws.on('message', (rawData) => {
    try {
      const msg = JSON.parse(rawData.toString());

      switch (msg.type) {
        case 'join_room': {
          const roomId = (msg.roomId || 'main').trim().toLowerCase();
          const userId = msg.userId || `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          const userName = (msg.userName || 'สมาชิกกิลด์').trim();
          const initialGuilds = Array.isArray(msg.initialGuilds) ? msg.initialGuilds : [];

          // Clean up any prior room association for this ws
          const oldMeta = clientMetadata.get(ws);
          if (oldMeta && oldMeta.roomId !== roomId) {
            const oldRoom = rooms.get(oldMeta.roomId);
            if (oldRoom) {
              oldRoom.clients.delete(ws);
              broadcastToRoom(oldMeta.roomId, {
                type: 'user_left',
                userId: oldMeta.userId,
                userName: oldMeta.userName,
                userCount: oldRoom.clients.size,
                members: getRoomMemberList(oldMeta.roomId),
              });
            }
          }

          // Register in new room
          let room = rooms.get(roomId);
          if (!room) {
            room = {
              roomId,
              guilds: initialGuilds,
              lastUpdated: Date.now(),
              clients: new Set(),
            };
            rooms.set(roomId, room);
          } else if (room.guilds.length === 0 && initialGuilds.length > 0) {
            room.guilds = initialGuilds;
          }

          room.clients.add(ws);

          const meta: ClientMeta = {
            ws,
            userId,
            userName,
            roomId,
            color: getRandomColor(),
            joinedAt: Date.now(),
          };
          clientMetadata.set(ws, meta);

          const members = getRoomMemberList(roomId);

          // Send current state to joining client
          ws.send(
            JSON.stringify({
              type: 'room_state',
              roomId,
              guilds: room.guilds,
              userCount: members.length,
              members,
              self: { id: userId, name: userName, color: meta.color },
            })
          );

          // Notify other room members
          broadcastToRoom(
            roomId,
            {
              type: 'user_joined',
              userId,
              userName,
              color: meta.color,
              userCount: members.length,
              members,
            },
            ws
          );
          break;
        }

        case 'update_guilds': {
          const meta = clientMetadata.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.roomId);
          if (!room) return;

          if (Array.isArray(msg.guilds)) {
            room.guilds = msg.guilds;
            room.lastUpdated = Date.now();

            broadcastToRoom(
              meta.roomId,
              {
                type: 'guilds_updated',
                guilds: room.guilds,
                senderId: meta.userId,
                senderName: meta.userName,
                actionDesc: msg.actionDesc || 'อัปเดตข้อมูลกิลด์',
                timestamp: Date.now(),
              },
              ws
            );
          }
          break;
        }

        case 'toggle_guild_status': {
          const meta = clientMetadata.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.roomId);
          if (!room) return;

          const guildId = msg.guildId;
          const newStatus = Boolean(msg.status);
          const guildName = msg.guildName || '';

          room.guilds = room.guilds.map((g) =>
            g.id === guildId ? { ...g, status: newStatus, updatedAt: Date.now() } : g
          );
          room.lastUpdated = Date.now();

          // Broadcast to everyone in the room (including sender confirmation)
          broadcastToRoom(
            meta.roomId,
            {
              type: 'guild_status_changed',
              guildId,
              status: newStatus,
              guildName,
              senderId: meta.userId,
              senderName: meta.userName,
              timestamp: Date.now(),
            },
            ws
          );
          break;
        }

        case 'reset_all_guilds': {
          const meta = clientMetadata.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.roomId);
          if (!room) return;

          room.guilds = room.guilds.map((g) => ({ ...g, status: false, updatedAt: Date.now() }));
          room.lastUpdated = Date.now();

          broadcastToRoom(
            meta.roomId,
            {
              type: 'all_reset',
              guilds: room.guilds,
              senderId: meta.userId,
              senderName: meta.userName,
              timestamp: Date.now(),
            },
            ws
          );
          break;
        }

        case 'mark_all_guilds_cleared': {
          const meta = clientMetadata.get(ws);
          if (!meta) return;
          const room = rooms.get(meta.roomId);
          if (!room) return;

          room.guilds = room.guilds.map((g) => ({ ...g, status: true, updatedAt: Date.now() }));
          room.lastUpdated = Date.now();

          broadcastToRoom(
            meta.roomId,
            {
              type: 'all_cleared',
              guilds: room.guilds,
              senderId: meta.userId,
              senderName: meta.userName,
              timestamp: Date.now(),
            },
            ws
          );
          break;
        }

        case 'update_user_name': {
          const meta = clientMetadata.get(ws);
          if (!meta) return;
          if (msg.name && typeof msg.name === 'string') {
            meta.userName = msg.name.trim();
            const members = getRoomMemberList(meta.roomId);
            broadcastToRoom(meta.roomId, {
              type: 'members_updated',
              members,
            });
          }
          break;
        }

        case 'ping': {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
        }
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    const meta = clientMetadata.get(ws);
    if (meta) {
      const room = rooms.get(meta.roomId);
      if (room) {
        room.clients.delete(ws);
        clientMetadata.delete(ws);

        // Check if user still has other active connections in the room
        let userStillConnected = false;
        for (const client of room.clients) {
          const otherMeta = clientMetadata.get(client);
          if (otherMeta && otherMeta.userId === meta.userId) {
            userStillConnected = true;
            break;
          }
        }

        const members = getRoomMemberList(meta.roomId);
        if (!userStillConnected) {
          broadcastToRoom(meta.roomId, {
            type: 'user_left',
            userId: meta.userId,
            userName: meta.userName,
            userCount: members.length,
            members,
          });
        } else {
          broadcastToRoom(meta.roomId, {
            type: 'members_updated',
            members,
            userCount: members.length,
          });
        }
      } else {
        clientMetadata.delete(ws);
      }
    }
  });
});

// Interval ping to keep WebSocket connections alive
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws: WebSocket) => {
    if ((ws as any).isAlive === false) {
      return ws.terminate();
    }
    (ws as any).isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(pingInterval);
});

// Configure Vite middleware in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Guild & Boss Tracker server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
