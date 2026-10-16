
import { useEffect, useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import { fetchPlaces, type Place } from '../services/placesService';
import {
  isFavorite,
  toggleFavorite,
} from '../utils/favorites';

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function PlaceDetailsPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState(false);

  const slug = window.location.pathname
    .split('/')
    .filter(Boolean)
    .at(-1) ?? '';

  const place = places.find(
    (item) =>
      item.id === slug ||
      normalizeSlug(item.name) === normalizeSlug(slug),
  );

  useEffect(() => {
    let active = true;

    fetchPlaces()
      .then((data) => {
        if (active) setPlaces(data);
      })
      .catch((err) => {
        console.error('Failed to load place details:', err);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!place) return;

    const placeId = place.id;

    function updateFavorite() {
      setSaved(isFavorite('place', placeId));
    }

    updateFavorite();

    window.addEventListener(
      'helsinguide-favorites-changed',
      updateFavorite,
    );

    return () => {
      window.removeEventListener(
        'helsinguide-favorites-changed',
        updateFavorite,
      );
    };
  }, [place?.id]);

  function handleFavorite() {
    if (!place) return;

    toggleFavorite('place', place.id);
    setSaved(isFavorite('place', place.id));
  }

  const website = place?.website?.trim();
  const validWebsite =
    website && /^https?:\/\//i.test(website) ? website : null;

  return (
    <>
      <Header />

      <main className="details-page">
        <a className="back-link" href="/places">
          ← Back to places
        </a>

        {loading ? (
          <div className="empty-state">
            <h2>Loading place…</h2>
            <p>Getting place information.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h2>Could not load this place</h2>
            <p>Please check your connection and try again.</p>
            <a className="button button--primary" href="/places">
              Back to places
            </a>
          </div>
        ) : !place ? (
          <div className="empty-state">
            <h2>Place not found</h2>
            <p>This place may no longer be available in the catalogue.</p>
            <a className="button button--primary" href="/places">
              Browse places
            </a>
          </div>
        ) : (
          <>
            <section className="details-title">
              <p className="eyebrow">
                {place.category} / HELSINKI
              </p>

              <h1>{place.name}</h1>

              <p className="details-info-label">Address</p>
              <p>{place.address || 'Address not available'}</p>

              <div className="details-actions">
                <button
                  className={`button ${
                    saved ? 'button--primary' : 'button--secondary'
                  }`}
                  type="button"
                  onClick={handleFavorite}
                  aria-pressed={saved}
                >
                  {saved ? '♥ Saved to favorites' : '♡ Add to favorites'}
                </button>

                <a
  className="button button--secondary"
  href={`/map?place=${encodeURIComponent(place.id)}`}
>
  View on map →
</a>
              </div>
            </section>

            <div className="details-layout">
              <section className="details-main">
                <p className="eyebrow">ABOUT THIS PLACE</p>
                <h2>Place information</h2>
                <p>
                  {place.description ||
                    'Additional information about this place is not available yet.'}
                </p>
              </section>

              <aside className="details-sidebar">
                <section>
                  <p className="eyebrow">VISIT</p>
                  <h3>Useful information</h3>

                  <p className="details-info-label">Address</p>
                  <p>{place.address || 'Address not available'}</p>

                  {validWebsite && (
                    <>
                      <p className="details-info-label">Official website</p>
                      <a
                        className="button button--primary details-full-button"
                        href={validWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit website ↗
                      </a>
                    </>
                  )}

                  {!validWebsite && (
                    <p>
                      A website link is not available for this place.
                    </p>
                  )}
                </section>
              </aside>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

export default PlaceDetailsPage;
