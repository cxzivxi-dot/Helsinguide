
import type { Place } from '../services/placesService';
import type { RouteDefinition } from './routes';

export function getRouteStops(
  places: Place[],
  route: RouteDefinition,
): Place[] {
  const usedIds = new Set<string>();
  const result: Place[] = [];

  for (const searchTerms of route.stopSearches) {
    const match = places.find((place) => {
      if (usedIds.has(place.id)) return false;

      const name = place.name.toLowerCase();

      return searchTerms.some((term) =>
        name.includes(term.toLowerCase()),
      );
    });

    if (match) {
      usedIds.add(match.id);
      result.push(match);
    }
  }

  return result;
}

export function distanceBetween(a: Place, b: Place): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadius = 6371;

  const latDifference = radians(b.lat - a.lat);
  const lngDifference = radians(b.lng - a.lng);

  const value =
    Math.sin(latDifference / 2) ** 2 +
    Math.cos(radians(a.lat)) *
      Math.cos(radians(b.lat)) *
      Math.sin(lngDifference / 2) ** 2;

  const safeValue = Math.max(0, Math.min(1, value));

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(safeValue), Math.sqrt(1 - safeValue))
  );
}

export function getRouteDistance(places: Place[]): number {
  let total = 0;

  for (let i = 1; i < places.length; i += 1) {
    total += distanceBetween(places[i - 1], places[i]);
  }

  return total;
}
