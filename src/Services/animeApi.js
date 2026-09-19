import { API_CONFIG } from '../Config/api';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MEDIA_FIELDS = `
  id
  idMal
  title { romaji english native }
  coverImage { extraLarge large medium }
  format
  status
  description(asHtml: false)
  episodes
  duration
  averageScore
  popularity
  genres
  studios(isMain: true) { nodes { id name } }
  startDate { year month day }
  trailer { id site }
`;

const getImageUrl = (coverImage) =>
  coverImage?.extraLarge || coverImage?.large || coverImage?.medium || '';

const formatDate = (date) => {
  if (!date?.year) return '';
  return [date.year, date.month, date.day].filter(Boolean).join('-');
};

const normalizeMedia = (media) => ({
  mal_id: media.id,
  anilist_id: media.id,
  title: media.title?.romaji || media.title?.english || media.title?.native || 'Sin título',
  title_english: media.title?.english || '',
  title_japanese: media.title?.native || '',
  images: {
    webp: {
      image_url: getImageUrl(media.coverImage),
      large_image_url: getImageUrl(media.coverImage),
    },
  },
  type: media.format || '',
  status: media.status || '',
  synopsis: media.description || '',
  score: media.averageScore ? media.averageScore / 10 : 0,
  popularity: media.popularity || 0,
  genres: (media.genres || []).map((name, index) => ({ mal_id: index, name })),
  studios: (media.studios?.nodes || []).map((studio) => ({
    mal_id: studio.id,
    name: studio.name,
  })),
  episodes: media.episodes || 0,
  duration: media.duration ? `${media.duration} min per episode` : '',
  aired: { string: formatDate(media.startDate) },
  source: 'AniList',
  trailer: media.trailer?.site === 'youtube' && media.trailer.id
    ? { url: `https://www.youtube.com/watch?v=${media.trailer.id}` }
    : null,
});

async function requestAniList(query, variables = {}, retries = API_CONFIG.maxRetries) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.requestTimeout);

  try {
    const response = await fetch(API_CONFIG.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    if ((response.status === 429 || response.status >= 500) && retries > 0) {
      await wait(API_CONFIG.retryDelay * (API_CONFIG.maxRetries - retries + 1));
      return requestAniList(query, variables, retries - 1);
    }

    if (response.status === 429) {
      throw new Error('AniList alcanzó el límite de solicitudes. Espera un momento e inténtalo de nuevo.');
    }
    if (!response.ok) {
      throw new Error(`AniList respondió con el error ${response.status}.`);
    }

    const result = await response.json();
    if (result.errors?.length) {
      throw new Error(result.errors[0].message || 'AniList no pudo completar la consulta.');
    }
    return result.data;
  } catch (error) {
    if (error.name === 'AbortError') {
      if (retries > 0) {
        await wait(API_CONFIG.retryDelay);
        return requestAniList(query, variables, retries - 1);
      }
      throw new Error('AniList tardó demasiado en responder. Inténtalo de nuevo.', {
        cause: error,
      });
    }
    if (error.name === 'TypeError' && retries > 0) {
      await wait(API_CONFIG.retryDelay);
      return requestAniList(query, variables, retries - 1);
    }
    if (error.name === 'TypeError') {
      throw new Error('No se pudo conectar con AniList.', { cause: error });
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

const mediaQuery = `query SearchAnime($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { currentPage lastPage hasNextPage total }
    media(search: $search, type: ANIME, isAdult: false, sort: POPULARITY_DESC) {
      ${MEDIA_FIELDS}
    }
  }
}`;

export async function fetchAnimeList({ query = '', page = 1 } = {}) {
  const data = await requestAniList(mediaQuery, {
    search: query.trim() || undefined,
    page,
    perPage: API_CONFIG.limit,
  });
  const pageData = data.Page;

  return {
    anime: (pageData.media || []).map(normalizeMedia),
    pagination: {
      current_page: pageData.pageInfo.currentPage,
      last_visible_page: pageData.pageInfo.lastPage,
      has_next_page: pageData.pageInfo.hasNextPage,
      total: pageData.pageInfo.total,
    },
  };
}

const animeDetailsQuery = `query AnimeDetails($id: Int!) {
  Media(id: $id, type: ANIME) { ${MEDIA_FIELDS} }
}`;

export async function fetchAnimeById(id) {
  const data = await requestAniList(animeDetailsQuery, { id: Number(id) });
  return normalizeMedia(data.Media);
}

export async function fetchAnimeEpisodes(id) {
  const data = await requestAniList(
    'query AnimeEpisodes($id: Int!) { Media(id: $id, type: ANIME) { episodes } }',
    { id: Number(id) },
  );
  return { data: [], pagination: { total: data.Media?.episodes || 0 } };
}

export async function fetchAnimeCharacters(id) {
  const data = await requestAniList(
    'query AnimeCharacters($id: Int!) { Media(id: $id, type: ANIME) { characters { edges { role node { id name { full } image { large } } } } } }',
    { id: Number(id) },
  );
  return (data.Media?.characters?.edges || []).map(({ role, node }) => ({
    mal_id: node.id,
    name: node.name?.full,
    role,
    images: { jpg: { image_url: node.image?.large } },
  }));
}

export async function fetchAnimeRecommendations(id) {
  const data = await requestAniList(
    `query AnimeRecommendations($id: Int!) { Media(id: $id, type: ANIME) { recommendations { nodes { mediaRecommendation { ${MEDIA_FIELDS} } } } } }`,
    { id: Number(id) },
  );
  return (data.Media?.recommendations?.nodes || [])
    .map((item) => item.mediaRecommendation)
    .filter(Boolean)
    .map(normalizeMedia);
}

export async function fetchMangaList({ query = '', page = 1 } = {}) {
  const data = await requestAniList(
    `query SearchManga($search: String, $page: Int, $perPage: Int) { Page(page: $page, perPage: $perPage) { pageInfo { currentPage lastPage hasNextPage total } media(search: $search, type: MANGA, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} } } }`,
    { search: query.trim() || undefined, page, perPage: API_CONFIG.limit },
  );
  return {
    data: data.Page.media.map(normalizeMedia),
    pagination: data.Page.pageInfo,
  };
}

export async function fetchMangaById(id) {
  const data = await requestAniList(
    `query MangaDetails($id: Int!) { Media(id: $id, type: MANGA) { ${MEDIA_FIELDS} } }`,
    { id: Number(id) },
  );
  return normalizeMedia(data.Media);
}

export async function fetchTopAnime(params = {}) {
  return fetchAnimeList({ page: params.page || 1 });
}

export async function fetchTopManga(params = {}) {
  return fetchMangaList({ page: params.page || 1 });
}

export async function fetchSeason(year, season) {
  const data = await requestAniList(
    `query Season($year: Int!, $season: MediaSeason) { Page(perPage: ${API_CONFIG.limit}) { media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} } } }`,
    { year: Number(year), season: season.toUpperCase() },
  );
  return { data: data.Page.media.map(normalizeMedia), pagination: {} };
}

export async function fetchCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const season = month <= 3
    ? 'WINTER'
    : month <= 6
      ? 'SPRING'
      : month <= 9
        ? 'SUMMER'
        : 'FALL';

  const data = await requestAniList(
    `query CurrentSeason($year: Int!, $season: MediaSeason) { Page(perPage: ${API_CONFIG.limit}) { media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC) { ${MEDIA_FIELDS} } } }`,
    { year: now.getFullYear(), season },
  );
  return { data: data.Page.media.map(normalizeMedia), pagination: {} };
}

export async function fetchRandomAnime() {
  const data = await requestAniList(
    `query RandomAnime { Page(perPage: 1) { media(type: ANIME, sort: TRENDING_DESC) { ${MEDIA_FIELDS} } } }`,
  );
  return normalizeMedia(data.Page.media[0]);
}
