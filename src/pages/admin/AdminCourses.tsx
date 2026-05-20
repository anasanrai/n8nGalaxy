import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../../components/admin/AdminLayout';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatRelativeTime } from '../../lib/formatters';
import { Search, Plus, Edit3, Trash2, Eye, EyeOff, Loader2, BookOpen } from 'lucide-react';
import type { Course } from '../../types';

const PAGE_SIZE = 20;

const DIFFICULTY_STYLES: Record<string, { bg: string; color: string }> = {
  beginner:     { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
  intermediate: { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B' },
  advanced:     { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444' },
};

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const s = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.beginner;
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
      {difficulty}
    </span>
  );
}

interface FormData {
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  price_cents: number;
  lesson_count: number;
  published: boolean;
}

const EMPTY_FORM: FormData = {
  title: '',
  slug: '',
  description: '',
  difficulty: 'beginner',
  price_cents: 0,
  lesson_count: 0,
  published: false,
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function CourseFormModal({
  course,
  onClose,
  onSaved,
}: {
  course?: Course;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormData>(
    course
      ? {
          title: course.title,
          slug: course.slug,
          description: course.description ?? '',
          difficulty: course.difficulty,
          price_cents: course.price_cents,
          lesson_count: course.lesson_count,
          published: course.published,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);

  const set = (key: keyof FormData, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleTitleChange = (val: string) => {
    setForm((f) => ({
      ...f,
      title: val,
      slug: course ? f.slug : slugify(val),
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title.trim()),
        description: form.description.trim() || null,
        difficulty: form.difficulty,
        price_cents: form.price_cents,
        lesson_count: form.lesson_count,
        published: form.published,
      };

      const table = supabase.from('courses') as any;
      if (course) {
        await table.update(payload).eq('id', course.id);
      } else {
        await table.insert(payload);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-xl w-full max-w-lg"
        style={{
          background: '#13131F',
          border: '1px solid #1E1E30',
          padding: 28,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <h2
          style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: 20,
            color: '#F4F4F8',
            marginBottom: 24,
          }}
        >
          {course ? 'Edit Course' : 'Add Course'}
        </h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Title <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                padding: '0 12px',
                borderRadius: 8,
                border: '1px solid #1E1E30',
                background: '#0D0D14',
                color: '#F4F4F8',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Slug */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Slug
            </label>
            <input
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              style={{
                width: '100%',
                height: 38,
                padding: '0 12px',
                borderRadius: 8,
                border: '1px solid #1E1E30',
                background: '#0D0D14',
                color: '#F4F4F8',
                fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #1E1E30',
                background: '#0D0D14',
                color: '#F4F4F8',
                fontSize: 13,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Difficulty */}
          <div>
            <label style={{ display: 'block', color: '#9CA3AF', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Difficulty
            </label>
            <select
              value={form.difficulty}
              onChange={(e) => set('difficulty', e.target.value)}
              style={{
                width: '100%',
                height: 38,
                padding: '0 12px',
                borderRadius: 8,
                border: '1px solid #1E1E30',
                background: '#0D0D14',
                color: '#F4F4F8',
                fontSize: 13,
                outline: 'none',
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Price & Lesson count */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Price (cents)
              </label>
              <input
                type="number"
                min={0}
                value={form.price_cents}
                onChange={(e) => set('price_cents', Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: '1px solid #1E1E30',
                  background: '#0D0D14',
                  color: '#F4F4F8',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            <div className="flex-1">
              <label style={{ display: 'block', color: '#9CA3AF', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                Lessons
              </label>
              <input
                type="number"
                min={0}
                value={form.lesson_count}
                onChange={(e) => set('lesson_count', Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: '100%',
                  height: 38,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: '1px solid #1E1E30',
                  background: '#0D0D14',
                  color: '#F4F4F8',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Published */}
          <label
            className="flex items-center gap-3"
            style={{ cursor: 'pointer', color: '#9CA3AF', fontSize: 13 }}
          >
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set('published', e.target.checked)}
              style={{ accentColor: '#7C3AED' }}
            />
            Published
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 8,
              border: '1px solid #1E1E30',
              background: 'transparent',
              color: '#9CA3AF',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            style={{
              height: 36,
              padding: '0 16px',
              borderRadius: 8,
              border: 'none',
              background: saving ? '#4B5563' : '#7C3AED',
              color: '#F4F4F8',
              fontSize: 13,
              fontWeight: 600,
              cursor: saving || !form.title.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {saving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
            {course ? 'Save Changes' : 'Create Course'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCourses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<Course | null>(null);

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ['admin', 'courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Course[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
  };

  const togglePublished = async (course: Course) => {
    await (supabase.from('courses') as any)
      .update({ published: !course.published })
      .eq('id', course.id);
    invalidate();
  };

  const deleteCourse = async (course: Course) => {
    await (supabase.from('courses') as any).delete().eq('id', course.id);
    setConfirmDelete(null);
    invalidate();
  };

  const openAdd = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditing(course);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(undefined);
  };

  const handleSaved = () => {
    closeModal();
    invalidate();
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => c.title.toLowerCase().includes(q));
  }, [courses, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = useMemo(
    () => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filtered, page],
  );

  return (
    <AdminLayout activePage={'courses'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          style={{
            fontFamily: '"Syne", sans-serif',
            fontWeight: 800,
            fontSize: 28,
            color: '#F4F4F8',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <BookOpen size={22} color="#7C3AED" />
          Courses
        </h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B7280',
              }}
            />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search by title…"
              style={{
                width: 220,
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
            onClick={openAdd}
            style={{
              height: 36,
              padding: '0 14px',
              borderRadius: 8,
              border: 'none',
              background: '#7C3AED',
              color: '#F4F4F8',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Plus size={15} />
            Add Course
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: '#13131F', border: '1px solid #1E1E30' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr
                style={{
                  background: '#0D0D14',
                  color: '#6B7280',
                  fontSize: 11,
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {['Title', 'Difficulty', 'Price', 'Lessons', 'Published', 'Created', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3" style={{ whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center"
                    style={{ color: '#6B7280', fontSize: 13 }}
                  >
                    Loading courses…
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center"
                    style={{ color: '#6B7280', fontSize: 13 }}
                  >
                    {search ? 'No courses match your search' : 'No courses yet'}
                  </td>
                </tr>
              ) : (
                paged.map((c, i) => (
                  <tr
                    key={c.id}
                    style={{
                      background: i % 2 === 0 ? '#13131F' : '#0D0D14',
                      borderTop: '1px solid #1E1E30',
                      height: 48,
                    }}
                  >
                    <td
                      className="px-5"
                      style={{ color: '#F4F4F8', fontSize: 13, fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {c.title}
                    </td>
                    <td className="px-5">
                      <DifficultyBadge difficulty={c.difficulty} />
                    </td>
                    <td className="px-5" style={{ color: '#F4F4F8', fontSize: 13, fontWeight: 600 }}>
                      {formatCurrency(c.price_cents)}
                    </td>
                    <td className="px-5" style={{ color: '#9CA3AF', fontSize: 13 }}>
                      {c.lesson_count}
                    </td>
                    <td className="px-5">
                      {c.published ? (
                        <Eye size={16} style={{ color: '#10B981' }} />
                      ) : (
                        <EyeOff size={16} style={{ color: '#6B7280' }} />
                      )}
                    </td>
                    <td className="px-5" style={{ color: '#9CA3AF', fontSize: 13 }}>
                      {formatRelativeTime(c.created_at)}
                    </td>
                    <td className="px-5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
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
                          onClick={() => togglePublished(c)}
                          title={c.published ? 'Unpublish' : 'Publish'}
                          style={{
                            height: 28,
                            width: 28,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 6,
                            border: 'none',
                            cursor: 'pointer',
                            background: c.published
                              ? 'rgba(245,158,11,0.1)'
                              : 'rgba(16,185,129,0.1)',
                            color: c.published ? '#F59E0B' : '#10B981',
                          }}
                        >
                          {c.published ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(c)}
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
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span style={{ color: '#6B7280', fontSize: 12 }}>
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                height: 32,
                padding: '0 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid #1E1E30',
                background: '#13131F',
                color: page === 0 ? '#4B5563' : '#F4F4F8',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                height: 32,
                padding: '0 14px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid #1E1E30',
                background: '#13131F',
                color: page >= totalPages - 1 ? '#4B5563' : '#F4F4F8',
                cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <CourseFormModal
          course={editing}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmDelete(null); }}
        >
          <div
            className="rounded-xl"
            style={{
              background: '#13131F',
              border: '1px solid #1E1E30',
              padding: 28,
              width: 400,
              maxWidth: '90vw',
            }}
          >
            <h3
              style={{
                fontFamily: '"Syne", sans-serif',
                fontWeight: 800,
                fontSize: 18,
                color: '#F4F4F8',
                marginBottom: 8,
              }}
            >
              Delete Course
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong style={{ color: '#F4F4F8' }}>{confirmDelete.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  height: 36,
                  padding: '0 16px',
                  borderRadius: 8,
                  border: '1px solid #1E1E30',
                  background: 'transparent',
                  color: '#9CA3AF',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCourse(confirmDelete)}
                style={{
                  height: 36,
                  padding: '0 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#EF4444',
                  color: '#F4F4F8',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
