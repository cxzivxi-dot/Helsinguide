
export type FavoriteType = 'place' | 'route';

export type FavoriteItem = {
  type: FavoriteType;
  id: string;
};

const STORAGE_KEY = 'helsinguide-favorites';

const legacyPlaceIds: Record<number, string> = {
  1: 'kiasma',
  2: 'helsinki-cathedral',
  3: 'café-regatta',
  4: 'esplanadi-park',
  5: 'oodi-library',
  6: 'restaurant-savotta',
};

function normalizeId(id: string): string {
  return id
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getFavorites(): FavoriteItem[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]',
    );

    if (!Array.isArray(stored)) return [];

    return stored
      .map((item: unknown): FavoriteItem | null => {
        // Поддержка старого формата, где хранились только числовые ID мест.
        if (typeof item === 'number') {
          const id = legacyPlaceIds[item];
          return id ? { type: 'place', id } : null;
        }

        if (
          typeof item === 'object' &&
          item !== null &&
          'type' in item &&
          'id' in item &&
          (item.type === 'place' || item.type === 'route') &&
          (typeof item.id === 'string' || typeof item.id === 'number')
        ) {
          return {
            type: item.type,
            id: String(item.id),
          };
        }

        return null;
      })
      .filter((item): item is FavoriteItem => item !== null);
  } catch {
    return [];
  }
}

export function isFavorite(
  type: FavoriteType,
  id: string,
): boolean {
  const normalizedId = normalizeId(id);

  return getFavorites().some(
    (item) =>
      item.type === type && normalizeId(item.id) === normalizedId,
  );
}

export function toggleFavorite(
  type: FavoriteType,
  id: string,
): FavoriteItem[] {
  const favorites = getFavorites();
  const normalizedId = normalizeId(id);

  const exists = favorites.some(
    (item) =>
      item.type === type && normalizeId(item.id) === normalizedId,
  );

  const updated = exists
    ? favorites.filter(
        (item) =>
          !(
            item.type === type &&
            normalizeId(item.id) === normalizedId
          ),
      )
    : [...favorites, { type, id: normalizedId }];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  window.dispatchEvent(new Event('helsinguide-favorites-changed'));

  return updated;
}
