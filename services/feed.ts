import type { Post } from '../types';
import { buildRealtimeSocket, supabaseRest } from './supabase';

function mapPost(row: any): Post {
  return {
    id: String(row.id),
    businessId: String(row.business_id),
    businessName: row.business_name,
    businessAvatar: row.business_avatar,
    caption: row.caption,
    imageUrl: row.image_url,
    createdAt: new Date(row.created_at),
    likes: Number(row.likes || 0),
    verified: Boolean(row.verified),
  };
}

export async function fetchLatestPosts(limit = 20): Promise<Post[]> {
  const rows = await supabaseRest<any[]>(`posts?select=*&order=created_at.desc&limit=${limit}`);
  return rows.map(mapPost);
}

export function subscribeToNewPosts(onInsert: (post: Post) => void, onError: (message: string) => void) {
  const socket = buildRealtimeSocket();
  const topic = 'realtime:public:posts';
  const ref = '1';
  let heartBeatTimer: number | undefined;

  socket.onopen = () => {
    socket.send(JSON.stringify({
      topic,
      event: 'phx_join',
      payload: {
        config: {
          broadcast: { ack: false, self: false },
          presence: { key: '' },
          postgres_changes: [{ event: 'INSERT', schema: 'public', table: 'posts' }],
        },
      },
      ref,
    }));

    heartBeatTimer = window.setInterval(() => {
      socket.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(Date.now()) }));
    }, 30000);
  };

  socket.onmessage = (message) => {
    try {
      const parsed = JSON.parse(message.data);
      if (parsed.event === 'postgres_changes' && parsed.payload?.data?.record) {
        onInsert(mapPost(parsed.payload.data.record));
      }
      if (parsed.event === 'phx_error') {
        onError('Realtime channel error.');
      }
    } catch (error) {
      onError('Realtime payload parsing failed.');
    }
  };

  socket.onerror = () => onError('Realtime websocket disconnected.');

  return () => {
    if (heartBeatTimer) {
      window.clearInterval(heartBeatTimer);
    }
    socket.close();
  };
}
