
import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Popup,
} from 'react-leaflet';
import Header from '../components/header';
import Footer from '../components/footer';
import { fetchPlaces, type Place } from '../services/placesService';
import { routes } from '../data/routes';
import { getRouteDistance, getRouteStops } from '../data/routeUtils';

function RouteDetailsPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const slug = window.location.pathname.split('/').filter(Boolean).at(-1) ?? '';
  const route = routes.find((item) => item.slug === slug);

  useEffect(() => {
    let active = true;

    fetchPlaces()
      .then((data) => {
        if (active) setPlaces(data);
      })
      .catch((err) => {
        console.error('Failed to load route stops:', err);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const stops = useMemo(
    () => (route ? getRouteStops(places, route) : []),
    [places, route],
  );

  const distance = useMemo(() => getRouteDistance(stops), [stops]);

  if (!route) {
    return (
      <>
        <Header />
        <main className="route-details-page">
          <h1>Route not found</h1>
          <p>This route does not exist.</p>
          <a href="/routes">← Back to routes</a>
        </main>
      </>
    );
  }

  const walkingMinutes = Math.max(30, Math.round((distance / 4) * 60));

  return (
    <>
      <Header />

      <main className="route-details-page">
        <a className="route-details-back" href="/routes">
          ← Back to routes
        </a>

        <section className="route-details-intro">
          <p className="routes-eyebrow">{route.category} · WALKING ROUTE</p>
          <h1>{route.title}</h1>
          <p>{route.description}</p>

          <div className="route-details-stats">
            <span>📍 {stops.length} stops</span>
            <span>↗ Approx. {distance.toFixed(1)} km in straight-line segments</span>
            <span>◷ About {walkingMinutes} min walking, excluding stops</span>
          </div>
        </section>

        {loading && <p>Loading route stops…</p>}

        {error && (
          <p>Could not load places. Make sure the backend server is running.</p>
        )}

        {!loading && !error && stops.length === 0 && (
          <p>No matching places were found in the database for this route yet.</p>
        )}

        {stops.length > 0 && (
          <section className="route-details-layout">
            <div className="route-stops">
              <h2>Route stops</h2>
              <ol className="route-stops-list">
                {stops.map((place, index) => (
                  <li key={place.id}>
                    <span className="route-stop-number">{index + 1}</span>
                    <div>
                      <h3>{place.name}</h3>
                      <p>{place.address || place.category}</p>
                      <a href={`/place/${encodeURIComponent(place.id)}`}>
                        View place →
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="route-details-map">
              <MapContainer
                key={stops.map((place) => place.id).join('-')}
                bounds={stops.map((place) => [place.lat, place.lng] as [number, number])}
                boundsOptions={{ padding: [30, 30] }}
                scrollWheelZoom
                style={{ height: '460px', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {stops.map((place, index) => (
                  <CircleMarker
                    key={place.id}
                    center={[place.lat, place.lng]}
                    radius={9}
                    pathOptions={{
                      color: '#ffffff',
                      weight: 2,
                      fillColor: '#426b70',
                      fillOpacity: 1,
                    }}
                  >
                    <Popup>
                      <strong>{index + 1}. {place.name}</strong>
                      <br />
                      <a href={`/place/${encodeURIComponent(place.id)}`}>
                        View place
                      </a>
                    </Popup>
                  </CircleMarker>
                ))}

                {stops.length > 1 && (
                  <Polyline
                    positions={stops.map(
                      (place) => [place.lat, place.lng] as [number, number],
                    )}
                    pathOptions={{
                      color: '#426b70',
                      weight: 4,
                      dashArray: '8 8',
                    }}
                  />
                )}
              </MapContainer>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

export default RouteDetailsPage;
