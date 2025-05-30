// // lib/parseHtml.ts
// import * as cheerio from 'cheerio';
// import type { Element } from 'domhandler';

// export type NodeType = 'section' | 'column' | 'heading' | 'text' | 'icon';

// export interface LayoutNode {
//   type: NodeType;
//   text?: string;
//   children?: LayoutNode[];
// }

// export function parseHtmlToLayout(html: string): LayoutNode[] {
//   const $ = cheerio.load(html);

//   function traverse(el: Element): LayoutNode | null {
//     const tag = el.tagName?.toLowerCase();
//     if (!tag) return null;

//     const $el = $(el);

//     const validTags = ['section', 'div', 'h1', 'h2', 'h3', 'h4', 'p', 'i', 'span', 'svg'];
//     if (!validTags.includes(tag)) return null;

//     let type: NodeType;
//     if (tag === 'section') type = 'section';
//     else if (tag === 'div') type = 'column';
//     else if (tag.startsWith('h')) type = 'heading';
//     else if (tag === 'p' || tag === 'span') type = 'text';
//     else if (tag === 'i' || tag === 'svg') type = 'icon';
//     else return null;

//     const node: LayoutNode = { type };

//     if (type === 'heading' || type === 'text') {
//       const text = $el.text().trim();
//       if (text) node.text = text;
//     }

//     const children = $el
//       .children()
//       .map((_, child) => traverse(child))
//       .get()
//       .filter(Boolean) as LayoutNode[];

//     if (children.length > 0) {
//       node.children = children;
//     }

//     return node;
//   }

//   const rootElements = $('body')
//     .children()
//     .map((_, el) => traverse(el))
//     .get()
//     .filter(Boolean) as LayoutNode[];

//   return rootElements;
// }
// app/lib/route.ts
import * as cheerio from 'cheerio';

type Element =
  | { type: 'icon'; content: string }
  | { type: 'heading'; level: number; content: string }
  | { type: 'paragraph'; content: string };

type Column = {
  type: 'column';
  elements: Element[];
};

type Layout = {
  type: 'section';
  layout: '3-columns';
  children: Column[];
};

export function convertRawHtmlToOrgFormat(html: string): Layout {
  const $ = cheerio.load(html);

  const columnsContainer = $('.columns').first();

  if (!columnsContainer.length) {
    return {
      type: 'section',
      layout: '3-columns',
      children: [],
    };
  }

  const children: Column[] = [];

  columnsContainer.children('.column').each((_, el) => {
    const $el = $(el);

    const svg = $el.find('svg').first().toString().trim();

    const title = $el.find('h5').first().text().trim();

    const text = $el.find('p').first().text().trim();

    // Build elements array, only add if not empty
    const elements: Element[] = [];

    if (svg) elements.push({ type: 'icon', content: svg });
    if (title) elements.push({ type: 'heading', level: 5, content: title });
    if (text) elements.push({ type: 'paragraph', content: text });

    if (elements.length > 0) {
      children.push({
        type: 'column',
        elements,
      });
    }
  });

  return {
    type: 'section',
    layout: '3-columns',
    children,
  };
}