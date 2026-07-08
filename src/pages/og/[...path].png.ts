import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Cache fonts across multiple GET calls during the same build
const fontCache = new Map<string, ArrayBuffer>();

async function loadFont(weight: 400 | 700): Promise<ArrayBuffer> {
  const key = String(weight);
  if (fontCache.has(key)) return fontCache.get(key)!;

  // Request with an old Safari UA so Google Fonts returns woff (supported by Satori, unlike woff2)
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
      },
    }
  ).then((r) => r.text());

  const url = css.match(/url\(([^)]+)\) format\('woff'\)/)?.[1] ?? css.match(/url\(([^)]+)\)/)?.[1];
  if (!url) throw new Error(`Could not resolve font URL for weight ${weight}`);

  const data = await fetch(url).then((r) => r.arrayBuffer());
  fontCache.set(key, data);
  return data;
}

interface OgProps {
  title: string;
  subtitle: string;
}

export async function getStaticPaths() {
  const [blogPosts, portfolioItems] = await Promise.all([
    getCollection('blog'),
    getCollection('portfolio'),
  ]);

  return [
    { params: { path: 'index' },           props: { title: 'Daniel Granger',  subtitle: '.NET Web Developer' } },
    { params: { path: 'blog' },            props: { title: 'Blog',            subtitle: 'danielgranger.co.uk' } },
    { params: { path: 'portfolio' },       props: { title: 'Portfolio',       subtitle: 'danielgranger.co.uk' } },
    { params: { path: 'contact' },         props: { title: 'Contact',         subtitle: 'danielgranger.co.uk' } },
    { params: { path: 'contact/thanks' },  props: { title: 'Thanks!',         subtitle: 'danielgranger.co.uk' } },
    ...blogPosts.map((post) => ({
      params: { path: `blog/${post.id}` },
      props: { title: post.data.title, subtitle: 'danielgranger.co.uk · Blog' },
    })),
    ...portfolioItems.map((item) => ({
      params: { path: `portfolio/${item.id}` },
      props: { title: item.data.title, subtitle: 'danielgranger.co.uk · Portfolio' },
    })),
  ];
}

function buildCard(title: string, subtitle: string) {
  const fontSize = title.length > 50 ? 46 : title.length > 30 ? 56 : 68;

  return {
    // Outer: row — accent bar on the left, content on the right
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0d1117 0%, #1a1f2e 100%)',
        fontFamily: 'Inter',
      },
      children: [
        // Left accent bar
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              width: 10,
              background: 'linear-gradient(180deg, #3b82f6 0%, #6366f1 100%)',
            },
            children: '',
          },
        },
        // Main content column
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              padding: '64px 72px',
            },
            children: [
              // Domain — top
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontSize: 20,
                    color: '#4b5563',
                    letterSpacing: '0.06em',
                    marginBottom: 'auto',
                  },
                  children: 'danielgranger.co.uk',
                },
              },
              // Title + subtitle — bottom
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column' },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          fontSize,
                          fontWeight: 700,
                          color: '#f0f6fc',
                          lineHeight: 1.1,
                          marginBottom: 24,
                        },
                        children: title,
                      },
                    },
                    // Subtitle with a small accent dot
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 14,
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: '#3b82f6',
                                flexShrink: 0,
                              },
                              children: '',
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                fontSize: 26,
                                fontWeight: 400,
                                color: '#8b949e',
                              },
                              children: subtitle,
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

export async function GET({ props }: APIContext) {
  const { title, subtitle } = props as OgProps;

  const [regular, bold] = await Promise.all([loadFont(400), loadFont(700)]);

  const svg = await satori(buildCard(title, subtitle) as any, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' },
    ],
  });

  const png = new Resvg(svg).render().asPng();

  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
}
