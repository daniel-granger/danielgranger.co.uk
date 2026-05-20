const purgecss = require('@fullhuman/postcss-purgecss');

module.exports = {
  plugins: [
    purgecss({
      content: ['./src/**/*.{astro,html,js,ts,md}'],
      safelist: {
        // Bootstrap JS dynamically adds these classes, so keep them
        standard: [/^collaps/, /^show/, /^navbar-/, /^modal/, /^dropdown/],
      },
    }),
  ],
};
