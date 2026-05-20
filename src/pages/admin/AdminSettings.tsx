import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { Loader2, Save, Check } from 'lucide-react';

interface Setting {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

const SETTING_GROUPS = [
  {
    label: 'Site',
    keys: [
      { key: 'site_maintenance_mode', label: 'Maintenance Mode', type: 'toggle', desc: 'Shows a maintenance banner to all visitors' },
      { key: 'site_announcement_banner', label: 'Announcement Banner', type: 'text', desc: 'Text shown in a top banner (leave empty to hide)' },
    ],
  },
  {
    label: 'Marketplace',
    keys: [
      { key: 'marketplace_featured_ids', label: 'Featured Workflow IDs', type: 'text', desc: 'Comma-separated workflow IDs to pin at top' },
      { key: 'marketplace_submissions_open', label: 'Submissions Open', type: 'toggle', desc: 'Allow users to submit new workflows' },
    ],
  },
  {
    label: 'Community',
    keys: [
      { key: 'community_discord_url', label: 'Discord Invite URL', type: 'text', desc: 'Discord server invite link' },
      { key: 'community_member_count_override', label: 'Member Count Override', type: 'text', desc: 'Override displayed community count (leave blank to use real count)' },
    ],
  },
];

export default function AdminSettings() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const { data: settings = [], isLoading } = useQuery<Setting[]>({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const { data, error } = await (supabase.from('site_settings') as any).select('*');
      if (error) throw error;
      return data ?? [];
    },
    onSuccess: (data: Setting[]) => {
      const map: Record<string, string> = {};
      data.forEach((s) => { map[s.key] = s.value; });
      setLocalValues(map);
    },
  } as any);

  const getValue = (key: string) => {
    if (key in localValues) return localValues[key];
    return settings.find((s) => s.key === key)?.value ?? '';
  };

  const setValue = (key: string, val: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: val }));
  };

  const saveSetting = async (key: string) => {
    setSaving(key);
    try {
      await (supabase.from('site_settings') as any).upsert(
        { key, value: getValue(key), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } finally {
      setSaving(null);
    }
  };

  return (
    <AdminLayout activePage="settings">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 28, color: '#F4F4F8' }}>
          Site Settings
        </h1>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Loading...
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-[700px]">
          {SETTING_GROUPS.map((group) => (
            <div
              key={group.label}
              className="rounded-xl p-6"
              style={{ background: '#13131F', border: '1px solid #1E1E30' }}
            >
              <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 16, color: '#F4F4F8', marginBottom: 16 }}>
                {group.label}
              </h2>
              <div className="flex flex-col gap-5">
                {group.keys.map(({ key, label, type, desc }) => {
                  const val = getValue(key);
                  const isSaving = saving === key;
                  const isSaved = saved === key;

                  return (
                    <div key={key}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <label style={{ fontSize: 13, fontWeight: 600, color: '#F4F4F8' }}>{label}</label>
                          {desc && <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{desc}</p>}

                          {type === 'toggle' ? (
                            <div className="flex items-center gap-3 mt-3">
                              <button
                                onClick={() => setValue(key, val === 'true' ? 'false' : 'true')}
                                className="relative w-[44px] h-[24px] rounded-full transition-colors cursor-pointer"
                                style={{
                                  background: val === 'true' ? '#7C3AED' : '#374151',
                                  border: 'none',
                                }}
                              >
                                <span
                                  className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all"
                                  style={{ left: val === 'true' ? '23px' : '3px' }}
                                />
                              </button>
                              <span style={{ fontSize: 12, color: '#9CA3AF' }}>
                                {val === 'true' ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              value={val}
                              onChange={(e) => setValue(key, e.target.value)}
                              className="mt-2 w-full h-[38px] px-3 rounded-lg text-[13px] focus:outline-none"
                              style={{
                                background: '#0D0D14',
                                border: '1px solid #1E1E30',
                                color: '#F4F4F8',
                              }}
                              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#7C3AED'; }}
                              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = '#1E1E30'; }}
                            />
                          )}
                        </div>

                        <button
                          onClick={() => saveSetting(key)}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 h-[32px] px-3 rounded-lg text-[12px] font-medium transition-colors cursor-pointer disabled:opacity-50 shrink-0 mt-5"
                          style={isSaved
                            ? { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }
                            : { background: '#7C3AED', color: '#fff', border: 'none' }}
                        >
                          {isSaving ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : isSaved ? (
                            <><Check size={12} /> Saved</>
                          ) : (
                            <><Save size={12} /> Save</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div
            className="rounded-xl p-5"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <p style={{ fontSize: 12, color: '#EF4444', fontWeight: 500 }}>
              Note: The <code style={{ background: 'rgba(239,68,68,0.1)', padding: '1px 4px', borderRadius: 3 }}>site_settings</code> table
              must exist in Supabase. Run the SQL migration if settings fail to load.
            </p>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
