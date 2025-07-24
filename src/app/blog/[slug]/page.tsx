"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import { getBlogPost, getRelatedPosts } from "~/lib/blog-data";
import { formatDate, formatRelativeDate } from "~/lib/blog-utils";
import { BlogPost } from "~/types/blog";
import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import BlogCard from "~/components/blog/blog-card";
import Grid from "~/components/ui/grid";
import MarkdownRenderer from "~/components/ui/markdown-renderer";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const { slug } = await params;
        const foundPost = getBlogPost(slug);

        if (!foundPost) {
          notFound();
        }

        setPost(foundPost);
        setRelatedPosts(getRelatedPosts(slug));
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24">
        <Container maxWidth="lg">
          <div className="space-y-8">
            <Button variant="ghost" href="/blog" className="mb-8 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </Button>
            <Typography variant="h1">Loading...</Typography>
          </div>
        </Container>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <Container maxWidth="lg">
        <div className="space-y-8">
          <div>
            <Button variant="ghost" href="/blog" className="mb-8 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </Button>
          </div>

          <article className="space-y-8">
            <header className="space-y-6">
              {post.featured && (
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium w-fit">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Featured Post
                </div>
              )}

              <Typography variant="h1" className="leading-tight">
                {post.title}
              </Typography>

              <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime} min read</span>
                </div>
                <Button variant="ghost" size="sm">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm font-medium bg-secondary/50 text-secondary-foreground rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            <Card className="p-8">
              <MarkdownRenderer content={post.content} />
            </Card>

            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold flex-shrink-0">
                  {post.author.name[0]}
                </div>
                <div className="space-y-2">
                  <div>
                    <Typography variant="h5">{post.author.name}</Typography>
                    <Typography variant="muted" className="text-sm">
                      Published {formatRelativeDate(post.publishedAt)}
                    </Typography>
                  </div>
                  {post.author.bio && (
                    <Typography variant="muted">{post.author.bio}</Typography>
                  )}
                </div>
              </div>
            </Card>
          </article>

          {relatedPosts.length > 0 && (
            <section className="pt-16 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                <Typography variant="h3">Related Posts</Typography>
              </div>

              <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap="lg">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} />
                ))}
              </Grid>
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}
