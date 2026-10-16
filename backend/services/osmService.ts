
export type OSMPlace = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  description: string;
  website?: string;
  rawCategories: string[];
};

type GeoapifyFeature = {
  properties: {
    place_id?: string;
    name?: string;
    lat?: number;
    lon?: number;
    formatted?: string;
    address_line1?: string;
    categories?: string[];
    website?: string;
  };
};

type GeoapifyResponse = {
  features?: GeoapifyFeature[];
};

const API_URL = 'https://api.geoapify.com/v2/places';

// Примерные границы Хельсинки.
// Geoapify использует порядок долгота, широта.
const HELSINKI_BOUNDS = 'rect:24.80,60.12,25.20,60.30';



function getCategory(categories: string[] = []): string {
  const value = categories.map((item) => item.toLowerCase());

  if (
    value.some((item) =>
      item.startsWith('catering.cafe')
    )
  ) {
    return 'Cafes';
  }

  if (
    value.some((item) =>
      item.startsWith('catering.restaurant') ||
      item.startsWith('catering.fast_food') ||
      item.startsWith('catering.food_court')
    )
  ) {
    return 'Restaurants';
  }

  if (
    value.some((item) =>
      item.includes('entertainment.museum') ||
      item.includes('entertainment.culture')
    )
  ) {
    return 'Museums';
  }

  if (
    value.some((item) =>
      item.startsWith('leisure.park')
    )
  ) {
    return 'Parks';
  }

  if (
    value.some((item) =>
      item.startsWith('education.library')
    )
  ) {
    return 'Libraries';
  }

  if (
    value.some((item) =>
      item.startsWith('tourism') ||
      item.includes('heritage') ||
      item.includes('historic')
    )
  ) {
    return 'Attractions';
  }

  return 'Other';
}

export async function fetchHelsinkiPlaces(): Promise<OSMPlace[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEOAPIFY_API_KEY is missing from the root .env file'
    );
  }

const categories = [
  'catering.cafe',
  'catering.restaurant',
  'catering.fast_food',
  'catering.food_court',
  'entertainment.museum',
  'entertainment.culture',
  'leisure.park',
  'education.library',
  'tourism',
  'commercial',
  'accommodation',
].join(',');

  const allPlaces: OSMPlace[] = [];
  const seen = new Set<string>();

  // Загружаем несколько страниц, чтобы получить
  // больше мест, чем помещается в одном ответе
  const pageSize = 500;
  const maxPages = 5;

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      categories,
      filter: HELSINKI_BOUNDS,
      limit: String(pageSize),
      offset: String(page * pageSize),
      lang: 'en',
      apiKey,
    });

    const response = await fetch(`${API_URL}?${params}`, {
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const details = await response.text();

      console.error(
        'Geoapify response:',
        response.status,
        details.slice(0, 500)
      );

      throw new Error(`Geoapify API error: ${response.status}`);
    }

    const data = await response.json() as GeoapifyResponse;
    const features = data.features ?? [];

    for (const feature of features) {
      const p = feature.properties;
      const lat = p.lat;
      const lng = p.lon;

      if (
        lat == null ||
        lng == null ||
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        continue;
      }

      const id = p.place_id ?? `${lat},${lng}`;

      if (seen.has(id)) continue;
      seen.add(id);

      allPlaces.push({
        id: `geo-${id}`,
        name: p.name || p.address_line1 || p.formatted || 'Unnamed place',
        category: getCategory(p.categories),
        lat,
        lng,
        address: p.formatted || 'Helsinki',
        description: '',
        website: p.website,
        rawCategories: p.categories ?? [],
      });
    }

    if (features.length < pageSize) break;
  }

  return allPlaces;
}
