import type { APIRoute } from 'astro';
import llmsData from '../data/llms.json';

export const prerender = true;

export const GET: APIRoute = () => {
  return new Response(llmsData.body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
