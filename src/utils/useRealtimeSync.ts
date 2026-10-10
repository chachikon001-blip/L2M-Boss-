import { useState, useEffect, useRef, useCallback } from 'react';
import type { Guild } from '../types.ts';
import { db } from '../firebase.ts';
import { doc, collection, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

export interface RoomMember {
  id: string;
  name: string;
  color: string;
  lastSeen?: number;
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
export const CLOUD_WS_URL = 'Google Firebase Firestore (Live Cloud Sync)';
export const CUSTOM_WS_STORAGE_KEY = 'boss_tracker_custom_ws_url';

const PALETTE = ['#38bdf8', '#a855f7', '#ec4899', '#22c55e', '#f59e0b', '#06b6d4', '#e11d48', '#8b5cf6'];

function getMemberColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
  }
  const idx = Math.abs(hash) % PALETTE.length;
  return PALETTE[idx];
}

export function getResolvedWsUrl(): { url: string; mode: 'cloud' | 'local' | 'custom'; isVercel: boolean } {
  const isVercel = typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('now.sh') ||
    window.location.hostname.includes('netlify.app') ||
    window.location.hostname.includes('github.io')
  );

  return {
    url: 'Google Cloud Firestore Real-time Sync',
    mode: 'cloud',
    isVercel,
  };
}

function getOrGenerateUserId(): string {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

function getInitialRoomId(): string {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && roomParam.trim()) {
      const clean = roomParam.trim().toLowerCase();
      localStorage.setItem(DEFAULT_ROOM_KEY, clean);
      return clean;
    }
    const saved = localStorage.getItem(DEFAULT_ROOM_KEY);
    if (saved && saved.trim()) {
      return saved.trim().toLowerCase();
    }
  }
  return 'boss-squad-1';
}

function getInitialUserName(): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(USERNAME_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  }
  const defaultNames = ['หัวหน้ากิลด์', 'รองหัวหน้า', 'นักรบกิลด์', 'มือตีบอส', 'สมาชิกสายฟาร์ม', 'จอมเวทกิลด์'];
  const picked = defaultNames[Math.floor(Math.random() * defaultNames.length)];
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERNAME_KEY, picked);
  }
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
  const [userColor] = useState<string>(() => getMemberColor(userId));
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [userCount, setUserCount] = useState<number>(1);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [activeServerInfo] = useState<{ mode: 'cloud' | 'local' | 'custom'; url: string; isVercel: boolean }>(getResolvedWsUrl);

  const setCustomWsUrl = useCallback((customUrl: string | null) => {
    if (customUrl && customUrl.trim()) {
      localStorage.setItem(CUSTOM_WS_STORAGE_KEY, customUrl.trim());
    } else {
      localStorage.removeItem(CUSTOM_WS_STORAGE_KEY);
    }
  }, []);

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

  const isInitialSnapshotRef = useRef<boolean>(true);
  const lastLocalUpdateTimestampRef = useRef<number>(0);

  const setUserName = useCallback((name: string) => {
    const clean = name.trim() || 'สมาชิกกิลด์';
    setUserNameState(clean);
    localStorage.setItem(USERNAME_KEY, clean);

    // Update presence in Firestore
    try {
      const memberRef = doc(db, 'rooms', roomId, 'members', userId);
      setDoc(
        memberRef,
        {
          id: userId,
          name: clean,
          color: userColor,
          lastSeen: Date.now(),
        },
        { merge: true }
      ).catch(() => {});
    } catch {}
  }, [roomId, userId, userColor]);

  const switchRoom = useCallback((newRoom: string) => {
    const clean = (newRoom || 'boss-squad-1').trim().toLowerCase();
    if (clean === roomId) return;

    // Leave old room presence
    try {
      const oldMemberRef = doc(db, 'rooms', roomId, 'members', userId);
      deleteDoc(oldMemberRef).catch(() => {});
    } catch {}

    setRoomId(clean);
    localStorage.setItem(DEFAULT_ROOM_KEY, clean);

    // Update URL query param without full page reload
    const url = new URL(window.location.href);
    url.searchParams.set('room', clean);
    window.history.replaceState({}, '', url.toString());

    isInitialSnapshotRef.current = true;
  }, [roomId, userId]);

  // Firestore Realtime Subscription for Room & Members
  useEffect(() => {
    isInitialSnapshotRef.current = true;
    setIsConnected(true);

    // Sync room param into current URL if not matching
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('room') !== roomId) {
        url.searchParams.set('room', roomId);
        window.history.replaceState({}, '', url.toString());
      }
    } catch {}

    const roomDocRef = doc(db, 'rooms', roomId);
    const membersColRef = collection(db, 'rooms', roomId, 'members');
    const myMemberDocRef = doc(db, 'rooms', roomId, 'members', userId);

    // 1. Send our presence
    const sendPresence = async () => {
      try {
        await setDoc(
          myMemberDocRef,
          {
            id: userId,
            name: userName,
            color: userColor,
            lastSeen: Date.now(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Presence sync note:', err);
      }
    };
    sendPresence();

    // Heartbeat every 20 seconds to keep presence fresh
    const heartbeatInterval = setInterval(sendPresence, 20000);

    // 2. Subscribe to room state updates
    const unsubscribeRoom = onSnapshot(
      roomDocRef,
      (snapshot) => {
        setIsConnected(true);
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.guilds)) {
            // If update came from another user or it's our first load
            if (data.updatedBy !== userId || isInitialSnapshotRef.current) {
              setIsSyncing(true);
              callbacksRef.current.onRemoteGuildsUpdate(
                data.guilds,
                data.lastUpdatedBy || 'เพื่อนในห้อง',
                data.lastAction || 'อัปเดตข้อมูล'
              );
              setTimeout(() => setIsSyncing(false), 800);
            }
          }
        } else {
          // Document does not exist yet for this room: create it with local state
          const initialGuilds = callbacksRef.current.getCurrentGuilds();
          setDoc(
            roomDocRef,
            {
              id: roomId,
              guilds: initialGuilds,
              lastUpdatedBy: userName,
              updatedBy: userId,
              lastAction: 'สร้างห้องเรียลไทม์',
              updatedAt: Date.now(),
            },
            { merge: true }
          ).catch(() => {});
        }
        isInitialSnapshotRef.current = false;
      },
      (error) => {
        console.error('Firestore room snapshot error:', error);
      }
    );

    // 3. Subscribe to active room members
    const unsubscribeMembers = onSnapshot(
      membersColRef,
      (snapshot) => {
        const now = Date.now();
        const activeMembers: RoomMember[] = [];

        snapshot.forEach((docSnap) => {
          const m = docSnap.data() as RoomMember;
          // Active if seen within 60 seconds
          if (m && m.id && (m.lastSeen ? now - m.lastSeen < 60000 : true)) {
            activeMembers.push({
              id: m.id,
              name: m.id === userId ? `${userName} (คุณ)` : m.name || 'สมาชิก',
              color: m.color || '#38bdf8',
              lastSeen: m.lastSeen,
            });
          }
        });

        // Ensure current user is in list
        if (!activeMembers.some((m) => m.id === userId)) {
          activeMembers.unshift({
            id: userId,
            name: `${userName} (คุณ)`,
            color: userColor,
            lastSeen: now,
          });
        }

        setMembers(activeMembers);
        setUserCount(activeMembers.length);
      },
      (error) => {
        console.error('Firestore members snapshot error:', error);
      }
    );

    return () => {
      clearInterval(heartbeatInterval);
      unsubscribeRoom();
      unsubscribeMembers();

      // Clean up presence on unmount
      try {
        deleteDoc(myMemberDocRef).catch(() => {});
      } catch {}
    };
  }, [roomId, userId, userName, userColor]);

  // Outgoing broadcast helpers that write to Firestore
  const broadcastGuildsUpdate = useCallback(
    (newGuilds: Guild[], actionDesc = 'อัปเดตรายการกิลด์') => {
      lastLocalUpdateTimestampRef.current = Date.now();
      const roomDocRef = doc(db, 'rooms', roomId);
      setDoc(
        roomDocRef,
        {
          id: roomId,
          guilds: newGuilds,
          lastUpdatedBy: userName,
          updatedBy: userId,
          lastAction: actionDesc,
          updatedAt: Date.now(),
        },
        { merge: true }
      ).catch((err) => console.error('Error broadcasting guilds:', err));
    },
    [roomId, userId, userName]
  );

  const broadcastToggleStatus = useCallback(
    (guildId: string | number, newStatus: boolean, guildName = '') => {
      const current = callbacksRef.current.getCurrentGuilds();
      const updated = current.map((g) => (g.id === guildId ? { ...g, cleared: newStatus } : g));
      const actionDesc = newStatus ? `ตีบอส "${guildName}" สำเร็จ` : `ยกเลิกสถานะ "${guildName}"`;
      broadcastGuildsUpdate(updated, actionDesc);
    },
    [broadcastGuildsUpdate]
  );

  const broadcastResetAll = useCallback(() => {
    const current = callbacksRef.current.getCurrentGuilds();
    const updated = current.map((g) => ({ ...g, cleared: false }));
    broadcastGuildsUpdate(updated, 'รีเซ็ตสถานะทุกกิลด์ประจำสัปดาห์');
  }, [broadcastGuildsUpdate]);

  const broadcastMarkAllCleared = useCallback(() => {
    const current = callbacksRef.current.getCurrentGuilds();
    const updated = current.map((g) => ({ ...g, cleared: true }));
    broadcastGuildsUpdate(updated, 'เคลียร์บอสทุกกิลด์ครบแล้ว');
  }, [broadcastGuildsUpdate]);

  const getShareableLink = useCallback(() => {
    if (typeof window === 'undefined') return '';
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
    activeServerInfo,
    setCustomWsUrl,
  };
}
