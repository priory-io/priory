import { ReactElement } from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderContent = () => {
    const lines = content.split("\n");
    const elements: ReactElement[] = [];
    let currentList: string[] = [];
    let currentOrderedList: string[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];

    const flushLists = (index: number) => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`ul-${index}`} className="list-disc pl-6 mb-6 space-y-2">
            {currentList.map((item, i) => (
              <li key={i} className="text-foreground/90 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>,
        );
        currentList = [];
      }
      if (currentOrderedList.length > 0) {
        elements.push(
          <ol key={`ol-${index}`} className="list-decimal pl-6 mb-6 space-y-2">
            {currentOrderedList.map((item, i) => (
              <li key={i} className="text-foreground/90 leading-relaxed">
                {item}
              </li>
            ))}
          </ol>,
        );
        currentOrderedList = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="bg-muted border border-border rounded-lg p-4 mb-6 overflow-x-auto"
            >
              <code className="text-sm text-foreground">
                {codeBlockContent.join("\n")}
              </code>
            </pre>,
          );
          codeBlockContent = [];
        }
        inCodeBlock = !inCodeBlock;
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      if (line.trim() === "") {
        flushLists(index);
        elements.push(<div key={`space-${index}`} className="mb-4" />);
        return;
      }

      if (line.startsWith("# ")) {
        flushLists(index);
        elements.push(
          <h1
            key={index}
            className="text-3xl md:text-4xl font-bold mt-12 mb-6 first:mt-0 text-foreground"
          >
            {line.replace("# ", "")}
          </h1>,
        );
        return;
      }

      if (line.startsWith("## ")) {
        flushLists(index);
        elements.push(
          <h2
            key={index}
            className="text-2xl md:text-3xl font-semibold mt-10 mb-5 text-foreground"
          >
            {line.replace("## ", "")}
          </h2>,
        );
        return;
      }

      if (line.startsWith("### ")) {
        flushLists(index);
        elements.push(
          <h3
            key={index}
            className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-foreground"
          >
            {line.replace("### ", "")}
          </h3>,
        );
        return;
      }

      if (line.startsWith("- ")) {
        currentList.push(formatInlineElements(line.replace("- ", "")));
        return;
      }

      if (line.match(/^\d+\. /)) {
        currentOrderedList.push(
          formatInlineElements(line.replace(/^\d+\. /, "")),
        );
        return;
      }

      flushLists(index);
      elements.push(
        <p key={index} className="mb-6 text-foreground/90 leading-relaxed">
          <span
            dangerouslySetInnerHTML={{ __html: formatInlineElements(line) }}
          />
        </p>,
      );
    });

    flushLists(lines.length);
    return elements;
  };

  const formatInlineElements = (text: string): string => {
    return text
      .replace(
        /`([^`]+)`/g,
        '<code class="text-primary bg-primary/10 px-2 py-1 rounded text-sm font-mono">$1</code>',
      )
      .replace(
        /\*\*([^*]+)\*\*/g,
        '<strong class="font-semibold text-foreground">$1</strong>',
      )
      .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  };

  return <div className="prose prose-lg max-w-none">{renderContent()}</div>;
}
