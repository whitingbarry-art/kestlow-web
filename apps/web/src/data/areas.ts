// The town and trade pages search engines find (KES-136): one for each council we collect from
// and each trade, such as /roofing-leads/bromley, plus /planning-leads listing them all. Every
// claim here must stay true: check it against the API's trade rules before changing it.

import type { Trade } from "../types/lead";
import { pageTitle, SITE_URL } from "./site";

export interface AreaCouncil {
  slug: string;
  /** As the API names it, for GET /public/councils/:council. */
  name: string;
  /** Where it is, as a tradesperson would say it. */
  region: string;
}

/** The councils we collect from (KES-161 added London's from the GLA's London Datahub). */
export const AREA_COUNCILS: AreaCouncil[] = [
  { slug: "bromley", name: "Bromley", region: "south-east London" },
  { slug: "greenwich", name: "Greenwich", region: "south-east London" },
  { slug: "bexley", name: "Bexley", region: "south-east London" },
  { slug: "lewisham", name: "Lewisham", region: "south-east London" },
  { slug: "croydon", name: "Croydon", region: "south London" },
  { slug: "lambeth", name: "Lambeth", region: "south London" },
  { slug: "southwark", name: "Southwark", region: "south London" },
  { slug: "sutton", name: "Sutton", region: "south London" },
  { slug: "merton", name: "Merton", region: "south-west London" },
  { slug: "kingston", name: "Kingston", region: "south-west London" },
  { slug: "richmond", name: "Richmond", region: "south-west London" },
  { slug: "wandsworth", name: "Wandsworth", region: "south-west London" },
  { slug: "westminster", name: "Westminster", region: "central London" },
  { slug: "city-of-london", name: "City of London", region: "central London" },
  { slug: "camden", name: "Camden", region: "north London" },
  { slug: "islington", name: "Islington", region: "north London" },
  { slug: "barnet", name: "Barnet", region: "north London" },
  { slug: "haringey", name: "Haringey", region: "north London" },
  { slug: "enfield", name: "Enfield", region: "north London" },
  { slug: "brent", name: "Brent", region: "north-west London" },
  { slug: "harrow", name: "Harrow", region: "north-west London" },
  { slug: "kensington-and-chelsea", name: "Kensington & Chelsea", region: "west London" },
  { slug: "hammersmith-and-fulham", name: "Hammersmith & Fulham", region: "west London" },
  { slug: "hounslow", name: "Hounslow", region: "west London" },
  { slug: "hillingdon", name: "Hillingdon", region: "west London" },
  { slug: "ealing", name: "Ealing", region: "west London" },
  { slug: "tower-hamlets", name: "Tower Hamlets", region: "east London" },
  { slug: "hackney", name: "Hackney", region: "east London" },
  { slug: "newham", name: "Newham", region: "east London" },
  { slug: "waltham-forest", name: "Waltham Forest", region: "east London" },
  { slug: "barking-and-dagenham", name: "Barking & Dagenham", region: "east London" },
  { slug: "redbridge", name: "Redbridge", region: "east London" },
  { slug: "havering", name: "Havering", region: "east London" },
  { slug: "dartford", name: "Dartford", region: "Kent" },
  { slug: "sevenoaks", name: "Sevenoaks", region: "Kent" },
];

/** "35 councils across London and Kent", as every page says it. */
export const COVERAGE = `${AREA_COUNCILS.length} councils across London and Kent`;

export interface AreaTrade {
  slug: string;
  trade: Trade;
  /** "a roofer": who the work is for, in a sentence. */
  someone: string;
  /** "roofers", for titles and descriptions. */
  people: string;
  /** The kinds of application picked out for the trade, from the API's rules. */
  work: string;
}

export const AREA_TRADES: AreaTrade[] = [
  {
    slug: "roofing",
    trade: "Roofing",
    someone: "a roofer",
    people: "roofers",
    work: "loft conversions, dormers, new and altered roofs, roof lights, chimneys, porches and two-storey extensions",
  },
  {
    slug: "electrical",
    trade: "Electrical",
    someone: "an electrician",
    people: "electricians",
    work: "extensions, loft and garage conversions, new homes, garden rooms, changes of use, solar panels, heat pumps and EV chargers",
  },
  {
    slug: "landscaping",
    trade: "Landscaping",
    someone: "a landscaper",
    people: "landscapers",
    work: "landscaping schemes, patios, decking, paving, fences, walls and gates, ponds and pools",
  },
  {
    slug: "groundworks",
    trade: "Groundworks",
    someone: "a groundworker",
    people: "groundworkers",
    work: "new homes and buildings, demolitions, basements, foundations, driveways, dropped kerbs and drainage",
  },
];

/** The page listing every town and trade page. */
export const AREAS_INDEX_PATH = "/planning-leads";

export const areaPath = (trade: AreaTrade, council: AreaCouncil) =>
  `/${trade.slug}-leads/${council.slug}`;

export interface AreaPageInfo {
  trade: AreaTrade;
  council: AreaCouncil;
}

/** The town and trade page at `pathname`, if it is one. */
export function areaPageFor(pathname: string): AreaPageInfo | undefined {
  const match = /^\/([a-z]+)-leads\/([a-z-]+)$/.exec(pathname);
  const trade = AREA_TRADES.find((t) => t.slug === match?.[1]);
  const council = AREA_COUNCILS.find((c) => c.slug === match?.[2]);
  return trade && council ? { trade, council } : undefined;
}

/** Every town and trade page, councils in order, each with its trades. */
export const AREA_PAGES: AreaPageInfo[] = AREA_COUNCILS.flatMap((council) =>
  AREA_TRADES.map((trade) => ({ trade, council })),
);

export interface StaticPageMeta {
  path: string;
  /** The page's own heading. */
  heading: string;
  /** The heading as the browser tab and search results show it. */
  title: string;
  description: string;
}

export function areaPageMeta({ trade, council }: AreaPageInfo): StaticPageMeta {
  return {
    path: areaPath(trade, council),
    heading: `${trade.trade} leads in ${council.name}`,
    title: pageTitle(`${trade.trade} leads in ${council.name}`),
    description: `Planning applications in ${council.name} that could need ${trade.someone}, sent to your phone every morning. For ${trade.people} in ${council.region}. Try Pro free.`,
  };
}

export const AREAS_INDEX_META: StaticPageMeta = {
  path: AREAS_INDEX_PATH,
  heading: "Planning leads by town and trade",
  title: pageTitle("Planning leads by town and trade"),
  description: `Planning leads for roofers, electricians, landscapers and groundworkers from ${COVERAGE}, sent to your phone every morning.`,
};

/** The sitemap's addresses: the launch page, the footer's pages, then the town and trade pages. */
export function sitemapXml(footerPaths: string[]): string {
  const paths = [
    "/",
    ...footerPaths,
    AREAS_INDEX_PATH,
    ...AREA_PAGES.map(areaPageMeta).map((p) => p.path),
  ];
  const urls = paths.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Made by src/data/areas.ts (KES-135, KES-136); src/data/seo.test.ts says if it's out of date. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
