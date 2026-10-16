
type RouteCardProps = {
  title: string;
  category: string;
  description: string;
  details: string;
  image: string;
};

function RouteCard({
  title,
  category,
  description,
  details,
  image,
}: RouteCardProps) {
  return (
    <article className="route-card">
      <img src={image} alt={title} loading="lazy" />

      <div className="route-card__body">
        <p className="eyebrow">{category}</p>
        <h3>{title}</h3>
        <p>{description}</p>
        <p className="route-card__details">{details}</p>

        <a href="#map" className="route-card__link">
          View route <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  );
}

export default RouteCard;
