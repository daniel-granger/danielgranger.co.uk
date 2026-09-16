import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type OgCardKind = 'home' | 'blog' | 'portfolio' | 'page';

export interface OgCardData {
  kind: OgCardKind;
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  tags?: string[];
  image?: string;
  imageAlt?: string;
}

type OgStyle = Record<string, string | number>;

export interface OgElement {
  type: 'div' | 'img';
  props: {
    src?: string;
    style?: OgStyle;
    children?: string | OgElement | Array<OgElement | string>;
  };
}

const LABELS: Record<OgCardKind, string> = {
  home: 'PERSONAL WEBSITE',
  blog: 'BLOG',
  portfolio: 'PORTFOLIO',
  page: 'DANIELGRANGER.CO.UK',
};

const truncate = (value: string, maximumLength: number) =>
  value.length <= maximumLength ? value : `${value.slice(0, maximumLength - 3).trimEnd()}...`;

const div = (style: OgStyle, children: OgElement['props']['children']): OgElement => ({
  type: 'div',
  props: { style, children },
});

const image = (src: string, style: OgStyle): OgElement => ({
  type: 'img',
  props: { src, style },
});

const tagChip = (tag: string): OgElement =>
  div(
    {
      display: 'flex',
      borderRadius: 9999,
      backgroundColor: '#243342',
      color: '#c8f8dc',
      fontSize: 18,
      padding: '8px 14px',
      marginRight: 10,
    },
    tag,
  );

export function buildOgCard(data: OgCardData, imageDataUri?: string): OgElement {
  const title = truncate(data.title, 105);
  const description = data.description ? truncate(data.description, 170) : undefined;
  const titleFontSize = title.length > 72 ? 48 : title.length > 48 ? 56 : 68;
  const tags = (data.tags ?? []).slice(0, 3);
  const label = LABELS[data.kind];
  const metadata = [data.date, ...tags].filter(Boolean).join('  ·  ');

  const content = div(
    {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      width: 1186,
      height: '100%',
      boxSizing: 'border-box',
      padding: '58px 86px 48px 96px',
      color: '#f0f6fc',
    },
    [
      div(
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#8b949e',
          fontSize: 20,
          letterSpacing: '0.08em',
        },
        [
          div(
            {
              display: 'flex',
              color: '#6cd899',
              fontWeight: 700,
            },
            label,
          ),
          div({ display: 'flex', letterSpacing: '0.02em' }, 'danielgranger.co.uk'),
        ],
      ),
      div(
        {
          display: 'flex',
          flexDirection: 'column',
          marginTop: 'auto',
          marginBottom: 'auto',
          maxHeight: 410,
          overflow: 'hidden',
        },
        [
          div(
            {
              display: 'flex',
              fontSize: titleFontSize,
              fontWeight: 700,
              lineHeight: 1.08,
              color: '#f0f6fc',
              marginBottom: 22,
            },
            title,
          ),
          ...(description
            ? [
                div(
                  {
                    display: 'flex',
                    fontSize: 24,
                    lineHeight: 1.25,
                    color: '#c4ccd5',
                    maxHeight: 92,
                    overflow: 'hidden',
                    marginBottom: 24,
                  },
                  description,
                ),
              ]
            : []),
          ...(metadata
            ? [
                div(
                  {
                    display: 'flex',
                    fontSize: 20,
                    color: '#8b949e',
                  },
                  metadata,
                ),
              ]
            : []),
          ...(tags.length > 0
            ? [
                div(
                  {
                    display: 'flex',
                    flexDirection: 'row',
                    marginTop: 22,
                  },
                  tags.map(tagChip),
                ),
              ]
            : []),
        ],
      ),
      div(
        {
          display: 'flex',
          alignItems: 'center',
          color: '#6cd899',
          fontSize: 20,
        },
        [
          div(
            {
              display: 'flex',
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: '#6cd899',
              marginRight: 12,
            },
            '',
          ),
          div({ display: 'flex' }, data.subtitle ?? 'Daniel Granger'),
        ],
      ),
    ],
  );

  const background = imageDataUri
    ? [
        image(imageDataUri, {
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }),
        div(
          {
            position: 'absolute',
            display: 'flex',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(13, 17, 23, 0.98) 0%, rgba(13, 17, 23, 0.84) 62%, rgba(13, 17, 23, 0.58) 100%)',
          },
          '',
        ),
      ]
    : [];

  return div(
    {
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      width: OG_WIDTH,
      height: OG_HEIGHT,
      boxSizing: 'border-box',
      backgroundColor: '#0d1117',
      fontFamily: 'Inter',
      overflow: 'hidden',
    },
    [
      ...background,
      div({
        display: 'flex',
        width: 14,
        height: '100%',
        background: 'linear-gradient(180deg, #6cd899 0%, #1f6b43 100%)',
      }, ''),
      content,
    ],
  );
}

const MIME_TYPES: Record<string, string> = {
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function mimeTypeForPath(path: string): string {
  const cleanPath = path.split(/[?#]/)[0];
  return MIME_TYPES[cleanPath.toLowerCase().match(/\.[^.]+$/)?.[0] ?? ''] ?? 'image/png';
}

function publicAssetPath(source: string): string {
  const publicRoot = resolve(process.cwd(), 'public');
  const relativeSource = source.split(/[?#]/)[0].replace(/^\/+/, '');
  const filePath = resolve(publicRoot, relativeSource);
  const relativePath = relative(publicRoot, filePath);

  if (relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw new Error(`Image path escapes the public directory: ${source}`);
  }

  return filePath;
}

export async function loadImageDataUri(source: string): Promise<string | undefined> {
  if (source.startsWith('data:image/')) {
    return source;
  }

  try {
    let bytes: Buffer;
    let mimeType: string;

    if (/^https?:\/\//i.test(source)) {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`image request returned ${response.status}`);
      }

      const contentType = response.headers.get('content-type')?.split(';')[0].trim();
      if (contentType && !contentType.startsWith('image/')) {
        throw new Error(`image response used unsupported content type ${contentType}`);
      }

      mimeType = contentType ?? mimeTypeForPath(source);
      bytes = Buffer.from(await response.arrayBuffer());
    } else {
      const filePath = publicAssetPath(source);
      bytes = await readFile(filePath);
      mimeType = mimeTypeForPath(filePath);
    }

    if (bytes.length === 0) {
      throw new Error('image response was empty');
    }

    return `data:${mimeType};base64,${bytes.toString('base64')}`;
  } catch (error) {
    console.warn(`[og] Could not load image "${source}". Using the branded fallback card.`, error);
    return undefined;
  }
}

const fontCache = new Map<400 | 700, ArrayBuffer>();

async function loadLocalFont(weight: 400 | 700): Promise<ArrayBuffer> {
  const filename = weight === 400 ? 'Inter-Regular.ttf' : 'Inter-Bold.ttf';
  const data = await readFile(resolve(process.cwd(), 'public', 'fonts', filename));
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy.buffer;
}

export async function loadOgFonts() {
  const load = async (weight: 400 | 700) => {
    const cached = fontCache.get(weight);
    if (cached) return cached;

    const data = await loadLocalFont(weight);
    fontCache.set(weight, data);
    return data;
  };

  const [regular, bold] = await Promise.all([load(400), load(700)]);
  return { regular, bold };
}
