import { notFound } from "next/navigation";
import { getBlogPostAction, getRelatedPostsAction } from "~/lib/blog-actions";
import Container from "~/components/ui/container";
import BlogPostClient from "~/components/blog/blog-post-client";
import MDXRenderer from "~/components/ui/mdx-renderer";
import Card from "~/components/ui/card";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;

  const [post, relatedPosts] = await Promise.all([
    getBlogPostAction(resolvedParams.slug),
    getRelatedPostsAction(resolvedParams.slug),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-32 pb-24">
      <Container maxWidth="lg">
        <BlogPostClient
          post={post}
          relatedPosts={relatedPosts}
          contentSlot={
            <Card className="p-8">
              <MDXRenderer source={post.content} />
            </Card>
          }
        />
      </Container>
    </div>
  );
}
