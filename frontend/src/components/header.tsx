
import { useLanguage } from '../context/LanguageContext';

const navItems = {
  en: [
    { label: 'Home', href: '/' },
    { label: 'Map', href: '/map' },
    { label: 'Places', href: '/places' },
    { label: 'Routes', href: '/routes' },
    { label: 'Favorites', href: '/favorites' },
  ],
  fi: [
    { label: 'Etusivu', href: '/' },
    { label: 'Kartta', href: '/map' },
    { label: 'Kohteet', href: '/places' },
    { label: 'Reitit', href: '/routes' },
    { label: 'Suosikit', href: '/favorites' },
  ],
};

function Header() {
  const currentPath = window.location.pathname;
  const { language, setLanguage } = useLanguage();
  const items = navItems[language];

  return (
    <header className="site-header">
      <a
        className="site-logo"
        href="/"
        aria-label="Helsinguide home"
      >
        Helsinguide
      </a>

      <nav
        className="site-nav"
        aria-label={language === 'en' ? 'Main navigation' : 'Päänavigaatio'}
      >
        {items.map((item) => {
          const isActive =
            item.href === '/'
              ? currentPath === '/'
              : currentPath === item.href ||
                (item.href === '/places' && currentPath.startsWith('/place/'));

          return (
            <a
              key={item.href}
              href={item.href}
              className={isActive ? 'active' : ''}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="language-switch" aria-label="Choose language">
        <button
          className={`language-button ${language === 'en' ? 'active' : ''}`}
          type="button"
          aria-pressed={language === 'en'}
          onClick={() => setLanguage('en')}
        >
          EN
        </button>

        <span aria-hidden="true">|</span>

        <button
          className={`language-button ${language === 'fi' ? 'active' : ''}`}
          type="button"
          aria-pressed={language === 'fi'}
          onClick={() => setLanguage('fi')}
        >
          FI
        </button>
      </div>
    </header>
  );
}

export default Header;
