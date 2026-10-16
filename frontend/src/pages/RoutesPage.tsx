
import { useEffect, useMemo, useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import { fetchPlaces, type Place } from '../services/placesService';
import { isFavorite, toggleFavorite } from '../utils/favorites';
import { routes } from '../data/routes';
import { getRouteDistance, getRouteStops } from '../data/routeUtils';

function RouteFavoriteButton({ title }: { title: string }) {
  const [saved, setSaved] = useState(() => isFavorite('route', title));

  useEffect(() => {
    function updateFavorites() {
      setSaved(isFavorite('route', title));
    }

    window.addEventListener('helsinguide-favorites-changed', updateFavorites);
    return () =>
      window.removeEventListener('helsinguide-favorites-changed', updateFavorites);
  }, [title]);

  function handleClick() {
    toggleFavorite('route', title);
    setSaved(isFavorite('route', title));
  }

  return (
    <button
      className="routes-favorite"
      type="button"
      aria-label={saved ? `Remove ${title} from favorites` : `Save ${title} to favorites`}
      aria-pressed={saved}
      onClick={handleClick}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}

function RoutesPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    fetchPlaces()
      .then((data) => {
        if (active) setPlaces(data);
      })
      .catch((err) => {
        console.error('Failed to load routes:', err);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchesCategory = category === 'All' || route.category === category;
      const matchesSearch =
        `${route.title} ${route.description} ${route.category}`
          .toLowerCase()
          .includes(search.toLowerCase().trim());

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  return (
    <>
      <Header />

      <main className="routes-page">
        <section className="routes-intro">
          <p className="routes-eyebrow">EXPLORE THE CITY</p>
          <h1>Discover Helsinki your way</h1>
          <p>
            Explore curated walking routes through Helsinki’s culture,
            coastline and design scene.
          </p>
        </section>

        <section className="routes-content">
          <div className="routes-heading">
            <div>
              <h2>Walking routes</h2>
              <p>Choose a route for your next adventure.</p>
            </div>
          </div>

          <label className="routes-search">
            <span>Search routes</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try culture, seaside, coffee..."
            />
          </label>

          <div className="routes-filters">
            {['All', 'Culture', 'Nature', 'Food'].map((item) => (
              <button
                key={item}
                type="button"
                className={`routes-filter ${category === item ? 'is-active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item === 'All' ? 'All routes' : item}
              </button>
            ))}
          </div>

          {loading && <p>Loading routes…</p>}

          {error && (
            <p>Could not load route information. Check that the backend is running.</p>
          )}

          {!loading && !error && (
            <p className="routes-result-count">
              {filteredRoutes.length} {filteredRoutes.length === 1 ? 'route' : 'routes'}
            </p>
          )}

          <div className="routes-grid">
            {filteredRoutes.map((route) => {
              const stops = getRouteStops(places, route);
              const distance = getRouteDistance(stops);

              return (
                <article className="routes-card" key={route.slug}>
                  <img
                    className="routes-card__image"
                    src={route.image}
                    alt=""
                    loading="lazy"
                  />

                  <div className="routes-card__body">
                    <div className="routes-card__top">
                      <span className="routes-card__category">{route.category}</span>
                      <RouteFavoriteButton title={route.title} />
                    </div>

                    <h3>{route.title}</h3>
                    <p>{route.description}</p>

                    <div className="routes-card__meta">
                      <span>◷ About {Math.max(30, Math.round(distance / 4 * 60))} min</span>
                      <span>↗ Approx. {distance.toFixed(1)} km</span>
                      <span>{stops.length} stops</span>
                    </div>

                    <a
                      className="routes-card__button"
                      href={`/route/${route.slug}`}
                    >
                      Explore route <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {!loading && !error && filteredRoutes.length === 0 && (
            <p>No routes match your search.</p>
          )}
        </section>
      </main>
    <Footer />
    </>
  );
}

export default RoutesPage;
