
import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
} from 'react-leaflet';
import { fetchPlaces, type Place } from '../services/placesService';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from '../translations';
import Header from '../components/header';
import Footer from '../components/footer';

const categories = [
  { value: 'All', key: 'allCategories' },
  { value: 'Attractions', key: 'attractions' },
  { value: 'Museums', key: 'museums' },
  { value: 'Cafes', key: 'cafes' },
  { value: 'Restaurants', key: 'restaurants' },
  { value: 'Parks', key: 'parks' },
  { value: 'Libraries', key: 'libraries' },
  { value: 'Other', key: 'other' },
] as const;

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function MapFocus({ place }: { place: Place | undefined }) {
  const map = useMap();

  useEffect(() => {
    if (place) {
      map.setView([place.lat, place.lng], 16, { animate: true });
    }
  }, [map, place?.id, place?.lat, place?.lng]);

  return null;
}

function MapFavoriteButton({ placeId }: { placeId: string }) {
  const [saved, setSaved] = useState(() => isFavorite('place', placeId));
  const { language } = useLanguage();
  const t = useTranslations(language);

  useEffect(() => {
    function updateFavorites() {
      setSaved(isFavorite('place', placeId));
    }

    window.addEventListener(
      'helsinguide-favorites-changed',
      updateFavorites,
    );

    return () => {
      window.removeEventListener(
        'helsinguide-favorites-changed',
        updateFavorites,
      );
    };
  }, [placeId]);

  function handleClick() {
    toggleFavorite('place', placeId);
    setSaved(isFavorite('place', placeId));
  }

  return (
    <button
      className={`button map-details-button map-save-button ${
        saved ? 'is-saved' : ''
      }`}
      type="button"
      aria-pressed={saved}
      onClick={handleClick}
    >
      {saved ? `♥ ${t.savedToFavorites}` : `♡ ${t.savePlace}`}
    </button>
  );
}

function MapPage() {
  const initialPlaceId = new URLSearchParams(window.location.search)
    .get('place');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedId, setSelectedId] = useState<string | null>(
    initialPlaceId,
  );
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const { language } = useLanguage();
  const t = useTranslations(language);

  useEffect(() => {
    let cancelled = false;

    async function loadPlaces() {
      try {
        setIsLoading(true);
        setLoadError(false);

        const data = await fetchPlaces();

        if (!cancelled) {
          setPlaces(data);
        }
      } catch (error) {
        console.error('Failed to load places:', error);

        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPlaces();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPlaces = useMemo(() => {
    const query = search.trim().toLowerCase();

    return places.filter((place) => {
      const matchesSearch =
        place.name.toLowerCase().includes(query) ||
        place.category.toLowerCase().includes(query) ||
        place.address.toLowerCase().includes(query);

      const matchesCategory =
        category === 'All' || place.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [places, search, category]);

  const selectedPlace =
    places.find((place) => place.id === selectedId) ??
    filteredPlaces[0];

  return (
    <>
      <Header />

      <main className="map-page">
        <p className="eyebrow">{t.mapEyebrow}</p>
        <h1>{t.discoverHelsinki}</h1>
        <p className="listing-intro">{t.exploreCity}</p>

        <form
          className="listing-search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="sr-only" htmlFor="map-search">
            {t.searchMapLabel}
          </label>

          <input
            id="map-search"
            type="search"
            placeholder={t.searchPlaces}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <button className="button button--primary" type="submit">
            {t.searchButton} →
          </button>
        </form>

        <div className="category-filters">
          {categories.map((item) => (
            <button
              key={item.value}
              className={`category-chip ${
                category === item.value ? 'is-active' : ''
              }`}
              type="button"
              aria-pressed={category === item.value}
              onClick={() => setCategory(item.value)}
            >
              {t[item.key]}
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="map-result-count" role="status">
            {t.loadingPlaces}
          </p>
        )}

        {loadError && (
          <p className="map-result-count" role="alert">
            {t.couldNotLoadPlaces}
          </p>
        )}

        {!isLoading && !loadError && (
          <p className="map-result-count">
            {filteredPlaces.length} {t.foundPlaces}
          </p>
        )}

        <div className="map-layout">
          <div className="city-map">
            <MapContainer
              center={
                selectedPlace
                  ? [selectedPlace.lat, selectedPlace.lng]
                  : [60.1705, 24.9415]
              }
              zoom={selectedPlace ? 16 : 14}
              scrollWheelZoom={true}
              className="leaflet-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapFocus place={selectedPlace} />

              {filteredPlaces.map((place) => (
                <CircleMarker
                  key={place.id}
                  center={[place.lat, place.lng]}
                  radius={selectedPlace?.id === place.id ? 10 : 7}
                  pathOptions={{
                    color: '#FAF8F3',
                    weight: 3,
                    fillColor:
                      selectedPlace?.id === place.id
                        ? '#263C40'
                        : '#466C73',
                    fillOpacity: 1,
                  }}
                  eventHandlers={{
                    click: () => setSelectedId(place.id),
                  }}
                />
              ))}
            </MapContainer>

            <span className="map-credit">
              Map data © OpenStreetMap contributors
            </span>
          </div>

          {selectedPlace ? (
            <aside className="map-selected-card">
              <div className="map-selected-heading">
                <span className="eyebrow">{t.selectedPlace}</span>

                <button
                  type="button"
                  aria-label={t.closeSelectedPlace}
                  onClick={() => setSelectedId(null)}
                >
                  ×
                </button>
              </div>

              <div className="map-details-placeholder">
                <span>{selectedPlace.category}</span>
              </div>

              <h2>{selectedPlace.name}</h2>

              <p className="map-selected-meta">
                {selectedPlace.category}
              </p>

              <p>{selectedPlace.description}</p>
              <p className="map-selected-address">
                {selectedPlace.address}
              </p>

              <a
                className="button button--primary map-details-button"
                href={`/place/${makeSlug(selectedPlace.name)}`}
              >
                View details →
              </a>

              {selectedPlace.website && (
                <a
                  className="button button--secondary map-details-button"
                  href={selectedPlace.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t.visitWebsite} ↗
                </a>
              )}

              <MapFavoriteButton
                key={selectedPlace.id}
                placeId={selectedPlace.id}
              />
            </aside>
          ) : (
            <aside className="map-selected-card map-no-selection">
              <h2>{t.selectPlace}</h2>
              <p>{t.selectPlaceHint}</p>

              <button
                type="button"
                className="button button--secondary"
                onClick={() =>
                  setSelectedId(filteredPlaces[0]?.id ?? null)
                }
                disabled={filteredPlaces.length === 0}
              >
                {t.showFirstResult}
              </button>
            </aside>
          )}
        </div>
      </main>
    <Footer />
    </>
  );
}

export default MapPage;
