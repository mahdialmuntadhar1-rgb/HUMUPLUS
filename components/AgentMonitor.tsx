import React from 'react';
import { GlassCard } from './GlassCard';
import { supabaseRest } from '../services/supabase';

interface AgentStatusRow {
  agent_id: string;
  agent_name: string;
  governorate_id: string;
  current_status: 'online' | 'offline' | 'busy';
  updated_at: string;
}

export const AgentMonitor: React.FC = () => {
  const [rows, setRows] = React.useState<AgentStatusRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    supabaseRest<AgentStatusRow[]>('agent_statuses?select=agent_id,agent_name,governorate_id,current_status,updated_at&order=updated_at.desc&limit=100')
      .then((result) => setRows(result))
      .catch(() => setError('Could not load agent statuses.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <GlassCard className="p-6 text-white/70">Loading agent monitor…</GlassCard>;
  if (error) return <GlassCard className="p-6 text-accent">{error}</GlassCard>;
  if (!rows.length) return <GlassCard className="p-6 text-white/70">No live agent statuses found.</GlassCard>;

  return (
    <GlassCard className="p-6">
      <h3 className="text-white text-xl font-semibold mb-4">Agent Monitor (Live)</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {rows.map((row) => (
          <div key={row.agent_id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
            <div>
              <p className="text-white font-medium">{row.agent_name}</p>
              <p className="text-white/60 text-sm">{row.governorate_id}</p>
            </div>
            <div className="text-end">
              <p className="text-white capitalize">{row.current_status}</p>
              <p className="text-white/50 text-xs">{new Date(row.updated_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
