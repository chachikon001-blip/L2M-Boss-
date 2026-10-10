import { useState, useEffect, useRef, useCallback } from 'react';
import type { Guild } from '../types.ts';

export interface RoomMember {
  id: string;
  name: string;
  color: string;
}

interface UseRealtimeSyncProps {
  onRemoteGuildsUpdate: (guilds: Guild[], senderName: string, actionDesc?: string) => void;
  onRemoteStatusChanged: (guildId: string | number, status: boolean, guildName: string, senderName: string) => void;
  onRemoteResetAll: (senderName: string) => void;
  onRemoteClearedAll: (senderName: string) => void;
  onRemoteUserJoined: (userName: string) => void;
  getCurrentGuilds: () => Guild[];
}

const DEFAULT_ROOM_KEY = 'boss_tracker_current_room';
const USERNAME_KEY = 'boss_tracker_user_name';
const USER_ID_KEY = 'boss_tracker_user_id';

function getOrGenerateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function getInitialRoomId(): string {
  // Check URL first (?room=xyz)
  const params = new URLSearchParams(window.location.search);
  const roomParam = params.get('room');
  if (roomParam && roomParam.trim()) {
    const clean = roomParam.trim().toLowerCase();
    localStorage.setItem(DEFAULT_ROOM_KEY, clean);
    return clean;
  }
  // Check localStorage
  const saved = localStorage.getItem(DEFAULT_ROOM_KEY);
  if (saved && saved.trim()) {
    return saved.trim().toLowerCase();
  }
  // Default shared room
  return 'boss-squad-1';
}

function getInitialUserName(): string {
  const saved = localStorage.getItem(USERNAME_KEY);
  if (saved && saved.trim()) {
    return saved.trim();
  }
  const defaultNames = ['หัวหน้ากิลด์', 'รองหัวหน้า', 'นักรบกิลด์', 'มือตีบอส', 'สมาชิกสายฟาร์ม', 'จอมเวทกิลด์'];
  const picked = defaultNames[Math.floor(Math.random() * defaultNames.length)];
  localStorage.setItem(USERNAME_KEY, picked);
  return picked;
}

export function useRealtimeSync({
  onRemoteGuildsUpdate,
  onRemoteStatusChanged,
  onRemoteResetAll,
  onRemoteClearedAll,
  onRemoteUserJoined,
  getCurrentGuilds,
}: UseRealtimeSyncProps) {
  const [roomId, setRoomId] = useState<string>(getInitialRoomId);
  const [userName, setUserNameState] = useState<string>(getInitialUserName);
  const [userId] = useState<string>(getOrGenerateUserId);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [userCount, setUserCount] = useState<number>(1);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMounted = useRef<boolean>(true);

  // Keep references to callbacks so effect doesn't re-trigger connection constantly
  const callbacksRef = useRef({
    onRemoteGuildsUpdate,
    onRemoteStatusChanged,
    onRemoteResetAll,
    onRemoteClearedAll,
    onRemoteUserJoined,
    getCurrentGuilds,
  });

  useEffect(() => {
    callbacksRef.current = {
      onRemoteGuildsUpdate,
      onRemoteStatusChanged,
      onRemoteResetAll,
      onRemoteClearedAll,
      onRemoteUserJoined,
      getCurrentGuilds,
    };
  });

  const setUserName = useCallback((name: string) => {
    const clean = name.trim() || 'สมาชิกกิลด์';
    setUserNameState(clean);
    localStorage.setItem(USERNAME_KEY, clean);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'update_user_name',
          name: clean,
        })
      );
    }
  }, []);

  const switchRoom = useCallback((newRoom: string) => {
    const clean = (newRoom || 'boss-squad-1').trim().toLowerCase();
    setRoomId(clean);
    localStorage.setItem(DEFAULT_ROOM_KEY, clean);

    // Update URL query param without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set('room', clean);
    window.history.replaceState({}, '', url.toString());

    // Send join_room if socket already open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const currentGuilds = callbacksRef.current.getCurrentGuilds();
      wsRef.current.send(
        JSON.stringify({
          type: 'join_room',
          roomId: clean,
          userId,
          userName,
          initialGuilds: currentGuilds,
        })
      );
    }
  }, [userId, userName]);

  // Connect WebSocket
  useEffect(() => {
    isComponentMounted.current = true;

    function connect() {
      if (!isComponentMounted.current) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isComponentMounted.current) return;
          setIsConnected(true);

          // Sync URL with current roomId
          const url = new URL(window.location.href);
          if (url.searchParams.get('room') !== roomId) {
            url.searchParams.set('room', roomId);
            window.history.replaceState({}, '', url.toString());
          }

          // Send join message
          const currentGuilds = callbacksRef.current.getCurrentGuilds();
          ws.send(
            JSON.stringify({
              type: 'join_room',
              roomId,
              userId,
              userName,
              initialGuilds: currentGuilds,
            })
          );
        };

        ws.onmessage = (event) => {
          if (!isComponentMounted.current) return;
          try {
            const data = JSON.parse(event.data);

            switch (data.type) {
              case 'room_state': {
                if (Array.isArray(data.guilds)) {
                  callbacksRef.current.onRemoteGuildsUpdate(data.guilds, 'ระบบกลาง', 'เชื่อมต่อห้องเรียลไทม์');
                }
                if (data.members) {
                  setMembers(data.members);
                }
                if (data.userCount !== undefined) {
                  setUserCount(data.userCount);
                }
                break;
              }

              case 'user_joined': {
                if (data.members) setMembers(data.members);
                if (data.userCount) setUserCount(data.userCount);
                if (data.userName) {
                  callbacksRef.current.onRemoteUserJoined(data.userName);
                }
                break;
              }

              case 'user_left': {
                if (data.members) setMembers(data.members);
                if (data.userCount) setUserCount(data.userCount);
                break;
              }

              case 'members_updated': {
                if (data.members) setMembers(data.members);
                break;
              }

              case 'guilds_updated': {
                if (Array.isArray(data.guilds)) {
                  setIsSyncing(true);
                  callbacksRef.current.onRemoteGuildsUpdate(
                    data.guilds,
                    data.senderName || 'เพื่อนในห้อง',
                    data.actionDesc || 'อัปเดตข้อมูล'
                  );
                  setTimeout(() => setIsSyncing(false), 800);
                }
                break;
              }

              case 'guild_status_changed': {
                setIsSyncing(true);
                callbacksRef.current.onRemoteStatusChanged(
                  data.guildId,
                  data.status,
                  data.guildName || '',
                  data.senderName || 'เพื่อนในห้อง'
                );
                setTimeout(() => setIsSyncing(false), 800);
                break;
              }

              case 'all_reset': {
                setIsSyncing(true);
                callbacksRef.current.onRemoteResetAll(data.senderName || 'เพื่อนในห้อง');
                setTimeout(() => setIsSyncing(false), 800);
                break;
              }

              case 'all_cleared': {
                setIsSyncing(true);
                callbacksRef.current.onRemoteClearedAll(data.senderName || 'เพื่อนในห้อง');
                setTimeout(() => setIsSyncing(false), 800);
                break;
              }
            }
          } catch (err) {
            console.error('Error handling WS message:', err);
          }
        };

        ws.onclose = () => {
          if (!isComponentMounted.current) return;
          setIsConnected(false);
          // Try reconnect after 3 seconds
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          if (!isComponentMounted.current) return;
          setIsConnected(false);
          ws.close();
        };
      } catch (err) {
        console.error('Failed to connect WebSocket:', err);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connect, 4000);
      }
    }

    connect();

    return () => {
      isComponentMounted.current = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [roomId, userId, userName]);

  // Outgoing broadcast helpers
  const broadcastGuildsUpdate = useCallback(
    (newGuilds: Guild[], actionDesc = 'อัปเดตรายการกิลด์') => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'update_guilds',
            guilds: newGuilds,
            actionDesc,
          })
        );
      }
    },
    []
  );

  const broadcastToggleStatus = useCallback(
    (guildId: string | number, newStatus: boolean, guildName = '') => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: 'toggle_guild_status',
            guildId,
            status: newStatus,
            guildName,
          })
        );
      }
    },
    []
  );

  const broadcastResetAll = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'reset_all_guilds',
        })
      );
    }
  }, []);

  const broadcastMarkAllCleared = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'mark_all_guilds_cleared',
        })
      );
    }
  }, []);

  const getShareableLink = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    return url.toString();
  }, [roomId]);

  return {
    isConnected,
    isSyncing,
    roomId,
    userName,
    setUserName,
    members,
    userCount,
    switchRoom,
    broadcastGuildsUpdate,
    broadcastToggleStatus,
    broadcastResetAll,
    broadcastMarkAllCleared,
    getShareableLink,
  };
}
