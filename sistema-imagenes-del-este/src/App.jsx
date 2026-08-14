import React, { useState, useEffect } from 'react';
import PortalPaciente from './pages/PortalPaciente';
import PanelPersonal from './pages/PanelPersonal';

function App() {
  const [ruta, setRuta] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => setRuta(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Si entra por /admin muestra el panel del personal
  if (ruta === '/admin') {
    return <PanelPersonal />;
  }

  // Por defecto (ruta /) muestra el portal privado del paciente
  return <PortalPaciente />;
}

export default App;