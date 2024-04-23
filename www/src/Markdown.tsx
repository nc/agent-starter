import React, { ComponentProps, CSSProperties, ReactNode } from "react";
import rehypeReact from "rehype-react";
import remarkRehype from "remark-rehype";
import remarkParse from "remark-parse";
import { unified } from "unified";
import * as prod from "react/jsx-runtime";

// import "./Markdown.css";

const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

function Link(props: ComponentProps<"a">) {
  return <a target="_blank" className="Link" {...props} />;
}

// function Code(props: ComponentProps<"code">) {
//   if (props.children == null) return null;
//   if (props.children.toString().trim() === "") return null;
//   if (!props.children.toString().includes("\n"))
//     return <span className="CodeToken">{props.children}</span>;

//   const dividerTop = <div className="DividerTop" />;
//   const dividerBottom = <div className="DividerBottom" />;

//   return (
//     <div className="CodeBlock">
//       {dividerTop}
//       <code>{props.children.toString()}</code>
//       {dividerBottom}
//     </div>
//   );
// }

// Define the structure of the AST nodes
interface Node {
  type: string;
  value?: string;
  children?: Node[];
}

export function extractCodeBlocks(markdown: string) {
  const ast = unified().use(remarkParse).parse(markdown); // @ts-ignore

  function parseNode(node: Node) {
    const codeBlocks: string[] = [];

    // If the node is a code block, push its value to the codeBlocks array
    if (node.type === "code" && node.value) {
      codeBlocks.push(node.value);
    }

    // If the node has children, recursively process each child
    if (node.children) {
      for (const child of node.children) {
        codeBlocks.push(...parseNode(child));
      }
    }

    return codeBlocks;
  }

  return parseNode(ast);
}

const COMPILER = canUseDOM
  ? unified()
      .use(remarkParse)
      .use(remarkRehype)
      // @ts-expect-error: the react types are missing.
      .use(rehypeReact, {
        Fragment: prod.Fragment,
        jsx: prod.jsx,
        jsxs: prod.jsxs,
        components: {
          a: Link,
        },
      })
  : { processSync: () => ({ result: null }) };

export const Markdown = React.memo(function Markdown(props: {
  className?: string;
  children: string | React.ReactNode;
  style?: CSSProperties;
}) {
  const reactContent = COMPILER.processSync(props.children?.toString())
    .result as ReactNode;
  return reactContent != null ? (
    <div className={props.className} style={props.style}>
      {reactContent ?? ""}
    </div>
  ) : null;
});
