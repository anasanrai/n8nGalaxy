import { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import type { Workflow } from '../../types';
import { Search, Plus, Edit3, Trash2, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';

const CATEGORIES = ['real_estate', 'sales', 'finance', 'marketing', 'hr', 'devops', 'ai_agents', 'other'] as const;

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  approved: { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
  pending:  { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B' },
  draft:    { bg: 'rgba(107,114,128,0.15)', color: '#6B7280' },
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.draft;
  return (
    <span
      style={{
        ...s,
        padding: '2px 8px',
        borderRadius: 9999,
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────

interface WorkflowFormModalProps {
  workflow?: Workflow;
  onClose: () => void;
  onSaved: () => void;
}

function WorkflowFormModal({ workflow, onClose, onSaved }: WorkflowFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const [title, setTitle] = useState(workflow?.title ?? '');
  const [slug, setSlug] = useState(workflow?.slug ?? '');
  const [description, setDescription] = useState(workflow?.description ?? '');
  const [category, setCategory] = useState(workflow?.category ?? '');
  const [priceCents, setPriceCents] = useState(workflow?.price_cents ?? 0);
  const [nodeCount, setNodeCount] = useState(workflow?.node_count ?? 0);
  const [tools, setTools] = useState(workflow?.tools?.join(', ') ?? '');
  const [published, setPublished] = useState(workflow?.published ?? false);
  const [status, setStatus] = useState(workflow?.status ?? 'draft');

  useEffect(() => {
    if (!slugEdited && !workflow) {
      setSlug(slugify(title));
    }
  }, [title, slugEdited, workflow]);

  const handleSlugChange = useCallback((val: string) => {
    setSlugEdited(true);
    setSlug(val);
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        description: description || null,
        category,
        price_cents: priceCents,
        node_count: nodeCount,
        tools: tools.split(',').map((t) => t.trim()).filter(Boolean),
        published,
        status,
      };

      const table = supabase.from('workflows') as any;
      if (workflow?.id) {
        const { error } = await table.update(payload).eq('id', workflow.id);
        if (error) throw error;
      } else {
        const { error } = await table.insert(payload);
        if (error) throw error;
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [title, slug, description, category, priceCents, nodeCount, tools, published, status, workflow, onSaved, onClose]);

  const fieldStyle = {
    width: '100%',
    height: 44,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid #1E1E30',
    background: '#13131F',
    color: '#F4F4F8',
    fontSize: 13,
    outline: 'none',
  } as const;

  const labelStyle = {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: 500,
    marginBottom: 6,
    display: 'block',
  } as const;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-xl p-6 w-full"
        style={{
          maxWidth: 600,
          background: '#13131F',
          border: '1px solid #1E1E30',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 18, color: '#F4F4F8', marginBottom: 24 }}>
          {workflow ? 'Edit Workflow' : 'Add Workflow'}
        </h2>

        <div className="space-y-4">
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Workflow title"
              style={fieldStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Slug</label>
            <input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="workflow-slug"
              style={fieldStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the workflow…"
              rows={3}
              style={{
                ...fieldStyle,
                height: 'auto',
                padding: '10px 12px',
                resize: 'vertical',
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                ...fieldStyle,
                appearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                paddingRight: 36,
              }}
            >
              <option value="" disabled>Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label style={labelStyle}>Price (cents)</label>
              <input
                type="number"
                min={0}
                value={priceCents}
                onChange={(e) => setPriceCents(Number(e.target.value))}
                placeholder="1999"
                style={fieldStyle}
              />
            </div>
            <div className="flex-1">
              <label style={labelStyle}>Node Count</label>
              <input
                type="number"
                min={0}
                value={nodeCount}
                onChange={(e) => setNodeCount(Number(e.target.value))}
                placeholder="0"
                style={fieldStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Tools (comma-separated)</label>
            <input
              value={tools}
              onChange={(e) => setTools(e.target.value)}
              placeholder="OpenAI, Slack, Notion"
              style={fieldStyle}
            />
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label style={labelStyle}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'pending' | 'approved' | 'draft')}
                style={{
                  ...fieldStyle,
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: 36,
                }}
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <label className="flex items-center gap-2 pb-1" style={{ cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                style={{ accentColor: '#7C3AED' }}
              />
              <span style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 500 }}>Published</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              height: 40,
              padding: '0 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: '1px solid #1E1E30',
              background: 'transparent',
              color: '#9CA3AF',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{
              height: 40,
              padding: '0 20px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              background: saving || !title.trim() ? '#4B5563' : '#7C3AED',
              color: '#F4F4F8',
              cursor: saving || !title.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AdminWorkflows() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Workflow | undefined>(undefined);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: workflows = [], isLoading } = useQuery<Workflow[]>({
    queryKey: ['admin', 'workflows'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Workflow[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return workflows;
    return workflows.filter((w) => w.title.toLowerCase().includes(q));
  }, [workflows, search]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'workflows'] });
  }, [queryClient]);

  const openCreate = useCallback(() => {
    setEditing(undefined);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((w: Workflow) => {
    setEditing(w);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditing(undefined);
  }, []);

  const togglePublish = useCallback(async (w: Workflow) => {
    try {
      const { error } = await (supabase.from('workflows') as any)
        .update({ published: !w.published })
        .eq('id', w.id);
      if (error) throw error;
      invalidate();
    } catch (err) {
      console.error(err);
    }
  }, [invalidate]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const { error } = await (supabase.from('workflows') as any).delete().eq('id', id);
      if (error) throw error;
      invalidate();
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmDeleteId(null);
    }
  }, [invalidate]);

  return (
    <AdminLayout activePage="workflows">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 28, color: '#F4F4F8' }}>
          Workflows
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title…"
              style={{
                width: 240,
                height: 36,
                padding: '0 12px 0 32px',
                borderRadius: 8,
                border: '1px solid #1E1E30',
                background: '#13131F',
                color: '#F4F4F8',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>
          <button
            onClick={openCreate}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              background: '#7C3AED',
              color: '#F4F4F8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus size={14} />
            Add Workflow
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#13131F', border: '1px solid #1E1E30' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: '#0D0D14', color: '#6B7280', fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {['Title', 'Category', 'Price', 'Status', 'Published', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3" style={{ whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center" style={{ color: '#6B7280', fontSize: 13 }}>
                    Loading workflows…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center" style={{ color: '#6B7280', fontSize: 13 }}>
                    No workflows found
                  </td>
                </tr>
              ) : filtered.map((w, i) => (
                <tr
                  key={w.id}
                  style={{ background: i % 2 === 0 ? '#13131F' : '#0D0D14', borderTop: '1px solid #1E1E30', height: 48 }}
                >
                  <td className="px-5" style={{ color: '#F4F4F8', fontSize: 13, fontWeight: 500 }}>
                    {w.title}
                  </td>
                  <td className="px-5" style={{ color: '#9CA3AF', fontSize: 13, textTransform: 'capitalize' }}>
                    {w.category.replace(/_/g, ' ')}
                  </td>
                  <td className="px-5" style={{ color: '#F4F4F8', fontSize: 13 }}>
                    ${(w.price_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-5">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="px-5">
                    {w.published
                      ? <Check size={16} style={{ color: '#10B981' }} />
                      : <X size={16} style={{ color: '#EF4444' }} />
                    }
                  </td>
                  <td className="px-5" style={{ color: '#9CA3AF', fontSize: 13 }}>
                    {new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(w)}
                        title="Edit"
                        style={{
                          height: 28,
                          width: 28,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                          background: 'rgba(124,58,237,0.1)',
                          color: '#7C3AED',
                        }}
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => togglePublish(w)}
                        title={w.published ? 'Unpublish' : 'Publish'}
                        style={{
                          height: 28,
                          width: 28,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 6,
                          border: 'none',
                          cursor: 'pointer',
                          background: w.published ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                          color: w.published ? '#EF4444' : '#10B981',
                        }}
                      >
                        {w.published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      {confirmDeleteId === w.id ? (
                        <>
                          <button
                            onClick={() => handleDelete(w.id)}
                            title="Confirm delete"
                            style={{
                              height: 28,
                              width: 28,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 6,
                              border: 'none',
                              cursor: 'pointer',
                              background: 'rgba(239,68,68,0.15)',
                              color: '#EF4444',
                            }}
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            title="Cancel delete"
                            style={{
                              height: 28,
                              width: 28,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 6,
                              border: 'none',
                              cursor: 'pointer',
                              background: 'rgba(107,114,128,0.15)',
                              color: '#6B7280',
                            }}
                          >
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(w.id)}
                          title="Delete"
                          style={{
                            height: 28,
                            width: 28,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                            background: 'rgba(239,68,68,0.1)',
                            color: '#EF4444',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <WorkflowFormModal
          workflow={editing}
          onClose={closeModal}
          onSaved={invalidate}
        />
      )}
    </AdminLayout>
  );
}
