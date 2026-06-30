import cmsDevicons from './devicons.json';

const devIconKeys = [
  'csharp',
  'svelte',
  'microsoftsqlserver',
  'kubernetes',
  'azure',
  'netlify',
] as const;

const devIconKeySet = new Set<string>(devIconKeys);

type CmsDeviconEntry = {
  key: string;
  svg: string;
};

export type DevIconKey = (typeof devIconKeys)[number];

const cmsEntries: CmsDeviconEntry[] = Array.isArray(cmsDevicons.icons)
  ? cmsDevicons.icons
  : [];

export const deviconSvgMap: Partial<Record<DevIconKey, string>> = {};

for (const entry of cmsEntries) {
  if (
    devIconKeySet.has(entry.key) &&
    typeof entry.svg === 'string' &&
    entry.svg.trim().length > 0
  ) {
    deviconSvgMap[entry.key as DevIconKey] = entry.svg;
  }
}
