import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import type { BlogPost } from '../types';
import { Loader2, BookOpen } from 'lucide-react';

const CATEGORIES = ['All', 'n8n tutorials', 'AI automation', 'workflow templates'];

export default function Blog() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const { data: posts, isLoading, isError } = useQuery<BlogPost[]>({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });

  const filtered = posts?.filter(
    (p) => activeCategory === 'All' || p.category === activeCategory
  );

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <Navbar />
      <main className="flex-1 pt-[96px] pb-[80px] px-6">
        <div className="max-w-[1100px] mx-auto">

          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="font-display font-extrabold text-[48px] mb-4">Blog</h1>
            <p className="font-sans text-[18px] text-text-secondary max-w-[480px] mx-auto">
              n8n tutorials, AI automation guides, and workflow templates from the n8nGalaxy team.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`h-[36px] px-5 rounded-input text-[13px] font-sans font-medium transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-24 gap-3 text-text-secondary">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading posts...
            </div>
          )}

          {/* Error / no table yet → coming soon */}
          {(isError || (!isLoading && posts?.length === 0)) && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <BookOpen className="w-12 h-12 text-text-tertiary mb-6" />
              <h2 className="font-display font-bold text-[24px] text-text-primary mb-3">
                Coming Soon
              </h2>
              <p className="font-sans text-[15px] text-text-secondary mb-8 max-w-[400px]">
                We're writing our first posts. Subscribe to get notified when they go live.
              </p>
              <a
                href="mailto:hello@n8ngalaxy.com?subject=Blog newsletter signup"
                className="h-[44px] px-8 bg-primary hover:bg-primary-hover text-white font-sans font-semibold text-[15px] rounded-input transition-colors"
              >
                Notify me →
              </a>
            </div>
          )}

          {/* Grid */}
          {filtered && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post) => (
                <article
                  key={post.id}
                  onClick={() => navigate(`/blog/${post.slug}`)}
                  className="bg-surface border border-border rounded-card overflow-hidden cursor-pointer hover:border-primary/40 transition-colors group"
                >
                  {post.featured_image_url && (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-[180px] object-cover"
                    />
                  )}
                  <div className="p-6">
                    <span className="inline-flex items-center h-[20px] px-2 rounded-[4px] bg-primary/10 border border-primary/20 text-primary font-sans font-medium text-[11px] uppercase tracking-wide mb-4">
                      {post.category}
                    </span>
                    <h2 className="font-display font-bold text-[18px] text-text-primary mb-3 group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="font-sans text-[14px] text-text-secondary leading-relaxed mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                    <p className="font-sans text-[12px] text-text-tertiary">{formatDate(post.created_at)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
