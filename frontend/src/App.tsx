
import { useEffect, useState } from 'react';
import HomePage from './pages/HomePage';
import PlacesPage from './pages/PlacesPage';
import MapPage from './pages/MapPage';
import PlaceDetailsPage from './pages/PlaceDetailsPage';
import RoutesPage from './pages/RoutesPage';
import RouteDetailsPage from './pages/RouteDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
import { LanguageProvider } from './context/LanguageContext';

function AppContent() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    function handleNavigation() {
      setPath(window.location.pathname);
    }

    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  if (path === '/places') {
    return <PlacesPage />;
  }

  if (path === '/map') {
    return <MapPage />;
  }

  if (path.startsWith('/place/')) {
    return <PlaceDetailsPage />;
  }

  if (path === '/routes') {
    return <RoutesPage />;
  }

  if (path.startsWith('/route/')) {
    return <RouteDetailsPage />;
  }

  if (path === '/favorites') {
    return <FavoritesPage />;
  }

  return <HomePage />;
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
