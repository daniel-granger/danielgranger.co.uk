// @ts-check
import { defineConfig } from 'astro/config';

/** Rehype plugin: removes tabindex from <pre> code blocks to fix a11y */
function rehypeCodeBlockA11y() {
  return function (tree) {
    function walk(node) {
      if (node.type === 'element' && node.tagName === 'pre') {
        for (const key of Object.keys(node.properties)) {
          if (key.toLowerCase() === 'tabindex') delete node.properties[key];
        }
      }
      if (node.children) node.children.forEach(walk);
    }
    walk(tree);
  };
}

/** Rehype plugin: removes tabindex from <pre> code blocks to fix a11y */
function rehypeCodeBlockA11y() {
  return function (tree) {
    function walk(node) {
      if (node.type === 'element' && node.tagName === 'pre') {
        for (const key of Object.keys(node.properties)) {
          if (key.toLowerCase() === 'tabindex') delete node.properties[key];
        }
      }
      if (node.children) node.children.forEach(walk);
    }
    walk(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/admin': '/admin/index.html',
  },
  markdown: {
    shikiConfig: {
      transformers: [
        {
          pre(node) {
            delete node.properties.tabindex;
            delete node.properties.tabIndex;
          },
        },
      ],
    },
    rehypePlugins: [rehypeCodeBlockA11y],
  },
});
