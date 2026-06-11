const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    process.env.NODE_ENV === 'production' && purgecss({
      // Include .json so dynamic class names derived from data (e.g. devicon names) are detected
      content: ['./src/**/*.{astro,html,js,ts,md,json}'],
      safelist: {
        standard: [
          // Bootstrap JS dynamically adds these classes, so keep them
          /^collaps/, /^show/, /^navbar-/, /^modal/, /^dropdown/,
          // devicon classes are built from JSON data at runtime (e.g. devicon-${icon}-plain)
          /^devicon-/,
          // 'colored' is added via classList.add() in Hero.astro
          'colored',
          // '.line' is injected by the syntax highlighter into code blocks
          'line',
          'blockquote',
          'pre','code', 'astro-code', 'github-dark'
        ],
      },
    }),
  ].filter(Boolean),
};
