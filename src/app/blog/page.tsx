"use client";

import { motion } from "framer-motion";
import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import Grid from "~/components/ui/grid";
import BlogCard from "~/components/blog/blog-card";
import { getBlogPosts } from "~/lib/blog-data";
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

async function getStaticBlogData() {
  const allPosts = getBlogPosts();
  const featuredPosts = allPosts.filter((post) => post.featured);
  const recentPosts = allPosts.filter((post) => !post.featured);
  return { allPosts, featuredPosts, recentPosts };
}

interface BlogPageProps {
  allPosts: BlogPost[];
  featuredPosts: BlogPost[];
  recentPosts: BlogPost[];
}

function BlogPageClient({
  allPosts,
  featuredPosts,
  recentPosts,
}: BlogPageProps) {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <Container>
        <motion.div
          className="space-y-16"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp} className="text-center space-y-6">
            <Typography
              variant="h1"
              className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
            >
              Blog
            </Typography>
            <Typography variant="lead" className="max-w-3xl mx-auto">
              Just a space for me to dump my thoughts on tech, anime and more.
            </Typography>
          </motion.div>

          {featuredPosts.length > 0 && (
            <motion.section variants={fadeInUp} className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                <Typography variant="h3">Featured Posts</Typography>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap="lg">
                  {featuredPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      variants={cardVariants}
                      transition={{ delay: index * 0.1 }}
                    >
                      <BlogCard post={post} featured />
                    </motion.div>
                  ))}
                </Grid>
              </motion.div>
            </motion.section>
          )}

          <motion.section variants={fadeInUp} className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
              <Typography variant="h3">Recent Posts</Typography>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <Grid cols={1} responsive={{ md: 2, lg: 3 }} gap="lg">
                {recentPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    variants={cardVariants}
                    transition={{ delay: index * 0.1 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))}
              </Grid>
            </motion.div>
          </motion.section>

          {allPosts.length === 0 && (
            <motion.div
              variants={fadeInUp}
              className="text-center py-24 space-y-4"
            >
              <Typography variant="h3" className="text-muted-foreground">
                No posts yet
              </Typography>
              <Typography variant="muted">
                Check back soon for new content!
              </Typography>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </div>
  );
}

export default async function BlogPage() {
  const { allPosts, featuredPosts, recentPosts } = await getStaticBlogData();

  return (
    <BlogPageClient
      allPosts={allPosts}
      featuredPosts={featuredPosts}
      recentPosts={recentPosts}
    />
  );
}
