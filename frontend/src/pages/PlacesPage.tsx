
import { useEffect, useMemo, useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import PlaceCard from '../components/placecard';
import { fetchPlaces, type Place } from '../services/placesService';

const PAGE_SIZE = 12;

const categoryOptions = [
  { value: 'All', label: 'All places' },
  { value: 'Attractions', label: 'Attractions' },
  { value: 'Museums', label: 'Museums' },
  { value: 'Cafes', label: 'Cafés' },
  { value: 'Restaurants', label: 'Restaurants' },
  { value: 'Parks', label: 'Parks' },
  { value: 'Libraries', label: 'Libraries' },
  { value: 'Other', label: 'Other' },
];

function getCategoryGroup(category: string): string {
  const value = category.toLowerCase();

  if (value.includes('museum') || value.includes('culture')) {
    return 'Museums';
  }
  if (value.includes('cafe') || value.includes('coffee')) {
    return 'Cafes';
  }
  if (value.includes('restaurant') || value.includes('food') ||
      value.includes('fast_food') || value.includes('catering')) {
    return 'Restaurants';
  }
  if (value.includes('park') || value.includes('garden')) {
    return 'Parks';
  }
  if (value.includes('library')) {
    return 'Libraries';
  }
  if (value.includes('attraction') || value.includes('tourism') ||
      value.includes('sight') || value.includes('landmark')) {
    return 'Attractions';
  }

  return 'Other';
}

function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Name');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    fetchPlaces()
      .then((data) => {
        if (active) setPlaces(data);
      })
      .catch((err) => {
        console.error('Failed to load places:', err);
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredPlaces = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    const result = places.filter((place) => {
      const matchesCategory =
        category === 'All' || getCategoryGroup(place.category) === category;

      const searchableText = [
        place.name,
        place.category,
        place.address,
        place.description,
      ].join(' ').toLocaleLowerCase();

      return matchesCategory && searchableText.includes(query);
    });

    if (sort === 'Name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'Category') {
      result.sort((a, b) =>
        a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
      );
    }

    return result;
  }, [places, search, category, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredPlaces.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visiblePlaces = filteredPlaces.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  return (
    <>
      <Header />

      <main className="listing-page">
        <p className="eyebrow">DISCOVER HELSINKI</p>
        <h1>Find your next favourite place.</h1>
        <p className="listing-intro">
          From iconic landmarks and museums to cosy cafés and peaceful parks.
          Explore Helsinki at your own pace.
        </p>

        <form
          className="listing-search"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="sr-only" htmlFor="places-search">
            Search Helsinki places
          </label>
          <input
            id="places-search"
            type="search"
            placeholder="Search places, categories or addresses..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button className="button button--primary" type="submit">
            Search →
          </button>
        </form>

        <div className="category-filters" aria-label="Filter places by category">
          {categoryOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`category-chip ${
                category === item.value ? 'is-active' : ''
              }`}
              aria-pressed={category === item.value}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="listing-toolbar">
          <span>
            {loading ? 'Loading places…' : `${filteredPlaces.length} places`}
          </span>

          <label>
            Sort by{' '}
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="Name">Name</option>
              <option value="Category">Category</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="empty-state">
            <h2>Discovering Helsinki…</h2>
            <p>Loading places for you.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h2>We couldn’t load places</h2>
            <p>Check that the Helsinguide backend is running, then refresh the page.</p>
            <button
              className="button button--secondary"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : visiblePlaces.length > 0 ? (
          <>
            <div className="place-grid">
              {visiblePlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  id={place.id}
                  name={place.name}
                  category={getCategoryGroup(place.category)}
                  description={place.description || 'Discover this place in Helsinki.'}
                  address={place.address || 'Helsinki, Finland'}
                  image=""
                />
              ))}
            </div>

            <nav className="listing-pagination" aria-label="Places pages">
              <button
                className="button button--secondary"
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                ← Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="button button--secondary"
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
              >
                Next →
              </button>
            </nav>
          </>
        ) : (
          <div className="empty-state">
            <h2>No places found</h2>
            <p>Try another search or choose a different category.</p>
            <button
              className="button button--secondary"
              type="button"
              onClick={() => {
                setSearch('');
                setCategory('All');
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default PlacesPage;
