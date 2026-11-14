const SUPPORTED_URL_PROTOCOLS = new Set([
  'http:',
  'https:',
  'mailto:',
  'sms:',
  'tel:',
  'ftp:',
]);

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    // eslint-disable-next-line no-script-url
    if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return 'about:blank';
    }
  } catch {
    return url;
  }
  return url;
}

// Source: https://stackoverflow.com/a/8234912/2013580
const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/
);

export function validateUrl(url: string): boolean {
  return url === 'https://' || urlRegExp.test(url);
}

export interface Metadata {
  title: string;
  description: string;
  image?: string;
  website: string;
  logo: string;
}

export function normalizeUrl(rawUrl: string): string {
  let trimmed = (rawUrl || '').trim();
  if (/^www\./i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

export function extractYouTubeId(url: string): string | null {
  try {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
    );
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export function cleanTitleFromUrl(urlStr: string): string {
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname.replace(/\/+$/, '');
    if (!path || path === '/') {
      return parsed.hostname.replace(/^www\./, '');
    }
    const segment = path.split('/').pop() || '';
    const clean = segment
      .replace(/\.[a-zA-Z0-9]+$/, '')
      .replace(/[-_]+/g, ' ')
      .trim();
    if (clean.length > 2) {
      return clean
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return urlStr;
  }
}

/**
 * Synchronous instant metadata preloader - returns rich preview information
 * immediately without waiting for network requests (e.g. YouTube thumbnail & provider,
 * GitHub repo card, direct image preview, or formatted URL metadata).
 */
export function getInitialMetadata(rawUrl: string): Metadata {
  const url = normalizeUrl(rawUrl);
  let hostname = 'link';
  try {
    hostname = new URL(url).hostname.replace(/^www\./, '');
  } catch {}

  const defaultFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;

  // 1. YouTube instant preload
  const ytId = extractYouTubeId(url);
  if (ytId) {
    return {
      title: 'YouTube Video',
      description: 'Watch on YouTube',
      image: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      website: 'YouTube',
      logo: 'https://www.youtube.com/s/desktop/28b0985e/img/favicon.ico',
    };
  }

  // 2. GitHub instant preload
  const ghMatch = url.match(
    /^https?:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i
  );
  if (ghMatch) {
    const [, owner, repo] = ghMatch;
    return {
      title: `${owner}/${repo}`,
      description: 'GitHub repository',
      image: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
      website: 'GitHub',
      logo: 'https://github.githubassets.com/favicons/favicon.svg',
    };
  }

  // 3. Direct Image URL
  if (/\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url)) {
    return {
      title: cleanTitleFromUrl(url),
      description: 'Image',
      image: url,
      website: hostname,
      logo: defaultFavicon,
    };
  }

  // 4. Default clean fallback
  return {
    title: cleanTitleFromUrl(url) || hostname,
    description: `Open link on ${hostname}`,
    image: undefined,
    website: hostname,
    logo: defaultFavicon,
  };
}

/**
 * Asynchronously fetches full metadata (oEmbed, OpenGraph, title, description, thumbnail)
 * using resilient fallbacks so link previews always succeed.
 */
export async function fetchMetadata(rawUrl: string): Promise<Metadata> {
  const url = normalizeUrl(rawUrl);
  const fallback = getInitialMetadata(url);

  // 1. YouTube via oEmbed
  const ytId = extractYouTubeId(url);
  if (ytId) {
    try {
      const res = await fetch(
        `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) {
          return {
            title: data.title,
            description: data.author_name
              ? `by ${data.author_name} • YouTube`
              : 'Watch on YouTube',
            image:
              data.thumbnail_url ||
              `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
            website: 'YouTube',
            logo: fallback.logo,
          };
        }
      }
    } catch {
      // Return fallback with YouTube thumbnail
    }
    return fallback;
  }

  // 2. GitHub repo via public API
  const ghMatch = url.match(
    /^https?:\/\/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i
  );
  if (ghMatch) {
    const [, owner, repo] = ghMatch;
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: { Accept: 'application/vnd.github.v3+json' },
          signal: AbortSignal.timeout(4000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.full_name || `${owner}/${repo}`,
          description:
            data.description ||
            (data.stargazers_count != null
              ? `★ ${data.stargazers_count.toLocaleString()} on GitHub`
              : 'GitHub repository'),
          image: `https://opengraph.githubassets.com/1/${owner}/${repo}`,
          website: 'GitHub',
          logo: fallback.logo,
        };
      }
    } catch {
      // Return fallback
    }
    return fallback;
  }

  // 3. Vimeo
  if (/vimeo\.com\/\d+/i.test(url)) {
    try {
      const res = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || fallback.title,
          description:
            data.description ||
            (data.author_name ? `by ${data.author_name} • Vimeo` : 'Vimeo Video'),
          image: data.thumbnail_url || fallback.image,
          website: 'Vimeo',
          logo: fallback.logo,
        };
      }
    } catch {}
  }

  // 4. Spotify
  if (/spotify\.com/i.test(url)) {
    try {
      const res = await fetch(
        `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || fallback.title,
          description: 'Listen on Spotify',
          image: data.thumbnail_url || fallback.image,
          website: 'Spotify',
          logo: fallback.logo,
        };
      }
    } catch {}
  }

  // 5. SoundCloud
  if (/soundcloud\.com/i.test(url)) {
    try {
      const res = await fetch(
        `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title || fallback.title,
          description: data.author_name
            ? `by ${data.author_name} • SoundCloud`
            : 'SoundCloud',
          image: data.thumbnail_url || fallback.image,
          website: 'SoundCloud',
          logo: fallback.logo,
        };
      }
    } catch {}
  }

  // 6. Generic oEmbed via noembed.com
  try {
    const res = await fetch(
      `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.title && !data.error) {
        return {
          title: data.title,
          description: data.author_name
            ? `by ${data.author_name}`
            : data.provider_name || fallback.description,
          image: data.thumbnail_url || fallback.image,
          website: data.provider_name || fallback.website,
          logo: fallback.logo,
        };
      }
    }
  } catch {}

  // 7. General HTML OpenGraph parser via CORS proxy
  try {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const response = await fetch(`${proxyUrl}${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.contents && typeof DOMParser !== 'undefined') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');

        const getMetaTagContent = (property: string) => {
          const element =
            doc.querySelector(`meta[property="${property}"]`) ||
            doc.querySelector(`meta[name="${property}"]`);
          return element ? element.getAttribute('content') : null;
        };

        const title =
          getMetaTagContent('og:title') ||
          getMetaTagContent('twitter:title') ||
          doc.querySelector('title')?.textContent?.trim() ||
          fallback.title;

        const description =
          getMetaTagContent('og:description') ||
          getMetaTagContent('twitter:description') ||
          getMetaTagContent('description') ||
          fallback.description;

        const image =
          getMetaTagContent('og:image') ||
          getMetaTagContent('twitter:image') ||
          fallback.image;

        const website =
          getMetaTagContent('og:site_name') || fallback.website;

        return {
          title,
          description,
          image: image || undefined,
          website,
          logo: fallback.logo,
        };
      }
    }
  } catch {}

  return fallback;
}
