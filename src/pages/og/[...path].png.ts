import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import {
  OG_HEIGHT,
  OG_WIDTH,
  buildOgCard,
  loadImageDataUri,
  loadOgFonts,
  type OgCardData,
} from '../../lib/og';

interface OgProps extends OgCardData {}

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export async function getStaticPaths() {
  const [allBlogPosts, allPortfolioItems] = await Promise.all([
    getCollection('blog'),
    getCollection('portfolio'),
  ]);
  const blogPosts = allBlogPosts.filter((post) => !post.data.draft);
  const portfolioItems = allPortfolioItems.filter((item) => !item.data.draft);

  return [
    {
      params: { path: 'index' },
      props: {
        kind: 'home',
        title: 'Daniel Granger',
        subtitle: '.NET Web Developer',
        description: 'Personal website and blog of Daniel Granger, a .NET web developer.',
      },
    },
    {
      params: { path: 'blog' },
      props: {
        kind: 'blog',
        title: 'Blog',
        subtitle: 'Articles and thoughts on .NET, web development, and software engineering.',
        description: 'Articles and thoughts on .NET, web development, and software engineering by Daniel Granger.',
      },
    },
    {
      params: { path: 'portfolio' },
      props: {
        kind: 'portfolio',
        title: 'Portfolio',
        subtitle: 'Selected work by Daniel Granger',
        description: 'A selection of projects and work by Daniel Granger, .NET web developer.',
      },
    },
    {
      params: { path: 'contact' },
      props: {
        kind: 'page',
        title: 'Contact',
        subtitle: 'Get in touch',
        description: 'Get in touch with Daniel Granger via the contact form.',
      },
    },
    {
      params: { path: 'contact/thanks' },
      props: {
        kind: 'page',
        title: 'Thanks!',
        subtitle: 'danielgranger.co.uk',
        description: 'Your message has been sent successfully.',
      },
    },
    ...blogPosts.map((post) => ({
      params: { path: `blog/${post.id}` },
      props: {
        kind: 'blog',
        title: post.data.title,
        subtitle: 'Daniel Granger · Blog',
        description: post.data.description,
        date: formatDate(post.data.date),
        tags: post.data.categories ?? post.data.tags,
        image: post.data.image,
        imageAlt: `${post.data.title} cover image`,
      },
    })),
    ...portfolioItems.map((item) => ({
      params: { path: `portfolio/${item.id}` },
      props: {
        kind: 'portfolio',
        title: item.data.title,
        subtitle: 'Daniel Granger · Portfolio',
        description: item.data.description,
        date: item.data.date ? formatDate(item.data.date) : undefined,
        tags: item.data.tags,
        image: item.data.image,
        imageAlt: `${item.data.title} project image`,
      },
    })),
  ];
}

export async function GET({ props }: APIContext) {
  const card = props as OgProps;
  const [fonts, imageDataUri] = await Promise.all([
    loadOgFonts(),
    card.image ? loadImageDataUri(card.image) : Promise.resolve(undefined),
  ]);
  const svg = await satori(buildOgCard(card, imageDataUri) as Parameters<typeof satori>[0], {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: [
      { name: 'Inter', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: fonts.bold, weight: 700, style: 'normal' },
    ],
  });

  const renderedPng = new Resvg(svg).render().asPng();
  const png = new ArrayBuffer(renderedPng.byteLength);
  new Uint8Array(png).set(renderedPng);

  return new Response(png, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/png',
    },
  });
}
