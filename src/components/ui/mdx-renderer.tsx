import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import { highlight } from "sugar-high";

interface CodeBlockProps {
  children: string;
  className?: string;
}

function CodeBlock({ children, className }: CodeBlockProps) {
  const codeHTML = highlight(children);

  return (
    <div className="mb-4">
      <pre className="p-4 bg-secondary/50 rounded-lg overflow-x-auto">
        <code
          className={`text-sm ${className || ""}`}
          dangerouslySetInnerHTML={{ __html: codeHTML }}
        />
      </pre>
    </div>
  );
}

const components = {
  code: ({ children, className }: { children: string; className?: string }) => {
    if (className?.includes("language-")) {
      return <CodeBlock className={className}>{children}</CodeBlock>;
    }
    return (
      <code className="px-1.5 py-0.5 text-sm bg-secondary/50 rounded">
        {children}
      </code>
    );
  },
  pre: ({ children }: { children: React.ReactNode }) => children,
  h1: ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-4xl font-bold tracking-tight mb-6">{children}</h1>
  ),
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-3xl font-semibold tracking-tight mb-4 mt-8">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-2xl font-semibold tracking-tight mb-3 mt-6">
      {children}
    </h3>
  ),
  h4: ({ children }: { children: React.ReactNode }) => (
    <h4 className="text-xl font-semibold tracking-tight mb-2 mt-4">
      {children}
    </h4>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="mb-4 text-foreground/90 leading-7">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="text-foreground/90">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="border-l-4 border-primary pl-6 py-2 mb-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="text-primary hover:text-primary/80 underline underline-offset-4"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
};

interface MDXRendererProps {
  source: string;
  components?: MDXRemoteProps["components"];
}

export default function MDXRenderer({
  source,
  components: customComponents,
}: MDXRendererProps) {
  return (
    <div className="prose prose-lg max-w-none">
      <MDXRemote
        source={source}
        components={{ ...components, ...customComponents }}
      />
    </div>
  );
}
