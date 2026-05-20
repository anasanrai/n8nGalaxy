import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import type { BlogPost } from '../types';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = useQuery<BlogPost | null>({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();
      if (error) throw error;
      return data as BlogPost | null;
    },
    enabled: !!slug,
  });

  const { data: related } = useQuery<BlogPost[]>({
    queryKey: ['blog-related', post?.category, post?.id],
    queryFn: async () => {
      if (!post) return [];
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .eq('category', post.category)
        .neq('id', post.id)
        .order('created_at', { ascending: false })
        .limit(3);
      return (data ?? []) as BlogPost[];
    },
    enabled: !!post,
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://n8ngalaxy.com/blog/${slug}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-text-secondary" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-text-primary">
        <Navbar />
        <main className="flex-1 flex items-center justify-center flex-col gap-4 pt-[96px]">
          <h1 className="font-display font-bold text-[28px]">Post not found</h1>
          <button onClick={() => navigate('/blog')} className="text-primary hover:underline font-sans text-[14px]">
            ← Back to Blog
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      {/* SEO meta tags via document title */}
      {typeof document !== 'undefined' && (document.title = `${post.title} — n8nGalaxy Blog`)}

      <div className="min-h-screen flex flex-col bg-background text-text-primary">
        <Navbar />
        <main className="flex-1 pt-[96px] pb-[80px] px-6">
          <div className="max-w-[760px] mx-auto">

            {/* Back */}
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-sans text-[14px] mb-8 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </button>

            {/* Category */}
            <span className="inline-flex items-center h-[22px] px-3 rounded-[4px] bg-primary/10 border border-primary/20 text-primary font-sans font-medium text-[11px] uppercase tracking-wide mb-6">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="font-display font-extrabold text-[40px] leading-tight mb-4">{post.title}</h1>

            {/* Meta */}
            <div className="flex items-center gap-4 text-[13px] text-text-tertiary mb-10 pb-10 border-b border-border">
              <span>{formatDate(post.created_at)}</span>
              <span>·</span>
              <span>{Math.ceil(post.content.split(' ').length / 200)} min read</span>
            </div>

            {/* Featured image */}
            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full rounded-card mb-10 object-cover max-h-[400px]"
              />
            )}

            {/* Content — rendered as preformatted prose */}
            <div className="prose-lg text-text-secondary leading-relaxed whitespace-pre-wrap font-sans text-[16px]">
              {post.content}
            </div>

            {/* Share */}
            <div className="mt-12 pt-8 border-t border-border flex items-center gap-4">
              <span className="font-sans font-medium text-[14px] text-text-secondary">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-[36px] px-4 rounded-input bg-surface border border-border hover:border-primary/40 text-text-secondary hover:text-text-primary transition-colors text-[13px] font-sans font-medium"
              >
                Twitter/X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-[36px] px-4 rounded-input bg-surface border border-border hover:border-primary/40 text-text-secondary hover:text-text-primary transition-colors text-[13px] font-sans font-medium flex items-center"
              >
                LinkedIn
              </a>
            </div>

          </div>

          {/* Related posts */}
          {related && related.length > 0 && (
            <div className="max-w-[1100px] mx-auto mt-16">
              <h2 className="font-display font-bold text-[24px] text-text-primary mb-6">Related Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((r) => (
                  <article
                    key={r.id}
                    onClick={() => navigate(`/blog/${r.slug}`)}
                    className="bg-surface border border-border rounded-card p-6 cursor-pointer hover:border-primary/40 transition-colors group"
                  >
                    <span className="inline-flex items-center h-[20px] px-2 rounded-[4px] bg-primary/10 border border-primary/20 text-primary font-sans font-medium text-[11px] uppercase tracking-wide mb-3">
                      {r.category}
                    </span>
                    <h3 className="font-display font-bold text-[16px] text-text-primary group-hover:text-primary transition-colors leading-snug mb-2">
                      {r.title}
                    </h3>
                    <p className="font-sans text-[12px] text-text-tertiary">{formatDate(r.created_at)}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
