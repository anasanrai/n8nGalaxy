import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import type { BlogPost } from '../../types';
import { Plus, Edit3, Trash2, Eye, EyeOff, Loader2, X } from 'lucide-react';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CATEGORIES = ['n8n tutorials', 'AI automation', 'workflow templates', 'general'];

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'general',
  featured_image_url: '',
  published: false,
  featured: false,
};

type FormState = typeof emptyForm;

export default function AdminBlog() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['admin', 'blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        slug: editing.slug,
        excerpt: editing.excerpt ?? '',
        content: editing.content,
        category: editing.category,
        featured_image_url: editing.featured_image_url ?? '',
        published: editing.published,
        featured: editing.featured,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editing]);

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: editing ? f.slug : slugify(title) }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      setError('Title and slug are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const { error: err } = await (supabase.from('blog_posts') as any)
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq('id', editing.id);
        if (err) throw err;
      } else {
        const { error: err } = await (supabase.from('blog_posts') as any).insert(form);
        if (err) throw err;
      }
      qc.invalidateQueries({ queryKey: ['admin', 'blog-posts'] });
      setEditing(null);
      setCreating(false);
    } catch (e: any) {
      setError(e.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    await (supabase.from('blog_posts') as any).delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin', 'blog-posts'] });
  };

  const handleTogglePublish = async (post: BlogPost) => {
    await (supabase.from('blog_posts') as any)
      .update({ published: !post.published, updated_at: new Date().toISOString() })
      .eq('id', post.id);
    qc.invalidateQueries({ queryKey: ['admin', 'blog-posts'] });
  };

  const showForm = creating || !!editing;

  return (
    <AdminLayout activePage="blog">
      <div className="flex items-center justify-between mb-6">
        <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 800, fontSize: 28, color: '#F4F4F8' }}>
          Blog Posts
        </h1>
        <button
          onClick={() => { setCreating(true); setEditing(null); }}
          className="flex items-center gap-2 h-[36px] px-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
        >
          <Plus size={14} /> New Post
        </button>
      </div>

      {/* Form panel */}
      {showForm && (
        <div className="mb-8 p-6 rounded-xl" style={{ background: '#13131F', border: '1px solid #1E1E30' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ color: '#F4F4F8', fontWeight: 700, fontSize: 18 }}>
              {editing ? 'Edit Post' : 'New Post'}
            </h2>
            <button onClick={() => { setEditing(null); setCreating(false); }} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Title *</label>
              <input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full h-[40px] px-3 rounded-lg bg-[#0D0D14] border border-[#1E1E30] text-white text-[14px] focus:outline-none focus:border-[#7C3AED]"
                placeholder="Post title"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Slug *</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full h-[40px] px-3 rounded-lg bg-[#0D0D14] border border-[#1E1E30] text-white text-[14px] focus:outline-none focus:border-[#7C3AED] font-mono"
                placeholder="post-slug"
              />
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full h-[40px] px-3 rounded-lg bg-[#0D0D14] border border-[#1E1E30] text-white text-[14px] focus:outline-none focus:border-[#7C3AED] cursor-pointer"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Featured Image URL</label>
              <input
                value={form.featured_image_url}
                onChange={(e) => setForm((f) => ({ ...f, featured_image_url: e.target.value }))}
                className="w-full h-[40px] px-3 rounded-lg bg-[#0D0D14] border border-[#1E1E30] text-white text-[14px] focus:outline-none focus:border-[#7C3AED]"
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-[#0D0D14] border border-[#1E1E30] text-white text-[14px] focus:outline-none focus:border-[#7C3AED] resize-none"
              placeholder="Short description shown in the blog listing..."
            />
          </div>

          <div className="mb-4">
            <label className="block text-[11px] text-gray-500 uppercase tracking-wide mb-1">Content (Markdown)</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={12}
              className="w-full px-3 py-2 rounded-lg bg-[#0D0D14] border border-[#1E1E30] text-white text-[13px] focus:outline-none focus:border-[#7C3AED] resize-y font-mono"
              placeholder="Write your post in markdown or plain text..."
            />
          </div>

          <div className="flex items-center gap-6 mb-5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                className="w-4 h-4 accent-[#7C3AED] cursor-pointer"
              />
              <span className="text-gray-300 text-[13px]">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 accent-[#7C3AED] cursor-pointer"
              />
              <span className="text-gray-300 text-[13px]">Featured</span>
            </label>
          </div>

          {error && <p className="text-red-400 text-[13px] mb-4">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-[38px] px-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save Post'}
          </button>
        </div>
      )}

      {/* Posts table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 size={18} className="animate-spin" /> Loading...
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No blog posts yet. Create one above.</div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1E1E30' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: '#13131F', borderBottom: '1px solid #1E1E30' }}>
                {['Title', 'Category', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] uppercase tracking-wide text-gray-500 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} style={{ borderBottom: '1px solid #1E1E30', background: '#0D0D14' }}>
                  <td className="px-4 py-3">
                    <p className="text-white text-[14px] font-medium truncate max-w-[280px]">{post.title}</p>
                    <p className="text-gray-500 text-[12px] font-mono">{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-[13px]">{post.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 h-[20px] rounded text-[11px] font-bold uppercase"
                      style={post.published
                        ? { background: 'rgba(16,185,129,0.15)', color: '#10B981' }
                        : { background: 'rgba(107,114,128,0.15)', color: '#6B7280' }}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-[12px]">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditing(post); setCreating(false); }}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleTogglePublish(post)}
                        title={post.published ? 'Unpublish' : 'Publish'}
                        className="p-1.5 text-gray-500 hover:text-white transition-colors cursor-pointer"
                      >
                        {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        title="Delete"
                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
