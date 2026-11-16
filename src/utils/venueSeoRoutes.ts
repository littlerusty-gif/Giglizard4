/**
 * Programmatic SEO routing utilities for the GigLizard Venue Directory.
 * Handles parsing, metadata generation, and sitemap generation for routes like:
 * - /venues/austin-tx
 * - /venues/seattle-wa
 * - /venues/rock/chicago
 * - /venues/punk/seattle
 * - /venues/portland-or
 */

import { CONTINENTAL_US_STATES } from "../constants/states";
import { MUSIC_VENUES, VENUE_ALIAS_ID_MAP } from "../data/venues";
import { Venue } from "../types";

export const CANONICAL_DOMAIN = "https://www.giglizard.us";

export interface ProgrammaticVenueRoute {
  isProgrammatic: boolean;
  type: "city-state" | "genre-city" | "genre-only" | "city-only" | "venue-profile" | "standard";
  city?: string;
  stateCode?: string;
  stateName?: string;
  genre?: string;
  venueSlug?: string;
  venueName?: string;
  venueId?: string;
  venue?: Venue;
  canonicalPath: string;
  title: string;
  description: string;
  heading: string;
  subhead: string;
  breadcrumb: Array<{ name: string; url: string }>;
}

export const POPULAR_TOURING_CITIES: Array<{
  city: string;
  state: string;
  slug: string;
  corridor: string;
  tagline: string;
}> = [
  // West Coast & Pacific Northwest
  { city: "Austin", state: "TX", slug: "austin-tx", corridor: "Texas Triangle (San Antonio · Houston · Dallas)", tagline: "Live Music Capital of the World" },
  { city: "Seattle", state: "WA", slug: "seattle-wa", corridor: "I-5 Pacific Northwest (Portland · Tacoma · Vancouver)", tagline: "Grunge, Indie & Underground Stages" },
  { city: "Portland", state: "OR", slug: "portland-or", corridor: "Cascadia Corridor (Seattle · Eugene · Bend)", tagline: "DIY Independent Music Mecca" },
  { city: "Spokane", state: "WA", slug: "spokane-wa", corridor: "Inland Northwest (Missoula · Boise · Seattle)", tagline: "Inland Northwest Tour Stop" },
  { city: "Tacoma", state: "WA", slug: "tacoma-wa", corridor: "Puget Sound South (Seattle · Olympia)", tagline: "South Sound Live Stages" },
  { city: "Eugene", state: "OR", slug: "eugene-or", corridor: "Willamette Valley (Portland · Ashland)", tagline: "College Town Tour Stop" },
  { city: "Bend", state: "OR", slug: "bend-or", corridor: "Central Oregon (Portland · Boise)", tagline: "High Desert Music Venues" },
  { city: "Los Angeles", state: "CA", slug: "los-angeles-ca", corridor: "Southern California (San Diego · Santa Ana)", tagline: "Sunset Strip & West Coast Venues" },
  { city: "San Diego", state: "CA", slug: "san-diego-ca", corridor: "SoCal Coastal Run (LA · Orange County)", tagline: "Coastal Clubs & Open-Air Amphitheaters" },
  { city: "San Francisco", state: "CA", slug: "san-francisco-ca", corridor: "Bay Area Corridor (Oakland · San Jose)", tagline: "Historic Bay Area Music Halls" },

  // Midwest & Rocky Mountains
  { city: "Chicago", state: "IL", slug: "chicago-il", corridor: "Midwest Loop (Milwaukee · Indianapolis · Detroit)", tagline: "Legendary Blues, Rock & Indie Rooms" },
  { city: "Minneapolis", state: "MN", slug: "minneapolis-mn", corridor: "Upper Midwest (Madison · Chicago · Duluth)", tagline: "Twin Cities Indie & Post-Rock Scene" },
  { city: "Denver", state: "CO", slug: "denver-co", corridor: "Rocky Mountain Hub (Boulder · Fort Collins · Salt Lake)", tagline: "Mile High Rock & Electronic Halls" },
  { city: "Detroit", state: "MI", slug: "detroit-mi", corridor: "Rust Belt Circuit (Cleveland · Columbus · Chicago)", tagline: "Motor City Garage Rock & Techno" },
  { city: "Cleveland", state: "OH", slug: "cleveland-oh", corridor: "Lake Erie Tour Run (Pittsburgh · Detroit · Buffalo)", tagline: "Rock & Roll Hall of Fame City Stages" },
  { city: "Columbus", state: "OH", slug: "columbus-oh", corridor: "Ohio Valley Corridor (Cincinnati · Cleveland)", tagline: "High-Energy College Rock Circuit" },
  { city: "Indianapolis", state: "IN", slug: "indianapolis-in", corridor: "Crossroads Corridor (Chicago · Louisville)", tagline: "Fountain Square Indie Hub" },

  // South & Tennessee Valley
  { city: "Nashville", state: "TN", slug: "nashville-tn", corridor: "Southeast Circuit (Atlanta · Louisville · Memphis)", tagline: "Music City Listening Rooms & Clubs" },
  { city: "Memphis", state: "TN", slug: "memphis-tn", corridor: "Mississippi Delta Run (Nashville · New Orleans)", tagline: "Beale Street & Stax Soul Heritage" },
  { city: "Atlanta", state: "GA", slug: "atlanta-ga", corridor: "Southeast Corridor (Athens · Charlotte · Nashville)", tagline: "Hip-Hop, Indie Rock & Punk Bastion" },
  { city: "New Orleans", state: "LA", slug: "new-orleans-la", corridor: "Gulf Coast Run (Houston · Mobile · Pensacola)", tagline: "Frenchmen Street Jazz, Funk & Brass" },

  // East Coast & Mid-Atlantic
  { city: "New York", state: "NY", slug: "new-york-ny", corridor: "I-95 Northeast Megalopolis (Philly · Boston)", tagline: "Manhattan & Bowery Historic Stages" },
  { city: "Brooklyn", state: "NY", slug: "brooklyn-ny", corridor: "NYC Metro Hub (Bushwick · Williamsburg · Greenpoint)", tagline: "Indie Rock, DIY Warehouses & Lo-Fi" },
  { city: "Philadelphia", state: "PA", slug: "philadelphia-pa", corridor: "Mid-Atlantic Corridor (NYC · Baltimore · DC)", tagline: "Fishtown, South Street & Indie Dives" },
  { city: "Boston", state: "MA", slug: "boston-ma", corridor: "Northeast Corridor (Providence · NYC · New Haven)", tagline: "College Rock & Hardcore Dives" },
  { city: "Washington", state: "DC", slug: "washington-dc", corridor: "Capital Corridor (Baltimore · Richmond · Philly)", tagline: "Dischord Punk Roots & 9:30 Club Legacy" },
  { city: "Baltimore", state: "MD", slug: "baltimore-md", corridor: "Chesapeake Circuit (DC · Philadelphia)", tagline: "DIY Art-Pop & Underground Dives" },
  { city: "Pittsburgh", state: "PA", slug: "pittsburgh-pa", corridor: "Allegheny Hub (Cleveland · Columbus · Philly)", tagline: "Steel City Underground & Rust Belt Rock" },
  { city: "Richmond", state: "VA", slug: "richmond-va", corridor: "Virginia Feeder (DC · Raleigh · Norfolk)", tagline: "DIY Metal, Punk & Indie Community" },
  { city: "Asbury Park", state: "NJ", slug: "asbury-park-nj", corridor: "Jersey Shore Circuit (NYC · Philly)", tagline: "Stone Pony & Boardwalk Rock Heritage" }
];

export const POPULAR_GENRE_CITY_ROUTES: Array<{
  genre: string;
  genreSlug: string;
  city: string;
  state: string;
  slug: string;
  metaSummary: string;
}> = [
  { genre: "Rock", genreSlug: "rock", city: "Chicago", state: "IL", slug: "rock/chicago", metaSummary: "legendary rock clubs, dive bars, and mid-sized music halls" },
  { genre: "Punk", genreSlug: "punk", city: "Seattle", state: "WA", slug: "punk/seattle", metaSummary: "gritty underground punk basements, historic dive bars, and DIY rooms" },
  { genre: "Indie", genreSlug: "indie", city: "Austin", state: "TX", slug: "indie/austin", metaSummary: "Red River Cultural District rooms, patio stages, and indie listening lounges" },
  { genre: "Folk", genreSlug: "folk", city: "Nashville", state: "TN", slug: "folk/nashville", metaSummary: "acoustic listening rooms, intimate singer-songwriter halls, and Americana stages" },
  { genre: "Metal", genreSlug: "metal", city: "Portland", state: "OR", slug: "metal/portland", metaSummary: "heavy metal dives, loud monitor rooms, and independent rock clubs" },
  { genre: "Electronic", genreSlug: "electronic", city: "Denver", state: "CO", slug: "electronic/denver", metaSummary: "warehouse venues, synth lounges, and bass-heavy performance spaces" },
  { genre: "Alternative Rock", genreSlug: "alternative-rock", city: "Seattle", state: "WA", slug: "alternative-rock/seattle", metaSummary: "iconic Belltown and Capitol Hill stages for touring alternative acts" },
  { genre: "Blues", genreSlug: "blues", city: "Chicago", state: "IL", slug: "blues/chicago", metaSummary: "historic Chicago blues basements, soul clubs, and intimate stages" },
  { genre: "Rock", genreSlug: "rock", city: "New York", state: "NY", slug: "rock/new-york", metaSummary: "historic East Village, Bowery, and Lower East Side live rock venues" },
  { genre: "Indie", genreSlug: "indie", city: "Brooklyn", state: "NY", slug: "indie/brooklyn", metaSummary: "Williamsburg, Bushwick, and Greenpoint indie rooms, lofts, and warehouses" },
  { genre: "Punk", genreSlug: "punk", city: "Philadelphia", state: "PA", slug: "punk/philadelphia", metaSummary: "Fishtown basements, underground punk clubs, and DIY dive stages" },
  { genre: "Hip-Hop", genreSlug: "hip-hop", city: "Atlanta", state: "GA", slug: "hip-hop/atlanta", metaSummary: "East Atlanta Village, Little Five Points, and Midtown performance venues" },
  { genre: "Jazz", genreSlug: "jazz", city: "New Orleans", state: "LA", slug: "jazz/new-orleans", metaSummary: "Frenchmen Street jazz clubs, preservation halls, and brass venues" },
  { genre: "Rock", genreSlug: "rock", city: "Los Angeles", state: "CA", slug: "rock/los-angeles", metaSummary: "Sunset Strip clubs, Silver Lake stages, and Hollywood live music rooms" }
];

// Map state abbreviation to full name
const STATE_MAP: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia", BC: "British Columbia"
};

const REVERSE_STATE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_MAP).map(([abbr, full]) => [full.toLowerCase(), abbr])
);

function capitalizeWords(str: string): string {
  return str
    .split(/[- ]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Normalizes a string into a lowercase, hyphen-separated URL slug segment
 * with no leading/trailing hyphens.
 */
export function slugifySeoSegment(value: string): string {
  return (value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Extracts a normalized 2-letter uppercase state code from venue fields or address.
 */
export function extractVenueStateCode(venue: { state?: string; address?: string }): string {
  const rawState = (venue.state || "").trim();
  if (/^[a-z]{2}$/i.test(rawState)) {
    return rawState.toUpperCase();
  }
  if (rawState && REVERSE_STATE_MAP[rawState.toLowerCase()]) {
    return REVERSE_STATE_MAP[rawState.toLowerCase()];
  }
  const addrMatch = (venue.address || "").match(/,\s*([A-Z]{2})(?:\s+\d{5}|\s*,|\s*$)/i);
  if (addrMatch) {
    return addrMatch[1].toUpperCase();
  }
  return "";
}

/**
 * Single canonical public path for any venue:
 *   /venues/[city-state]/[slug]  (e.g. /venues/nashville-tn/club-handy)
 */
export function buildCanonicalVenuePath(venue: {
  id?: string;
  name: string;
  city?: string;
  state?: string;
  address?: string;
}): string {
  const citySlug = slugifySeoSegment(venue.city || "");
  const stateCode = extractVenueStateCode(venue).toLowerCase();
  const venueSlug = slugifySeoSegment(venue.name || venue.id || "venue");

  if (citySlug && stateCode) {
    return `/venues/${citySlug}-${stateCode}/${venueSlug}`;
  }
  return `/venues/venue/${slugifySeoSegment(venue.id || venueSlug)}`;
}

export function buildCanonicalVenueUrl(venue: {
  id?: string;
  name: string;
  city?: string;
  state?: string;
  address?: string;
}): string {
  return `${CANONICAL_DOMAIN}${buildCanonicalVenuePath(venue)}`;
}

/**
 * Looks up a venue by either:
 *   1. UUID or secondary slug ID (`idOrSlug`, from /venues/venue/:id)
 *   2. Canonical city-state + venue slug (`cityStateSlug` + `venueSlug`, from /venues/:city-state/:slug)
 */
export function findVenueByIdentifierOrSlug(
  query: {
    idOrSlug?: string;
    cityStateSlug?: string;
    venueSlug?: string;
  },
  venuesList: Venue[] = MUSIC_VENUES
): Venue | null {
  if (query.idOrSlug) {
    const rawNeedle = query.idOrSlug.trim().toLowerCase();
    const slugNeedle = slugifySeoSegment(rawNeedle);

    // 0. Check complete raw alias map (handles all 59+ deduplicated UUIDs & legacy base slugs like "showbox-seattle")
    if (VENUE_ALIAS_ID_MAP[rawNeedle]) {
      return VENUE_ALIAS_ID_MAP[rawNeedle];
    }

    // 1. Exact ID match (UUID or slug ID like "wa-spokane-knitting-factory-spokane")
    const exactId = venuesList.find(v => (v.id || "").toLowerCase() === rawNeedle);
    if (exactId) return exactId;

    // 2. Slugified ID match
    const slugId = venuesList.find(v => slugifySeoSegment(v.id || "") === slugNeedle);
    if (slugId) return slugId;

    // 3. State-city-name OR name-city composite slug
    const compositeMatch = venuesList.find(v => {
      const stateCode = extractVenueStateCode(v).toLowerCase();
      const citySlug = slugifySeoSegment(v.city || "");
      const nameSlug = slugifySeoSegment(v.name);
      const nameNoTheSlug = slugifySeoSegment((v.name || "").replace(/^the\s+/i, ""));
      return (
        slugifySeoSegment(`${stateCode} ${citySlug} ${nameSlug}`) === slugNeedle ||
        slugifySeoSegment(`${nameSlug} ${citySlug}`) === slugNeedle ||
        slugifySeoSegment(`${nameNoTheSlug} ${citySlug}`) === slugNeedle
      );
    });
    if (compositeMatch) return compositeMatch;

    // 4. Venue name slug fallback
    const nameMatch = venuesList.find(v => slugifySeoSegment(v.name) === slugNeedle);
    if (nameMatch) return nameMatch;

    return null;
  }

  if (query.cityStateSlug && query.venueSlug) {
    const targetCityState = slugifySeoSegment(query.cityStateSlug);
    const targetVenueSlug = slugifySeoSegment(query.venueSlug);

    return (
      venuesList.find(v => {
        const cityState = `${slugifySeoSegment(v.city || "")}-${extractVenueStateCode(v).toLowerCase()}`;
        if (cityState !== targetCityState) return false;
        return (
          slugifySeoSegment(v.name) === targetVenueSlug ||
          slugifySeoSegment(v.id || "") === targetVenueSlug
        );
      }) || null
    );
  }

  return null;
}

/**
 * Resolves any non-canonical venue URL (UUID, secondary slug, uppercase, trailing slash,
 * or legacy un-trimmed hyphen) to its single canonical `/venues/[city-state]/[slug]` path.
 * Returns null if the URL is already canonical or is not a redirectable venue profile URL.
 */
export function resolveVenueCanonicalRedirect(
  rawPath: string,
  venuesList: Venue[] = MUSIC_VENUES
): string | null {
  const pathOnly = rawPath.split("?")[0].split("#")[0];
  const trimmed = pathOnly.replace(/^\/+|\/+$/g, "");
  const parts = trimmed.split("/");

  if (parts[0]?.toLowerCase() !== "venues" || parts.length < 2) {
    return null;
  }

  // Old /venues/venue/:venueId (UUID or secondary slug)
  if (parts.length === 3 && parts[1].toLowerCase() === "venue") {
    const matched = findVenueByIdentifierOrSlug({ idOrSlug: parts[2] }, venuesList);
    if (!matched) return null;
    const canonicalPath = buildCanonicalVenuePath(matched);
    return canonicalPath !== pathOnly ? canonicalPath : null;
  }

  // Canonical /venues/:city-state/:venueSlug — enforce lowercase, clean hyphens, no trailing slash
  if (parts.length === 3 && /^(.+)-([a-z]{2})$/i.test(parts[1])) {
    const matched = findVenueByIdentifierOrSlug(
      { cityStateSlug: parts[1], venueSlug: parts[2] },
      venuesList
    );
    if (matched) {
      const canonicalPath = buildCanonicalVenuePath(matched);
      return canonicalPath !== pathOnly ? canonicalPath : null;
    }
    const normalizedPath = `/venues/${slugifySeoSegment(parts[1])}/${slugifySeoSegment(parts[2])}`;
    return normalizedPath !== pathOnly ? normalizedPath : null;
  }

  return null;
}

export function buildVenueProfileSeoRoute(
  venue: Venue,
  overrideCityStateSlug?: string,
  overrideVenueSlug?: string
): ProgrammaticVenueRoute {
  const canonicalPath = buildCanonicalVenuePath(venue);
  const city = venue.city || capitalizeWords((overrideCityStateSlug || "").replace(/-[a-z]{2}$/i, ""));
  const stateCode = extractVenueStateCode(venue) || "US";
  const stateName = STATE_MAP[stateCode] || stateCode;
  const cityStateSlug = `${slugifySeoSegment(city)}-${stateCode.toLowerCase()}`;
  const venueSlug = overrideVenueSlug ? slugifySeoSegment(overrideVenueSlug) : slugifySeoSegment(venue.name);
  const capText = venue.capacity ? ` (${venue.capacity} cap)` : "";
  const genreList = Array.isArray(venue.genres) && venue.genres.length > 0 ? venue.genres.slice(0, 4).join(", ") : "Live Music";

  return {
    isProgrammatic: true,
    type: "venue-profile",
    city,
    stateCode,
    stateName,
    venueSlug,
    venueName: venue.name,
    venueId: venue.id,
    venue,
    canonicalPath,
    title: `${venue.name} in ${city}, ${stateCode} — Venue Specs & Booking Contact | GigLizard`,
    description: `Book shows at ${venue.name} in ${city}, ${stateCode}${capText}. Genres: ${genreList}. View verified booking email, house PA specs, and stage details on GigLizard.`,
    heading: `${venue.name} — Live Music Venue & Booking Specs in ${city}, ${stateCode}`,
    subhead: `Direct booking contact, soundboard/PA specs, room capacity${capText}, and touring details for ${venue.name} in ${city}, ${stateName}.`,
    breadcrumb: [
      { name: "Home", url: `${CANONICAL_DOMAIN}/` },
      { name: "Venues", url: `${CANONICAL_DOMAIN}/venues` },
      { name: `${city}, ${stateCode}`, url: `${CANONICAL_DOMAIN}/venues/${cityStateSlug}` },
      { name: venue.name, url: `${CANONICAL_DOMAIN}${canonicalPath}` }
    ]
  };
}

/**
 * Parses any venue URL path into programmatic SEO details.
 * Examples:
 *   /venues/nashville-tn/club-handy
 *   /venues/austin-tx
 *   /venues/rock/chicago
 */
export function parseProgrammaticVenuePath(
  rawPath: string,
  venuesList: Venue[] = MUSIC_VENUES
): ProgrammaticVenueRoute | null {
  const clean = rawPath.split("?")[0].split("#")[0].replace(/^\/+|\/+$/g, "").toLowerCase();
  const parts = clean.split("/");

  if (parts[0] !== "venues" || parts.length < 2) {
    return null;
  }

  // Format 1: /venues/:cityState/:venueSlug OR /venues/venue/:venueId OR /venues/:genre/:city
  if (parts.length === 3) {
    // Sub-format 1A: /venues/venue/:venueId (legacy UUID or secondary slug)
    // Always resolve to the single canonical /venues/:city-state/:venueSlug path if found
    if (parts[1] === "venue") {
      const matched = findVenueByIdentifierOrSlug({ idOrSlug: parts[2] }, venuesList);
      if (!matched) {
        return null;
      }
      return buildVenueProfileSeoRoute(matched);
    }

    // Sub-format 1B: /venues/:city-state/:venueSlug (e.g. /venues/nashville-tn/club-handy)
    const cityStateMatch = parts[1].match(/^(.+)-([a-z]{2})$/i);
    if (cityStateMatch) {
      const matched = findVenueByIdentifierOrSlug(
        { cityStateSlug: parts[1], venueSlug: parts[2] },
        venuesList
      );
      if (matched) {
        return buildVenueProfileSeoRoute(matched, parts[1], parts[2]);
      }

      const citySlug = slugifySeoSegment(cityStateMatch[1]);
      const stateCode = cityStateMatch[2].toUpperCase();
      const city = capitalizeWords(citySlug);
      const stateName = STATE_MAP[stateCode] || stateCode;
      const venueSlug = slugifySeoSegment(parts[2]);
      const venueName = capitalizeWords(venueSlug);
      const canonicalPath = `/venues/${citySlug}-${stateCode.toLowerCase()}/${venueSlug}`;

      return {
        isProgrammatic: true,
        type: "venue-profile",
        city,
        stateCode,
        stateName,
        venueSlug,
        venueName,
        canonicalPath,
        title: `${venueName} in ${city}, ${stateCode} — Venue Specs & Booking Contact | GigLizard`,
        description: `View verified booking contact email, stage specs, capacity, and production guidelines for ${venueName} in ${city}, ${stateCode}.`,
        heading: `${venueName} — Live Music Venue & Booking Specs in ${city}, ${stateCode}`,
        subhead: `Direct talent buyer inboxes, soundboard channels, PA rig, and stage layout at ${venueName} in ${city}, ${stateName}.`,
        breadcrumb: [
          { name: "Home", url: `${CANONICAL_DOMAIN}/` },
          { name: "Venues", url: `${CANONICAL_DOMAIN}/venues` },
          { name: `${city}, ${stateCode}`, url: `${CANONICAL_DOMAIN}/venues/${citySlug}-${stateCode.toLowerCase()}` },
          { name: venueName, url: `${CANONICAL_DOMAIN}${canonicalPath}` }
        ]
      };
    }

    // Sub-format 1C: /venues/:genre/:city (e.g. /venues/rock/chicago)
    const genreSlug = parts[1];
    const citySlug = parts[2];
    const genre = capitalizeWords(genreSlug);
    const city = capitalizeWords(citySlug);

    // Look for matching popular city to get state code if known
    const matchedCity = POPULAR_TOURING_CITIES.find(c => c.city.toLowerCase() === city.toLowerCase());
    const stateCode = matchedCity ? matchedCity.state : undefined;
    const stateName = stateCode ? STATE_MAP[stateCode] : undefined;

    const locationSuffix = stateCode ? `${city}, ${stateCode}` : city;
    const title = `${genre} Venues in ${locationSuffix} | GigLizard`;
    const description = `Find verified ${genre.toLowerCase()} music venues in ${locationSuffix}. Direct talent buyer booking emails, club sound specs, and room capacities for DIY touring bands.`;
    const heading = `${genre} Music Venues in ${locationSuffix}`;
    const subhead = `Explore bookable ${genre.toLowerCase()} stages, live audio specs, and verified booking emails across ${locationSuffix} for independent touring acts.`;

    return {
      isProgrammatic: true,
      type: "genre-city",
      city,
      stateCode,
      stateName,
      genre,
      canonicalPath: `/venues/${genreSlug}/${citySlug}`,
      title,
      description,
      heading,
      subhead,
      breadcrumb: [
        { name: "Home", url: "https://www.giglizard.us/" },
        { name: "Venues", url: "https://www.giglizard.us/venues" },
        { name: `${genre} in ${locationSuffix}`, url: `https://www.giglizard.us/venues/${genreSlug}/${citySlug}` }
      ]
    };
  }

  // Format 2: /venues/:param (either city-state like austin-tx, or city, or genre)
  if (parts.length === 2) {
    const param = parts[1];

    // Check for city-state format: e.g. "austin-tx", "seattle-wa", "salt-lake-city-ut"
    const dashMatch = param.match(/^(.+)-([a-z]{2})$/i);
    if (dashMatch) {
      const citySlug = dashMatch[1];
      const stateSlug = dashMatch[2].toUpperCase();
      const city = capitalizeWords(citySlug);
      const stateCode = stateSlug;
      const stateName = STATE_MAP[stateCode] || stateCode;

      const title = `Music Venues in ${city}, ${stateCode} | Booking & Production Specs - GigLizard`;
      const description = `Find and contact verified music venues in ${city}, ${stateCode}. View stage specs, capacities, and DIY booking guidelines for touring bands.`;
      const heading = `Live Music Venues & Booking Specs in ${city}, ${stateCode}`;
      const subhead = `Explore verified live stages, club capacities, soundboard specs, and direct talent buyer inboxes across ${city}, ${stateName}.`;

      return {
        isProgrammatic: true,
        type: "city-state",
        city,
        stateCode,
        stateName,
        canonicalPath: `/venues/${param}`,
        title,
        description,
        heading,
        subhead,
        breadcrumb: [
          { name: "Home", url: "https://www.giglizard.us/" },
          { name: "Venues", url: "https://www.giglizard.us/venues" },
          { name: `${city}, ${stateCode}`, url: `https://www.giglizard.us/venues/${param}` }
        ]
      };
    }

    // Check if param matches a known city directly (e.g. "austin", "seattle")
    const matchedCity = POPULAR_TOURING_CITIES.find(
      c => c.city.toLowerCase() === param.toLowerCase() || c.slug === param.toLowerCase()
    );
    if (matchedCity) {
      const city = matchedCity.city;
      const stateCode = matchedCity.state;
      const stateName = STATE_MAP[stateCode] || stateCode;

      return {
        isProgrammatic: true,
        type: "city-state",
        city,
        stateCode,
        stateName,
        canonicalPath: `/venues/${matchedCity.slug}`,
        title: `Music Venues in ${city}, ${stateCode} | Booking & Production Specs - GigLizard`,
        description: `Find and contact verified music venues in ${city}, ${stateCode}. View stage specs, capacities, and DIY booking guidelines for touring bands.`,
        heading: `Live Music Venues & Booking Specs in ${city}, ${stateCode}`,
        subhead: `Explore verified live stages, club capacities, soundboard specs, and direct talent buyer inboxes across ${city}, ${stateName}.`,
        breadcrumb: [
          { name: "Home", url: "https://www.giglizard.us/" },
          { name: "Venues", url: "https://www.giglizard.us/venues" },
          { name: `${city}, ${stateCode}`, url: `https://www.giglizard.us/venues/${matchedCity.slug}` }
        ]
      };
    }

    // Check if param matches a genre directly (e.g. "rock", "punk", "indie", "metal", "electronic")
    const commonGenres = ["rock", "punk", "indie", "metal", "folk", "electronic", "hip-hop", "blues", "jazz"];
    if (commonGenres.includes(param)) {
      const genre = capitalizeWords(param);
      return {
        isProgrammatic: true,
        type: "genre-only",
        genre,
        canonicalPath: `/venues/${param}`,
        title: `${genre} Music Venues & Clubs Directory | GigLizard`,
        description: `Search verified ${genre.toLowerCase()} music clubs, listening rooms, and live stages across the USA with direct booking emails and sound specs.`,
        heading: `${genre} Music Venues Across the USA`,
        subhead: `Browse live stages catering to ${genre.toLowerCase()} acts across all 48 continental states with free booking contacts.`,
        breadcrumb: [
          { name: "Home", url: "https://www.giglizard.us/" },
          { name: "Venues", url: "https://www.giglizard.us/venues" },
          { name: `${genre} Venues`, url: `https://www.giglizard.us/venues/${param}` }
        ]
      };
    }
  }

  return null;
}
