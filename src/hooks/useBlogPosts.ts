"use client";

import { useState, useEffect } from "react";
import { BlogPost, BlogFilter } from "~/types/blog";
import { getBlogPosts } from "~/lib/blog-data";

export function useBlogPosts(filter?: BlogFilter) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      let allPosts = getBlogPosts();

      if (filter) {
        if (filter.featured !== undefined) {
          allPosts = allPosts.filter(
            (post) => post.featured === filter.featured,
          );
        }

        if (filter.tag) {
          allPosts = allPosts.filter((post) =>
            post.tags.some((tag) =>
              tag.toLowerCase().includes(filter.tag!.toLowerCase()),
            ),
          );
        }

        if (filter.search) {
          const searchTerm = filter.search.toLowerCase();
          allPosts = allPosts.filter(
            (post) =>
              post.title.toLowerCase().includes(searchTerm) ||
              post.excerpt.toLowerCase().includes(searchTerm) ||
              post.content.toLowerCase().includes(searchTerm),
          );
        }
      }

      setPosts(allPosts);
      setError(null);
    } catch (err) {
      setError("Failed to load blog posts");
      console.error(`Failed to load blog posts: ${err}`);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  return { posts, loading, error };
}
