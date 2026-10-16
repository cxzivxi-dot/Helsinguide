
import { useEffect, useState } from 'react';
import { isFavorite, toggleFavorite } from '../utils/favorites';

type PlaceCardProps = {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  image?: string;
};

function PlaceCard({
  id,
  name,
  category,
  description,
  address,
  image,
}: PlaceCardProps) {
  const [saved, setSaved] = useState(() => isFavorite('place', id));

  useEffect(() => {
    function updateFavorites() {
      setSaved(isFavorite('place', id));
    }

    window.addEventListener('helsinguide-favorites-changed', updateFavorites);

    return () => {
      window.removeEventListener(
        'helsinguide-favorites-changed',
        updateFavorites,
      );
    };
  }, [id]);

  function handleFavorite() {
    toggleFavorite('place', id);
    setSaved(isFavorite('place', id));
  }

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return (
    <article className="place-card">
      <div className="place-card__image">
        {image ? (
          <img src={image} alt={name} loading="lazy" />
        ) : (
          <div className="place-card__placeholder" aria-label="No photo available">
            <span aria-hidden="true">⌖</span>
            <span>Helsinki</span>
          </div>
        )}

        <button
          className="place-card__favorite"
          type="button"
          aria-label={
            saved
              ? `Remove ${name} from favorites`
              : `Save ${name} to favorites`
          }
          aria-pressed={saved}
          onClick={handleFavorite}
        >
          {saved ? '♥' : '♡'}
        </button>
      </div>

      <div className="place-card__body">
        <div className="place-card__meta">
          <span>{category}</span>
        </div>

        <h3>{name}</h3>
        <p>{description}</p>
        <p className="place-card__address">{address}</p>

        
<a className="place-card__link" href={`/place/${slug}`}>
  View details
</a>

      </div>
    </article>
  );
}

export default PlaceCard;
