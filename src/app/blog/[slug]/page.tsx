import { notFound } from "next/navigation";
import { getBlogPost, getBlogPosts, getRelatedPosts } from "~/lib/blog-data";
import Container from "~/components/ui/container";
import BlogPostClient from "~/components/blog/blog-post-client";
import MDXRenderer from "~/components/ui/mdx-renderer";
import Card from "~/components/ui/card";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;

  const post = getBlogPost(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(resolvedParams.slug);

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
