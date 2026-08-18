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

  // 1. Panel Administrativo
  if (ruta === '/Personal') {
    return <PanelPersonal navegar={navegar} />;
  }

  // 2. Portal Privado de Pacientes (Login y Resultados)
  if (ruta === '/pacientes') {
    return <PortalPaciente navegar={navegar} />;
  }

  // 3. Por defecto (Ruta /): Página Web Principal (Landing Page)
  return <LandingPage navegar={navegar} />;
}

export default App;