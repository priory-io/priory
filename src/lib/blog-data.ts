import { BlogPost } from "~/types/blog";

export const sampleBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Building the Future of Open Source Collaboration",
    excerpt:
      "Exploring how modern tools and practices are reshaping the way we contribute to open source projects, making collaboration more accessible and efficient than ever before.",
    content: `# Building the Future of Open Source Collaboration

Open source software has always been about community and collaboration. But as the ecosystem grows, we need better tools and practices to support the millions of developers contributing to projects worldwide.

## The Evolution of Collaboration

The traditional model of open source contribution has served us well, but it's time to evolve. Modern developers expect seamless workflows, intuitive interfaces, and instant feedback.

### Key Challenges

- **Discovery**: Finding the right projects to contribute to
- **Onboarding**: Getting new contributors up to speed quickly
- **Communication**: Coordinating across time zones and cultures
- **Quality**: Maintaining code standards at scale

## Our Vision

At Priory, we're building tools that address these challenges head-on. Our platform focuses on making open source contribution as frictionless as possible while maintaining the quality and community spirit that makes open source special.

### What We're Building

1. **Intelligent Project Matching**: Connect developers with projects that match their skills and interests
2. **Streamlined Onboarding**: Automated setup and guided contribution flows
3. **Real-time Collaboration**: Modern communication tools built for developers
4. **Quality Assurance**: AI-powered code review and testing

## The Road Ahead

The future of open source is bright, but it requires intentional effort to make it accessible to everyone. We're committed to building the tools and community that will make this vision a reality.

Join us on this journey. The best is yet to come.`,
    author: {
      name: "Keiran",
      avatar: "/avatars/keiran.jpg",
      bio: "Founder of Priory, passionate about open source and developer tools.",
    },
    publishedAt: "2024-01-15T10:00:00Z",
    tags: ["open-source", "collaboration", "developer-tools"],
    readingTime: 4,
    featured: true,
    slug: "building-future-open-source-collaboration",
  },
  {
    id: "2",
    title: "The Art of Code Review in Modern Development",
    excerpt:
      "Code review is more than just catching bugs. Learn how to provide meaningful feedback that improves code quality and helps teams grow together.",
    content: `# The Art of Code Review in Modern Development

Code review has evolved from a simple quality gate to a crucial practice for team learning, knowledge sharing, and maintaining code standards. Done well, it creates better software and stronger teams.

## Why Code Review Matters

Code review serves multiple purposes beyond finding bugs:

- **Knowledge Transfer**: Sharing domain knowledge across the team
- **Skill Development**: Learning from each other's approaches
- **Code Consistency**: Maintaining team standards and patterns
- **Bug Prevention**: Catching issues before they reach production

## Best Practices for Reviewers

### Be Constructive
Focus on the code, not the person. Phrase feedback as questions or suggestions rather than commands.

**Good**: "What do you think about extracting this logic into a separate function?"
**Better**: "Consider extracting this logic for better readability."

### Explain the Why
Don't just point out what's wrong—explain why it matters and suggest alternatives.

### Review Thoroughly but Efficiently
Take time to understand the context, but don't let perfect be the enemy of good.

## Best Practices for Authors

### Write Clear Descriptions
Help reviewers understand what you're trying to achieve and why you made certain decisions.

### Keep Changes Focused
Smaller, focused pull requests are easier to review and less likely to introduce bugs.

### Respond Constructively
View feedback as an opportunity to learn and improve, not as criticism.

## Building a Review Culture

The best teams treat code review as a collaborative learning experience. Foster an environment where:

- Questions are welcomed
- Different approaches are discussed
- Learning is prioritized over ego
- Feedback is specific and actionable

Remember: we're all here to build great software together.`,
    author: {
      name: "Alex Chen",
      avatar: "/avatars/alex.jpg",
      bio: "Senior Engineer passionate about code quality and team dynamics.",
    },
    publishedAt: "2024-01-20T14:30:00Z",
    tags: ["code-review", "best-practices", "team-culture"],
    readingTime: 3,
    featured: false,
    slug: "art-of-code-review-modern-development",
  },
  {
    id: "3",
    title: "TypeScript Patterns for Better React Development",
    excerpt:
      "Discover advanced TypeScript patterns that make React development more robust, maintainable, and enjoyable. From generic components to utility types.",
    content: `# TypeScript Patterns for Better React Development

TypeScript and React are a powerful combination, but mastering their integration requires understanding some key patterns. Let's explore techniques that will make your React code more type-safe and maintainable.

## Generic Components

Generic components are incredibly powerful for creating reusable UI elements:

\`\`\`typescript
interface SelectProps<T> {
  items: T[];
  value: T;
  onChange: (value: T) => void;
  renderItem: (item: T) => React.ReactNode;
}

function Select<T>({ items, value, onChange, renderItem }: SelectProps<T>) {
  return (
    <select onChange={(e) => onChange(items[e.target.selectedIndex])}>
      {items.map((item, index) => (
        <option key={index} value={index}>
          {renderItem(item)}
        </option>
      ))}
    </select>
  );
}
\`\`\`

## Utility Types for Props

Create flexible prop interfaces using TypeScript's utility types:

\`\`\`typescript
type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface BaseButtonProps {
  variant: ButtonVariant;
  children: React.ReactNode;
}

type ButtonProps = BaseButtonProps & 
  (
    | { href: string; onClick?: never }
    | { href?: never; onClick: () => void }
  );
\`\`\`

## Discriminated Unions for State

Model complex state with discriminated unions:

\`\`\`typescript
type AsyncState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

function DataComponent() {
  const [state, setState] = useState<AsyncState<User>>({ status: 'idle' });
  
  switch (state.status) {
    case 'loading':
      return <LoadingSpinner />;
    case 'success':
      return <UserProfile user={state.data} />;
    case 'error':
      return <ErrorMessage error={state.error} />;
    default:
      return <LoadDataButton onClick={loadData} />;
  }
}
\`\`\`

## Conditional Props

Create components with conditional props based on other prop values:

\`\`\`typescript
type ConditionalProps<T> = T extends { multiselect: true }
  ? { value: string[]; onChange: (value: string[]) => void }
  : { value: string; onChange: (value: string) => void };

type InputProps<T = {}> = T & ConditionalProps<T> & {
  multiselect?: boolean;
};
\`\`\`

These patterns help create components that are both flexible and type-safe, making your development experience smoother and your code more maintainable.`,
    author: {
      name: "Sarah Kim",
      avatar: "/avatars/sarah.jpg",
      bio: "TypeScript enthusiast and React core team member.",
    },
    publishedAt: "2024-01-25T09:15:00Z",
    tags: ["typescript", "react", "patterns", "development"],
    readingTime: 5,
    featured: true,
    slug: "typescript-patterns-better-react-development",
  },
  {
    id: "4",
    title: "Optimizing Web Performance with Modern Techniques",
    excerpt:
      "Learn practical strategies for improving web performance using the latest browser APIs, optimization techniques, and monitoring tools.",
    content: `# Optimizing Web Performance with Modern Techniques

Web performance directly impacts user experience, conversion rates, and SEO rankings. Let's explore modern techniques for building fast, responsive web applications.

## Core Web Vitals

Focus on the metrics that matter most:

### Largest Contentful Paint (LCP)
Optimize your largest content element to load within 2.5 seconds:

- Use optimized images (WebP, AVIF)
- Implement critical resource hints
- Optimize server response times

### First Input Delay (FID)
Keep your main thread responsive:

- Break up long tasks with scheduling
- Use web workers for heavy computations
- Optimize JavaScript execution

### Cumulative Layout Shift (CLS)
Prevent unexpected layout shifts:

- Set explicit dimensions for images and videos
- Reserve space for dynamic content
- Use CSS transforms instead of layout-changing properties

## Image Optimization

Modern image optimization goes beyond compression:

\`\`\`html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero image" loading="lazy">
</picture>
\`\`\`

## JavaScript Optimization

### Code Splitting
Split your JavaScript bundles for faster initial loads:

\`\`\`typescript
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <LazyComponent />
    </Suspense>
  );
}
\`\`\`

### Tree Shaking
Eliminate dead code from your bundles by using ES modules and tools like Webpack or Vite.

## Resource Loading

### Preloading Critical Resources
\`\`\`html
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/hero.woff2" as="font" type="font/woff2" crossorigin>
\`\`\`

### Service Workers
Cache resources and provide offline functionality:

\`\`\`typescript
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(response => 
        response || fetch(event.request)
      )
    );
  }
});
\`\`\`

## Monitoring and Measurement

Use tools like:
- Lighthouse for comprehensive audits
- WebPageTest for detailed performance analysis
- Real User Monitoring (RUM) for production insights

Remember: measure first, optimize second. Focus on the biggest impact improvements for your specific use case.`,
    author: {
      name: "Mike Rodriguez",
      avatar: "/avatars/mike.jpg",
      bio: "Performance engineer with a passion for fast web experiences.",
    },
    publishedAt: "2024-01-30T16:45:00Z",
    tags: ["performance", "optimization", "web-vitals", "javascript"],
    readingTime: 6,
    featured: false,
    slug: "optimizing-web-performance-modern-techniques",
  },
];

export function getBlogPosts(): BlogPost[] {
  return sampleBlogPosts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getFeaturedPosts(): BlogPost[] {
  return sampleBlogPosts.filter((post) => post.featured);
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return sampleBlogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const currentPost = getBlogPost(currentSlug);
  if (!currentPost) return [];

  return sampleBlogPosts
    .filter(
      (post) =>
        post.slug !== currentSlug &&
        post.tags.some((tag) => currentPost.tags.includes(tag)),
    )
    .slice(0, limit);
}
