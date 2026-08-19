import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import PortalPaciente from './pages/PortalPaciente';
import PanelPersonal from './pages/PanelPersonal';

function App() {
  const [ruta, setRuta] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setRuta(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Función para cambiar de vista de forma fluida sin recargar
  const navegar = (nuevaRuta) => {
    window.history.pushState({}, '', nuevaRuta);
    setRuta(nuevaRuta);
  };

  const rutaLimpia = ruta.toLowerCase();

  // 1. Panel de Personal (Acepta /personal o /admin)
  if (rutaLimpia === '/personal' || rutaLimpia === '/admin') {
    return <PanelPersonal navegar={navegar} />;
  }

  // 2. Vista oculta para que sigas editando la Landing Page cuando quieras
  if (rutaLimpia === '/landing') {
    return <LandingPage navegar={navegar} />;
  }

  // 3. Por defecto: Todo el que entre a la raíz ( / ), /pacientes o /portal verá el Portal de Pacientes
  return <PortalPaciente navegar={navegar} />;
}

export default App;