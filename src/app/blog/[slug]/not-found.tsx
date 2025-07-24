"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Home } from "lucide-react";
import Container from "~/components/ui/container";
import Typography from "~/components/ui/typography";
import Button from "~/components/ui/button";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center justify-center">
      <Container maxWidth="md">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="text-center space-y-8"
        >
          <div className="space-y-4">
            <Typography
              variant="h1"
              className="text-8xl md:text-9xl font-mono text-primary"
            >
              404
            </Typography>
            <Typography variant="h2" className="text-muted-foreground">
              Post Not Found
            </Typography>
            <Typography variant="lead" className="max-w-xl mx-auto">
              The blog post you're looking for doesn't exist or may have been
              moved.
            </Typography>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button href="/blog" variant="primary" size="lg">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Blog</span>
            </Button>
            <Button href="/" variant="outline" size="lg">
              <Home className="w-5 h-5" />
              <span>Home Page</span>
            </Button>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}
