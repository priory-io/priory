"use client";

import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import Grid from "~/components/ui/grid";
import BlogCard from "~/components/blog/blog-card";
import { useBlogPosts } from "~/hooks/useBlogPosts";

export default function BlogPage() {
  const { posts: allPosts, loading, error } = useBlogPosts();
  const featuredPosts = allPosts.filter((post) => post.featured);
  const recentPosts = allPosts.filter((post) => !post.featured);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24">
        <Container>
          <div className="text-center space-y-6">
            <Typography
              variant="h1"
              className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
            >
              Blog
            </Typography>
            <Typography variant="lead" className="max-w-3xl mx-auto">
              Loading posts...
            </Typography>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 pb-24">
        <Container>
          <div className="text-center space-y-6">
            <Typography
              variant="h1"
              className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
            >
              Blog
            </Typography>
            <Typography
              variant="lead"
              className="max-w-3xl mx-auto text-red-500"
            >
              {error}
            </Typography>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <Container>
        <div className="space-y-16">
          <div className="text-center space-y-6">
            <Typography
              variant="h1"
              className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
            >
              Blog
            </Typography>
            <Typography variant="lead" className="max-w-3xl mx-auto">
              Insights, tutorials, and thoughts on open source development,
              modern web technologies, and building better software together.
            </Typography>
          </div>

          {featuredPosts.length > 0 && (
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                <Typography variant="h3">Featured Posts</Typography>
              </div>

              <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap="lg">
                {featuredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} featured />
                ))}
              </Grid>
            </section>
          )}

          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
              <Typography variant="h3">Recent Posts</Typography>
            </div>

            <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap="lg">
              {recentPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </Grid>
          </section>

          {allPosts.length === 0 && (
            <div className="text-center py-24 space-y-4">
              <Typography variant="h3" className="text-muted-foreground">
                No posts yet
              </Typography>
              <Typography variant="muted">
                Check back soon for new content!
              </Typography>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
