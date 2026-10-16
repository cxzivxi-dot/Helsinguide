import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import PlaceCard from '../components/placecard';
import { fetchPlaces, type Place } from '../services/placesService';
import { routes } from '../data/routes';
import { getRouteStops, getRouteDistance } from '../data/routeUtils';
import { useLanguage } from '../context/LanguageContext';
import { useTranslations } from '../translations';
import heroImage from '../assets/helsinki-hero.png';

const featuredImages: Record<string, string> = {
  oodi: '/images/oodi.png',
  kauppatori: '/images/kauppatori.png',
  'arkkitehtuuri- ja designmuseo': '/images/designmuseo.png',
  kiasma: '/images/kiasma.png',
  'helsinki cathedral': '/images/helsinki-cathedral.png',
  'café regatta': '/images/cafe-regatta.png',
};

function getPlaceImage(place: Place) {
  const name = place.name.toLowerCase();

  const match = Object.entries(featuredImages).find(([key]) =>
    name.includes(key),
  );

  return match?.[1] ?? '';
}

function HomePage() {
  const { language } = useLanguage();
  const t = useTranslations(language);

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;

    fetchPlaces()
      .then((data) => {
        if (active) setPlaces(data);
      })
      .catch((error) => {
        console.error('Failed to load homepage places:', error);
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const featuredPlaces = useMemo(() => {
    const preferredNames = [
      'Helsingin keskustakirjasto Oodi',
      'Kauppatori',
      'Arkkitehtuuri- ja designmuseo',
    ];

    const selected: Place[] = [];

    for (const name of preferredNames) {
      const place = places.find((item) =>
        item.name.toLowerCase().includes(name.toLowerCase()),
      );

      if (place && !selected.some((item) => item.id === place.id)) {
        selected.push(place);
      }
    }

    return selected;
  }, [places]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    window.location.href = query
      ? `/places?search=${encodeURIComponent(query)}`
      : '/places';
  }

  return (
    <>
      <Header />

      <main className="editorial-home">
        <section className="editorial-hero editorial-hero--split">
          <div className="editorial-hero__content">
            <h1>{t.heroTitle}</h1>

            <p className="editorial-hero__description">
              {t.heroDescription}
            </p>

            <form className="editorial-search" onSubmit={handleSearch}>
              <label className="visually-hidden" htmlFor="home-search">
                {t.searchPlacesLabel}
              </label>

              <input
                id="home-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
              />

              <button type="submit" aria-label={t.searchButtonHome}>
                {t.searchButtonHome}{' '}
                <span aria-hidden="true">↗</span>
              </button>
            </form>
          </div>

          <div className="editorial-hero__visual">
            <img
              className="editorial-hero__image"
              src={heroImage}
              alt={t.heroImageAlt}
              fetchPriority="high"
            />

            <span className="editorial-hero__image-note">
              Helsinki, Suomi
            </span>
          </div>
        </section>

        <section className="editorial-intro">
          <p className="editorial-eyebrow">{t.getToKnowCity}</p>
          <h2>{t.introTitle}</h2>
          <p>{t.introDescription}</p>
        </section>

        <section className="editorial-explore">
          <a className="editorial-explore-card" href="/places">
            <span className="editorial-explore-card__number">01</span>
            <span className="editorial-explore-card__title">
              {t.places}
            </span>
            <span className="editorial-explore-card__description">
              {t.explorePlacesDescription}
            </span>
            <span className="editorial-explore-card__arrow">↗</span>
          </a>

          <a className="editorial-explore-card" href="/routes">
            <span className="editorial-explore-card__number">02</span>
            <span className="editorial-explore-card__title">
              {t.routes}
            </span>
            <span className="editorial-explore-card__description">
              {t.exploreRoutesDescription}
            </span>
            <span className="editorial-explore-card__arrow">↗</span>
          </a>

          <a className="editorial-explore-card" href="/map">
            <span className="editorial-explore-card__number">03</span>
            <span className="editorial-explore-card__title">
              {t.exploreMapTitle}
            </span>
            <span className="editorial-explore-card__description">
              {t.exploreMapDescription}
            </span>
            <span className="editorial-explore-card__arrow">↗</span>
          </a>
        </section>

        <section className="editorial-section" id="featured-places">
          <div className="editorial-section__heading">
            <div>
              <p className="editorial-eyebrow">
                {t.featuredEyebrow}
              </p>
              <h2>{t.featuredTitle}</h2>
            </div>

            <a href="/places" className="editorial-text-link">
              {t.allPlaces} ↗
            </a>
          </div>

          {loading && <p>{t.loadingHomepagePlaces}</p>}

          {loadError && (
            <p>{t.homepagePlacesError}</p>
          )}

          {!loading && !loadError && featuredPlaces.length === 0 && (
            <p>{t.noHomepagePlaces}</p>
          )}

          <div className="place-grid">
            {featuredPlaces.map((place) => (
              <PlaceCard
                key={place.id}
                id={place.id}
                name={place.name}
                category={place.category}
                description={
                  place.description || t.defaultPlaceDescription
                }
                address={place.address}
                image={getPlaceImage(place)}
              />
            ))}
          </div>
        </section>

        <section className="editorial-section editorial-routes">
          <div className="editorial-section__heading">
            <div>
              <p className="editorial-eyebrow">
                {t.routesEyebrow}
              </p>
              <h2>{t.routesTitle}</h2>
            </div>

            <a href="/routes" className="editorial-text-link">
              {t.allRoutes} ↗
            </a>
          </div>

          <div className="editorial-route-grid">
            {routes.map((route) => {
              const stops = getRouteStops(places, route);
              const distance = getRouteDistance(stops);

              return (
                <a
                  className="editorial-route-card"
                  href={`/route/${route.slug}`}
                  key={route.slug}
                >
                  <div className="editorial-route-card__image-wrap">
                    <img src={route.image} alt="" loading="lazy" />
                    <span>{route.category}</span>
                  </div>

                  <div className="editorial-route-card__body">
                    <h3>{route.title}</h3>
                    <p>{route.description}</p>

                    <div className="editorial-route-card__meta">
                      <span>
                        {stops.length}{' '}
                        {t.stops}
                      </span>
                      <span>
                        {t.approx} {distance.toFixed(1)} km
                      </span>
                    </div>

                    <span className="editorial-route-card__link">
                      {t.exploreRoute} ↗
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default HomePage;