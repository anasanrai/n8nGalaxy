import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Upload, Loader2, Check } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const CATEGORIES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'hr', label: 'HR' },
  { value: 'devops', label: 'DevOps' },
  { value: 'ai_agents', label: 'AI Agents' },
  { value: 'other', label: 'Other' },
] as const;

export default function SubmitWorkflow() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tools, setTools] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = 'Title is required';
    if (!description.trim()) errors.description = 'Description is required';
    if (!category) errors.category = 'Please select a category';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    if (!user) { setError('You must be signed in to submit a workflow'); return; }

    setSubmitting(true);

    try {
      const { error: insertError } = await (supabase.from('submissions') as any).insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        category,
        file_url: fileUrl.trim() || null,
        tools: tools.split(',').map(t => t.trim()).filter(Boolean),
        status: 'pending',
      });

      if (insertError) throw insertError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit workflow');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-[640px] bg-surface border border-border rounded-card p-10 shadow-2xl text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-primary" />
            </div>
            <h2 className="text-[22px] font-sans font-semibold text-text-primary mb-3">
              Submission Received!
            </h2>
            <p className="text-[14px] font-sans text-text-secondary mb-8 max-w-md mx-auto leading-relaxed">
              Your workflow has been submitted for review! Our team will review it and you'll be notified once it's approved.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full h-[44px] bg-primary hover:bg-primary-hover text-white font-sans font-medium text-[14px] rounded-input transition-colors cursor-pointer max-w-[280px] mx-auto"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-start justify-center p-6 pt-12">
        <div className="w-full max-w-[640px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Upload size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-[22px] font-sans font-semibold text-text-primary">Submit Workflow</h1>
              <p className="text-[13px] font-sans text-text-tertiary">Share your workflow with the n8n community</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-secondary">
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="My Awesome Workflow"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setFieldErrors(prev => ({ ...prev, title: '' })); }}
                className={`w-full h-[44px] bg-background border ${fieldErrors.title ? 'border-danger' : 'border-border'} rounded-input px-[14px] text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors font-sans`}
              />
              {fieldErrors.title && <span className="text-danger text-[12px] font-sans">{fieldErrors.title}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-secondary">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                placeholder="Describe what your workflow does, how it works, and what problem it solves..."
                value={description}
                onChange={(e) => { setDescription(e.target.value); setFieldErrors(prev => ({ ...prev, description: '' })); }}
                className={`w-full h-[120px] bg-background border ${fieldErrors.description ? 'border-danger' : 'border-border'} rounded-input px-[14px] py-3 text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors font-sans resize-none`}
              />
              {fieldErrors.description && <span className="text-danger text-[12px] font-sans">{fieldErrors.description}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-secondary">
                Category <span className="text-danger">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setFieldErrors(prev => ({ ...prev, category: '' })); }}
                className={`w-full h-[44px] bg-background border ${fieldErrors.category ? 'border-danger' : 'border-border'} rounded-input px-[14px] text-[14px] text-text-primary focus:outline-none focus:border-primary transition-colors font-sans appearance-none cursor-pointer`}
              >
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {fieldErrors.category && <span className="text-danger text-[12px] font-sans">{fieldErrors.category}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-secondary">
                Tools Used
              </label>
              <input
                type="text"
                placeholder="HTTP Request, Slack, PostgreSQL, ..."
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                className="w-full h-[44px] bg-background border border-border rounded-input px-[14px] text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors font-sans"
              />
              <span className="text-text-tertiary text-[12px] font-sans">Comma-separated list of tools/nodes used</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-sans font-medium text-[13px] text-text-secondary">
                Workflow File URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/workflow.json"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full h-[44px] bg-background border border-border rounded-input px-[14px] text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary transition-colors font-sans"
              />
              <span className="text-text-tertiary text-[12px] font-sans">Optional — link to a downloadable workflow JSON file</span>
            </div>

            {error && <p className="text-danger text-[13px] font-sans">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-[44px] mt-2 bg-primary hover:bg-primary-hover text-white font-sans font-medium text-[14px] rounded-input transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
