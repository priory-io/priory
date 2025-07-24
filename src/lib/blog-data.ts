import { BlogPost } from "~/types/blog";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const blogDirectory = path.join(process.cwd(), "content/blog");

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getBlogPosts(): BlogPost[] {
  if (!fs.existsSync(blogDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(blogDirectory);
  const posts: BlogPost[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith(".mdx")) continue;

    const fullPath = path.join(blogDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const slug = fileName.replace(/\.mdx$/, "");
    const readingTime = data["readingTime"] || calculateReadingTime(content);

    posts.push({
      id: slug,
      title: data["title"],
      excerpt: data["excerpt"],
      content,
      publishedAt: data["date"] || data["publishedAt"],
      updatedAt: data["updatedAt"],
      tags: data["tags"] || [],
      readingTime,
      featured: data["featured"] || false,
      slug,
    });
  }

  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getFeaturedPosts(): BlogPost[] {
  return getBlogPosts().filter((post) => post.featured);
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return getBlogPosts().find((post) => post.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const currentPost = getBlogPost(currentSlug);
  if (!currentPost) return [];

  return getBlogPosts()
    .filter(
      (post) =>
        post.slug !== currentSlug &&
        post.tags.some((tag) => currentPost.tags.includes(tag)),
    )
    .slice(0, limit);
}
