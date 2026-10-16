
import { useState } from 'react';
import Button from './button';

function Hero() {
  const [search, setSearch] = useState('');

  function handleSearch() {
    const query = search.trim();

    if (!query) {
      document.querySelector<HTMLInputElement>('#place-search')?.focus();
      return;
    }

    document.querySelector('#popular-places')?.scrollIntoView({
      behavior: 'smooth',
    });

    window.dispatchEvent(
      new CustomEvent('helsinguide-search', {
        detail: query,
      }),
    );
  }

  return (
    <section className="hero">
      <div className="hero__content">
        <p className="eyebrow">YOUR LOCAL GUIDE TO HELSINKI</p>

        <h1>
          Find your
          <br />
          <em>Helsinki.</em>
        </h1>

        <p className="hero__description">
          A little art. A good coffee. A walk by the sea.
          Discover the places that make Helsinki special.
        </p>

        <form
          className="hero__search"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch();
          }}
        >
          <label className="sr-only" htmlFor="place-search">
            Search places in Helsinki
          </label>

          <input
            id="place-search"
            type="search"
            placeholder="Where would you like to go?"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <Button>Search</Button>
        </form>

        <p className="hero__note">
          Find hidden gems, local favourites and new experiences.
        </p>
      </div>

      <div className="hero__visual">
        <img
          src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80"
          alt="City streets and buildings"
        />

        <div className="hero__image-label">
          <span>01 / DISCOVER</span>
          <span>Helsinki, Finland</span>
        </div>
      </div>
    </section>
  );
}

export default Hero;
