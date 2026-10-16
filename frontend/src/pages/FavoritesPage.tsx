
import { useEffect, useState } from 'react';
import { fetchPlaces, type Place } from '../services/placesService';
import Header from '../components/header';
import Footer from '../components/footer';
import {
  getFavorites,
  toggleFavorite,
  type FavoriteItem,
} from '../utils/favorites';
import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from '../translations';

const routes = [
  {
    title: 'Classic Helsinki',
    category: 'Culture',
    description: 'Discover historic squares and beautiful architecture.',
    duration: '2 hours',
    image:
      'https://images.unsplash.com/photo-1555993539-1732b0258235?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Seaside Escape',
    category: 'Nature',
    description: 'Enjoy waterfront views and peaceful walking paths.',
    duration: '1.5 hours',
    image:
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Coffee & Design',
    category: 'Food',
    description: 'Explore Helsinki design spots and cosy local cafés.',
    duration: '2.5 hours',
    image:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=700&q=80',
  },
];

function normalizeId(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(getFavorites);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [placesError, setPlacesError] = useState('');

  const { language } = useLanguage();
  const t = useTranslations(language);

  useEffect(() => {
    let cancelled = false;

    fetchPlaces()
      .then((data) => {
        if (!cancelled) {
          setPlaces(data);
          setPlacesError('');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPlacesError(t.couldNotLoadPlaces);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setPlacesLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [t.couldNotLoadPlaces]);

  useEffect(() => {
    function updateFavorites() {
      setFavorites(getFavorites());
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
  }, []);

  function removeFavorite(item: FavoriteItem) {
    toggleFavorite(item.type, item.id);
    setFavorites(getFavorites());
  }

  const savedPlaces = favorites
    .filter((item) => item.type === 'place')
    .map((favorite) => {
      const place = places.find(
        (item) =>
          item.id === favorite.id ||
          normalizeId(item.name) === normalizeId(favorite.id),
      );

      return place ? { ...place, favoriteId: favorite.id } : null;
    })
    .filter((item) => item !== null);

  const savedRoutes = favorites
    .filter((item) => item.type === 'route')
    .map((favorite) => {
      const route = routes.find(
        (item) => normalizeId(item.title) === normalizeId(favorite.id),
      );

      return route ? { ...route, id: favorite.id } : null;
    })
    .filter((item) => item !== null);

  const isEmpty =
    !placesLoading &&
    savedPlaces.length === 0 &&
    savedRoutes.length === 0;

  return (
    <>
      <Header />

      <main className="favorites-page">
        <p className="eyebrow">{t.yourCollection}</p>
        <h1>{t.savedFavourites}</h1>
        <p className="favorites-intro">{t.favoritesIntro}</p>

        {placesLoading && (
          <p role="status">{t.loadingPlaces}</p>
        )}

        {placesError && (
          <p role="alert">{placesError}</p>
        )}

        {isEmpty && !placesError ? (
          <section className="favorites-empty">
            <div className="favorites-empty__icon">♡</div>
            <h2>{t.collectionStarts}</h2>
            <p>{t.noFavorites}</p>

            <a className="button button--primary" href="/places">
              {t.explorePlaces}
            </a>

            <a className="favorites-empty__link" href="/routes">
              {t.discoverRoutes} →
            </a>
          </section>
        ) : (
          <>
            {savedPlaces.length > 0 && (
              <section className="favorites-section">
                <h2>{t.savedPlaces}</h2>

                <div className="favorites-grid">
                  {savedPlaces.map((place) => (
                    <article
                      className="favorites-card"
                      key={`place-${place.favoriteId}`}
                    >
                      <div className="favorites-card__body">
                        <span className="favorites-card__category">
                          {place.category}
                        </span>

                        <h3>{place.name}</h3>
                        <p>{place.address}</p>

                        <a
                          className="place-card__link"
                          href={`/place/${normalizeId(place.name)}`}
                        >
                          {t.viewDetails} ↗
                        </a>

                        {place.website && (
                          <p>
                            <a
                              href={place.website}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t.officialWebsite} ↗
                            </a>
                          </p>
                        )}

                        <button
                          className="favorites-remove"
                          type="button"
                          onClick={() =>
                            removeFavorite({
                              type: 'place',
                              id: place.favoriteId,
                            })
                          }
                        >
                          {t.removeFavorite}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {savedRoutes.length > 0 && (
              <section className="favorites-section">
                <h2>{t.savedRoutes}</h2>

                <div className="favorites-grid">
                  {savedRoutes.map((route) => (
                    <article
                      className="favorites-card"
                      key={`route-${route.id}`}
                    >
                      <img src={route.image} alt={route.title} />

                      <div className="favorites-card__body">
                        <span className="favorites-card__category">
                          {route.category} · {route.duration}
                        </span>

                        <h3>{route.title}</h3>
                        <p>{route.description}</p>

                        <a className="place-card__link" href="/routes">
                          {t.viewRoutes} ↗
                        </a>

                        <button
                          className="favorites-remove"
                          type="button"
                          onClick={() =>
                            removeFavorite({
                              type: 'route',
                              id: route.id,
                            })
                          }
                        >
                          {t.removeFavorite}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    <Footer />
    </>
  );
}

export default FavoritesPage;
