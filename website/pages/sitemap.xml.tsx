import { NextPage, GetServerSideProps } from 'next';
import { baseURL } from '@/utils/global';

interface Event {
  _id: string;
  stub?: string;
  name : string;
  startsAt : any;
}

interface Props {
  events: Event[];
  SITE_URL : string;
}

function generateSiteMap(events: Event[], SITE_URL : string): string {
    // Regular expression to match ampersands not part of HTML entities
    const regex = /&(?!#?[a-z0-9]+;)/g;
  return `<?xml version="1.0" encoding="UTF-8"?>
            <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            <url>
              <loc>${`${SITE_URL}`}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <title>Events list</title>
            </url>
              ${events.map(({ _id, stub, name, startsAt }) => {
              return `<url>
                        <loc>${`${SITE_URL}/${stub ? stub : _id}`}</loc>
                        <lastmod>${new Date(startsAt * 1000).toISOString()}</lastmod>
                        <title>${name.replace(regex, '&amp;')}</title></url>`;}).join('')}
            </urlset>`;
}

const SiteMap: NextPage<Props> = ({ events }) => {
  return null; 
};

export const getServerSideProps: any = async ({ res }: any) => {
  const request = await fetch(`${baseURL}/getEventList`);
  const SITE_URL = process.env.SITE_URL!
  const { events }  = await request.json();
  const sitemap = generateSiteMap(events, SITE_URL);
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  return {
    props: {
      events,     
    },
  };
};

export default SiteMap;
