"use server";

import { BlogPost } from "~/types/blog";
import {
  getBlogPosts,
  getFeaturedPosts,
  getBlogPost,
  getRelatedPosts,
} from "~/lib/blog-data";

export async function getBlogPostsAction(): Promise<BlogPost[]> {
  return getBlogPosts();
}

export async function getFeaturedPostsAction(): Promise<BlogPost[]> {
  return getFeaturedPosts();
}

export async function getBlogPostAction(
  slug: string,
): Promise<BlogPost | undefined> {
  return getBlogPost(slug);
}

export async function getRelatedPostsAction(
  currentSlug: string,
  limit = 3,
): Promise<BlogPost[]> {
  return getRelatedPosts(currentSlug, limit);
}
