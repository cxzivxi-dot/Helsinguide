
import type { Request, Response } from 'express';
import { pool } from '../database/pool.js';
import { fetchHelsinkiPlaces } from '../services/osmService.js';

const CACHE_TTL = 30 * 60 * 1000;

type Place = Awaited<ReturnType<typeof fetchHelsinkiPlaces>>[number];

let cachedPlaces: Place[] | null = null;
let cacheExpiresAt = 0;
let refreshInProgress: Promise<Place[]> | null = null;

function toRecord(place: Place): Record<string, unknown> {
  return place as unknown as Record<string, unknown>;
}

function getText(
  record: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null) {
      return String(value);
    }
  }
  return '';
}

function getNumber(
  record: Record<string, unknown>,
  ...keys: string[]
): number {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== '') {
      const number = Number(value);
      if (Number.isFinite(number)) return number;
    }
  }
  return NaN;
}

async function savePlaces(places: Place[]) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const place of places) {
      const item = toRecord(place);
      const id = getText(item, 'id');

      const name = getText(item, 'name');
      const category = getText(item, 'category') || 'other';
      const address = getText(item, 'address');
      const latitude = getNumber(item, 'lat', 'latitude');
      const longitude = getNumber(item, 'lng', 'lon', 'longitude');
      const description = getText(item, 'description');
      const website = getText(item, 'website') || null;

      if (!id || !name || !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)) {
        continue;
      }

      await client.query(
        `INSERT INTO places
          (id, name, category, address, latitude, longitude, description, website)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           category = EXCLUDED.category,
           address = EXCLUDED.address,
           latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude,
           description = EXCLUDED.description,
           website = EXCLUDED.website`,
        [
          id, name, category, address, latitude, longitude,
          description, website,
        ],
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function readPlaces(): Promise<Place[]> {
  const result = await pool.query(
    `SELECT id, name, category, address,
            latitude, longitude, description, website
     FROM places ORDER BY name`,
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    address: row.address,
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    description: row.description,
    website: row.website ?? undefined,
  })) as Place[];
}

async function loadPlaces(): Promise<Place[]> {
  if (refreshInProgress) return refreshInProgress;

  refreshInProgress = (async () => {
    const savedPlaces = await readPlaces();

    if (savedPlaces.length > 0) {
      return savedPlaces;
    }

    const places = await fetchHelsinkiPlaces();
    await savePlaces(places);
    return places;
  })();

  try {
    const places = await refreshInProgress;
    cachedPlaces = places;
    cacheExpiresAt = Date.now() + CACHE_TTL;
    return places;
  } finally {
    refreshInProgress = null;
  }
}

export async function getPlaces(_req: Request, res: Response) {
  try {
    if (cachedPlaces && Date.now() < cacheExpiresAt) {
      res.setHeader('X-Places-Cache', 'HIT');
      res.setHeader('Cache-Control', 'public, max-age=300');

      return res.json({
        count: cachedPlaces.length,
        source: 'PostgreSQL',
        places: cachedPlaces,
      });
    }

    const places = await loadPlaces();

    res.setHeader('X-Places-Cache', 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=300');

    return res.json({
      count: places.length,
      source: 'PostgreSQL',
      places,
    });
  } catch (error) {
    console.error('Failed to load places:', error);

    return res.status(500).json({
      error: 'Could not load places',
      message: 'Check the database connection and server logs.',
    });
  }
}
