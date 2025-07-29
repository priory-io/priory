export const animationVariants = {
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  },
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  },
};
