import { useEffect, useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage/home';
import EditorPage from './pages/EditorPage/editor';

type RouteState = {
  type: 'home' | 'editor';
  projectId?: string;
};

function getRouteFromLocation(): RouteState {
  const match = window.location.pathname.match(/^\/editor\/(.+)$/);

  if (match) {
    return { type: 'editor', projectId: match[1] };
  }

  return { type: 'home' };
}

function App() {
  const [route, setRoute] = useState<RouteState>(() => getRouteFromLocation());

  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(getRouteFromLocation());
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (route.type === 'editor') {
    return <EditorPage projectId={route.projectId} />;
  }

  return <HomePage />;
}

export default App;
