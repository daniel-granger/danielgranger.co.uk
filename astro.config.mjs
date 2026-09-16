// @ts-check
import { defineConfig } from 'astro/config';

/** Rehype plugin: removes tabindex from <pre> code blocks to fix a11y */
/** Minimal tree shape needed by the rehype accessibility transform. */
/**
 * @typedef {{ type?: string, tagName?: string, properties?: Record<string, unknown>, children?: RehypeNode[] }} RehypeNode
 */
function rehypeCodeBlockA11y() {
  return function (/** @type {RehypeNode} */ tree) {
    function walk(/** @type {RehypeNode} */ node) {
      if (node.type === 'element' && node.tagName === 'pre' && node.properties) {
        for (const key of Object.keys(node.properties)) {
          if (key.toLowerCase() === 'tabindex') {
            delete node.properties[key];
          }
        }
      }
      node.children?.forEach(walk);
    }

    walk(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://danielgranger.co.uk',
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    ssr: {
      external: ['@resvg/resvg-js'],
    },
  },
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
