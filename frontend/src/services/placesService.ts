
export type Place = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address: string;
  description: string;
  website?: string;
};

type PlacesResponse = {
  count: number;
  source: string;
  places: Place[];
};

const API_URL = 'http://localhost:3000/api';

let cachedPlaces: Place[] | null = null;
let pendingRequest: Promise<Place[]> | null = null;

export async function fetchPlaces(): Promise<Place[]> {
  // Return the cached list if it has already loaded.
  if (cachedPlaces !== null) {
    return cachedPlaces;
  }

  // Reuse a request that is already in progress.
  if (pendingRequest !== null) {
    return pendingRequest;
  }

  pendingRequest = (async () => {
    const response = await fetch(`${API_URL}/places`);

    if (!response.ok) {
      throw new Error('Failed to load places');
    }

    const data: PlacesResponse = await response.json();

    cachedPlaces = data.places;
    return cachedPlaces;
  })();

  try {
    return await pendingRequest;
  } catch (error) {
    // Allow another attempt if the request fails.
    cachedPlaces = null;
    throw error;
  } finally {
    pendingRequest = null;
  }
}
