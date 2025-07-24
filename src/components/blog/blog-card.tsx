"use client";

import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { BlogPost } from "~/types/blog";
import { formatDate, formatRelativeDate } from "~/lib/blog-utils";
import { cn } from "~/lib/utils";
import Card from "~/components/ui/card";
import Typography from "~/components/ui/typography";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const cardClasses = cn(
    "group relative h-full",
    featured && "md:col-span-2 lg:col-span-2",
  );

  return (
    <div className={cardClasses}>
      <Link href={`/blog/${post.slug}`} className="block h-full">
        <div className="h-full transform transition-transform duration-300 hover:-translate-y-1">
          <Card
            padding="none"
            className="h-full overflow-hidden relative group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300 group-hover:border-primary/30"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-0 group-hover:opacity-60 transition-opacity duration-300 -z-10" />

            <div className="relative p-6 md:p-8 h-full flex flex-col bg-card/50 backdrop-blur-sm rounded-2xl border border-border transition-colors">
              {post.featured && (
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4 w-fit">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Featured
                </div>
              )}

              <div className="flex-grow">
                <Typography
                  variant={featured ? "h3" : "h4"}
                  className="mb-3 group-hover:text-primary transition-colors duration-200 leading-tight"
                >
                  {post.title}
                </Typography>

                <Typography
                  variant="muted"
                  className="mb-6 line-clamp-3 leading-relaxed"
                >
                  {post.excerpt}
                </Typography>
              </div>

              <div className="space-y-4 mt-auto">
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium bg-secondary/50 text-secondary-foreground rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 3 && (
                    <span className="px-3 py-1 text-xs font-medium text-muted-foreground">
                      +{post.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>{formatRelativeDate(post.publishedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span>{post.readingTime} min read</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-primary transition-all duration-200 group-hover:gap-2">
                    <span className="font-medium text-sm">Read more</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    Published {formatDate(post.publishedAt)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Link>
    </div>
  );
}
