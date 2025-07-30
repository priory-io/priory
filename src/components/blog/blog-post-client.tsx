"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { formatDate, formatRelativeDate } from "~/lib/blog-utils";
import Typography from "~/components/ui/typography";
import Button from "~/components/ui/button";
import Card from "~/components/ui/card";
import BlogCard from "~/components/blog/blog-card";
import Grid from "~/components/ui/grid";
import ShareButton from "~/components/blog/share-button";
import { BlogPost } from "~/types/blog";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

interface BlogPostClientProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
  contentSlot: React.ReactNode;
}

export default function BlogPostClient({
  post,
  relatedPosts,
  contentSlot,
}: BlogPostClientProps) {
  return (
    <motion.div
      className="space-y-8"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={fadeInUp}>
        <Button variant="ghost" href="/blog" className="mb-8 -ml-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog</span>
        </Button>
      </motion.div>

      <motion.article className="space-y-8" variants={fadeInUp}>
        <header className="space-y-6">
          {post.featured && (
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium w-fit"
            >
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Featured Post
            </motion.div>
          )}

          <motion.div variants={fadeInUp}>
            <Typography variant="h1" className="leading-tight">
              {post.title}
            </Typography>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-wrap items-center gap-6 text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime} min read</span>
            </div>
            <ShareButton title={post.title} />
          </motion.div>

          <motion.div variants={fadeInUp} className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm font-medium bg-secondary/50 text-secondary-foreground rounded-full"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        </header>

        <motion.div variants={fadeInUp}>{contentSlot}</motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="p-6 border-l-4 border-l-primary">
            <div className="space-y-2">
              <Typography variant="muted" className="text-sm">
                Published {formatRelativeDate(post.publishedAt)}
              </Typography>
              <Typography variant="muted" className="text-sm">
                {post.readingTime} minute read
              </Typography>
            </div>
          </Card>
        </motion.div>
      </motion.article>

      {relatedPosts.length > 0 && (
        <motion.section variants={fadeInUp} className="pt-16 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
            <Typography variant="h3">Related Posts</Typography>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap="lg">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  variants={cardVariants}
                  transition={{ delay: index * 0.1 }}
                >
                  <BlogCard post={relatedPost} />
                </motion.div>
              ))}
            </Grid>
          </motion.div>
        </motion.section>
      )}
    </motion.div>
  );
}
