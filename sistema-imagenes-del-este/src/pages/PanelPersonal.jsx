import React, { useState, useEffect } from 'react';

export default function PanelPersonal() {
  // 1. Autenticación y Rol
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null); // Contiene: { id, nombre_completo, rol }
  const [adminCedula, setAdminCedula] = useState('');
  const [adminClave, setAdminClave] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  // 2. Estados del Panel
  const [seccion, setSeccion] = useState('pacientes-lista');
  const [pacientes, setPacientes] = useState([]);
  const [busquedaLista, setBusquedaLista] = useState('');

  // 3. Modal de Expediente
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [estudiosPaciente, setEstudiosPaciente] = useState([]);
  const [cargandoEstudios, setCargandoEstudios] = useState(false);

  // 4. Modal de Editar Paciente
  const [pacienteAEditar, setPacienteAEditar] = useState(null);
  const [formEditPaciente, setFormEditPaciente] = useState({
    cedula: '',
    nombre_completo: '',
    telefono: '',
    correo: ''
  });

  const [estudiosExpediente, setEstudiosExpediente] = useState([]);
  const [cargandoExpediente, setCargandoExpediente] = useState(false);

  // 5. Formulario Crear Paciente
  const [formPaciente, setFormPaciente] = useState({
    cedula: '',
    nombre_completo: '',
    telefono: '',
    correo: '',
    clave: ''
  });

  // 6. Formulario Subir Estudio
  const [busquedaPacienteSubida, setBusquedaPacienteSubida] = useState('');
  const [pacienteSeleccionadoSubida, setPacienteSeleccionadoSubida] = useState(null);
  const [tipoExamen, setTipoExamen] = useState('Informe Médico');
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState(null);

  const cargarPacientes = async () => {
    try {
      const res = await fetch('https://app-radiografia-production.up.railway.app/api/pacientes');
      const data = await res.json();
      if (Array.isArray(data)) setPacientes(data);
    } catch (e) {
      console.error("Error al cargar pacientes", e);
    }
  };

  useEffect(() => {
    if (autenticado) cargarPacientes();
  }, [autenticado]);

  // Manejar Login del Personal reconociendo el ROL
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');
    try {
      const res = await fetch('https://app-radiografia-production.up.railway.app/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: adminCedula, clave: adminClave })
      });
      const data = await res.json();
      if (res.ok) {
        setAutenticado(true);
        setUsuarioLogueado(data.usuario);
        
        // Redirección inicial según el rol
        if (data.usuario?.rol === 'medico' || data.usuario?.rol === 'tecnico') {
          setSeccion('subir-estudio');
          setTipoExamen('Informe Médico');
        } else {
          setSeccion('pacientes-lista');
        }
      } else {
        setErrorLogin(data.error || 'Credenciales inválidas');
      }
    } catch {
      setErrorLogin('Error de conexión con el servidor');
    }
  };

  // Abrir Modal Edición (Solo para Secretaría)
  const handleAbrirEditar = (paciente) => {
    setPacienteAEditar(paciente);
    setFormEditPaciente({
      cedula: paciente.cedula || '',
      nombre_completo: paciente.nombre_completo || '',
      telefono: paciente.telefono || '',
      correo: paciente.correo || ''
    });
  };

  // Guardar Cambios Paciente
  const handleActualizarPaciente = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://app-radiografia-production.up.railway.app/api/pacientes/${pacienteAEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEditPaciente)
      });

      if (res.ok) {
        alert('¡Paciente actualizado correctamente!');
        setPacienteAEditar(null);
        cargarPacientes();
      } else {
        alert('Error al actualizar datos');
      }
    } catch (e) {
      console.error('Error:', e);
    }
  };

  // Ver Expediente
  
// Función que se dispara al hacer clic en "Ver expediente"
const abrirExpediente = async (paciente) => {
  setPacienteSeleccionado(paciente); // 1. Muestra el modal
  setCargandoEstudios(true);         // 2. Activa el spinner
  setEstudiosPaciente([]);           // 3. Limpia los exámenes viejos

  try {
    // 4. Pide los exámenes del paciente al backend
    const res = await fetch(`https://app-radiografia-production.up.railway.app/api/estudios/paciente/${paciente.id}`);
    if (res.ok) {
      const data = await res.json();
      setEstudiosPaciente(data); // 5. Llena la lista de estudios
    } else {
      setEstudiosPaciente([]);
    }
  } catch (error) {
    console.error("Error cargando expediente:", error);
    setEstudiosPaciente([]);
  } finally {
    setCargandoEstudios(false); // 6. Apaga el spinner
  }
};

  // Crear Paciente
  const handleGuardarPaciente = async (e) => {
    e.preventDefault();
    const res = await fetch('https://app-radiografia-production.up.railway.app/api/pacientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formPaciente)
    });

    if (res.ok) {
      alert('¡Paciente registrado con éxito!');
      setFormPaciente({ cedula: '', nombre_completo: '', telefono: '', correo: '', clave: '' });
      cargarPacientes();
      setSeccion('pacientes-lista');
    } else {
      alert('Error al registrar paciente');
    }
  };

  // Subir Estudio y Notificar
  const handleGuardarEstudio = async (e) => {
    e.preventDefault();
    if (!archivo || !pacienteSeleccionadoSubida) return alert('Selecciona un paciente y adjunta un archivo');

    const formData = new FormData();
    formData.append('paciente_id', pacienteSeleccionadoSubida.id);
    formData.append('tipo_examen', tipoExamen);
    formData.append('titulo', titulo);
    formData.append('archivo', archivo);

    const res = await fetch('https://app-radiografia-production.up.railway.app/api/estudios', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      alert('¡Estudio cargado y notificación enviada al paciente!');
      setTitulo('');
      setArchivo(null);
      setPacienteSeleccionadoSubida(null);
      setBusquedaPacienteSubida('');
    } else {
      alert('Error al subir el estudio');
    }
  };

  // Filtrado de pacientes
  const pacientesFiltradosLista = pacientes.filter(p => 
    p.cedula.toLowerCase().includes(busquedaLista.toLowerCase()) ||
    p.nombre_completo.toLowerCase().includes(busquedaLista.toLowerCase())
  );

  const pacientesFiltradosSubida = busquedaPacienteSubida.trim() === '' ? [] : pacientes.filter(p =>
    p.cedula.toLowerCase().includes(busquedaPacienteSubida.toLowerCase()) ||
    p.nombre_completo.toLowerCase().includes(busquedaPacienteSubida.toLowerCase())
  );

  /* ------------------------------------------------------------- */
  /* VISTA 1: FORMULARIO DE LOGIN ADMINISTRATIVO (SI NO ESTÁ AUTENTICADO) */
  /* ------------------------------------------------------------- */
  if (!autenticado) {
    return (
    <div className="min-h-screen bg-rose-950 flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-sm bg-white border border-slate-800 rounded-2xl p-6 shadow-2xl">
        <div className="text-center mb-6">
          {/* Logo en Login de Administración */}
          <div className="w-50 h-50 mx-auto mb-3 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="Logo Unidad de Imágenes" 
              className="w-full h-full object-contain drop-shadow-sm" 
            />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Acceso Administrativo</h2>
          <p className="text-xs text-slate-400">Ingresa con tus credenciales de personal</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          {errorLogin && (
            <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl text-center font-medium">
              {errorLogin}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Usuario o Cédula</label>
            <input 
              type="text" 
              placeholder="Ingrese su usuario o cédula" 
              value={adminCedula}
              onChange={e => setAdminCedula(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              required 
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={adminClave}
              onChange={e => setAdminClave(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-red-800 hover:bg-red-950 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer mt-2"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- */
/* VISTA 2: PANEL ADMINISTRATIVO (SI YA SE AUTENTICÓ) */
/* ------------------------------------------------------------- */
return (
  <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
    
    {/* SIDEBAR LATERAL */}
    <aside className="w-64 bg-red-950 text-slate-300 flex flex-col justify-between p-4 shrink-0 shadow-xl">
      <div>
        <div className="flex items-center space-x-3 px-2 py-4 mb-6 border-b border-slate-800">
          <div className="w-25 h-25 flex items-center justify-center shrink-0">
            <img 
              src="/logo.png" 
              alt="Logo Unidad de Imágenes" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">{usuarioLogueado?.nombre_completo || 'Panel Interno'}</h2>
            <p className="text-[11px] text-slate-400">Unidad de Imágenes del este</p>
            {usuarioLogueado?.rol && (
              <span className="inline-block px-2 py-0.5 mt-1 text-[9px] font-bold uppercase tracking-wider bg-red-900 text-red-200 border border-red-700/50 rounded-md">
                {usuarioLogueado.rol}
              </span>
            )}
          </div>
        </div>

        <nav className="space-y-1.5">
          <button
            onClick={() => setSeccion('pacientes-lista')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              seccion === 'pacientes-lista'
                ? 'bg-red-800 text-white shadow-lg shadow-red-600/30'
                : 'hover:bg-red-900 text-red-200 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Pacientes ({pacientes.length})</span>
          </button>

          {/* SOLO SECRETARÍA PUEDE CREAR PACIENTES */}
          {usuarioLogueado?.rol === 'secretaria' && (
            <button
              onClick={() => setSeccion('crear-paciente')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                seccion === 'crear-paciente'
                  ? 'bg-red-800 text-white shadow-lg shadow-red-600/30'
                  : 'hover:bg-red-900 text-red-200 hover:text-slate-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Crear Paciente</span>
            </button>
          )}

          <button
            onClick={() => setSeccion('subir-estudio')}
            className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              seccion === 'subir-estudio'
                ? 'bg-red-800 text-white shadow-lg shadow-red-600/30'
                : 'hover:bg-red-900 text-red-200 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Subir Resultado</span>
          </button>
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-white">MedicsWeb v1.0</span>
        <button 
          onClick={() => { setAutenticado(false); setUsuarioLogueado(null); }} 
          className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium cursor-pointer"
        >
          Salir
        </button>
      </div>
    </aside>

    {/* ÁREA PRINCIPAL */}
    <main className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        
        {/* VISTA: LISTA DE PACIENTES */}
        {seccion === 'pacientes-lista' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Directorio de Pacientes</h2>
                <p className="text-xs text-slate-500 mt-0.5">Total registrados: <strong className="text-sky-600">{pacientes.length} pacientes</strong></p>
              </div>

              <div className="relative w-full sm:w-72">
                <input 
                  type="text" 
                  placeholder="Buscar cédula o nombre..." 
                  value={busquedaLista}
                  onChange={e => setBusquedaLista(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {pacientesFiltradosLista.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                No se encontraron pacientes coincidentes.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-2 font-semibold">Cédula / DNI</th>
                      <th className="py-3 px-2 font-semibold">Nombre Completo</th>
                      <th className="py-3 px-2 font-semibold">Teléfono</th>
                      <th className="py-3 px-2 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pacientesFiltradosLista.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-2 font-semibold text-slate-900">{p.cedula}</td>
                        <td className="py-3 px-2 text-slate-700">{p.nombre_completo}</td>
                        <td className="py-3 px-2 text-slate-500">{p.telefono || 'Sin registro'}</td>
                        <td className="py-3 px-2 text-right space-x-2">
                          {/* SOLO LA SECRETARÍA PUEDE EDITAR */}
                          {usuarioLogueado?.rol === 'secretaria' && (
                            <button 
                              onClick={() => handleAbrirEditar(p)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold rounded-lg transition-all cursor-pointer text-xs"
                            >
                              Editar
                            </button>
                          )}
                          <button 
                            onClick={() => handleVerEstudios(p)}
                            className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 font-semibold rounded-lg transition-all cursor-pointer text-xs"
                          >
                            Ver Expediente
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* VISTA: CREAR PACIENTE (SOLO SECRETARÍA) */}
        {seccion === 'crear-paciente' && usuarioLogueado?.rol === 'secretaria' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Registrar Nuevo Paciente</h2>
              <p className="text-xs text-slate-500 mt-0.5">Asigna la cédula como usuario y define su contraseña de acceso.</p>
            </div>

            <form onSubmit={handleGuardarPaciente} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Cédula / DNI (Usuario)</label>
                <input 
                  type="text" 
                  placeholder="Ej: 12345678" 
                  value={formPaciente.cedula}
                  onChange={e => setFormPaciente({...formPaciente, cedula: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nombre Completo</label>
                <input 
                  type="text" 
                  placeholder="Nombre y Apellidos del paciente" 
                  value={formPaciente.nombre_completo}
                  onChange={e => setFormPaciente({...formPaciente, nombre_completo: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Teléfono</label>
                <input 
                  type="text" 
                  placeholder="Número de contacto" 
                  value={formPaciente.telefono}
                  onChange={e => setFormPaciente({...formPaciente, telefono: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input 
                  type="email" 
                  placeholder="ejemplo@paciente.com" 
                  value={formPaciente.correo}
                  onChange={e => setFormPaciente({...formPaciente, correo: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Contraseña Asignada</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={formPaciente.clave}
                  onChange={e => setFormPaciente({...formPaciente, clave: e.target.value})}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-red-800 hover:bg-red-950 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer mt-2"
              >
                Guardar Paciente
              </button>
            </form>
          </div>
        )}

        {/* VISTA: SUBIR RESULTADO (CON BÚSQUEDA Y OPCIONES SEGÚN ROL) */}
        {seccion === 'subir-estudio' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
            <div className="mb-6 pb-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Cargar Resultado Médico</h2>
              <p className="text-xs text-slate-500 mt-0.5">Busca al paciente por nombre o cédula para asociar el examen.</p>
            </div>

            <form onSubmit={handleGuardarEstudio} className="space-y-4">
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Buscar Paciente (Cédula o Nombre)</label>
                
                {pacienteSeleccionadoSubida ? (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
                    <div>
                      <strong className="text-xs text-sky-900 block">{pacienteSeleccionadoSubida.nombre_completo}</strong>
                      <span className="text-[11px] text-sky-600">C.I: {pacienteSeleccionadoSubida.cedula}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setPacienteSeleccionadoSubida(null); setBusquedaPacienteSubida(''); }}
                      className="text-xs text-red-500 hover:underline font-medium"
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <>
                    <input 
                      type="text" 
                      placeholder="Escribe el nombre o cédula..." 
                      value={busquedaPacienteSubida}
                      onChange={e => setBusquedaPacienteSubida(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />

                    {pacientesFiltradosSubida.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto">
                        {pacientesFiltradosSubida.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => { setPacienteSeleccionadoSubida(p); setBusquedaPacienteSubida(''); }}
                            className="p-3 hover:bg-slate-50 border-b border-slate-100 last:border-none cursor-pointer flex justify-between items-center"
                          >
                            <span className="text-xs font-medium text-slate-800">{p.nombre_completo}</span>
                            <span className="text-[11px] text-slate-400">C.I: {p.cedula}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Tipo de Examen</label>
                <select 
                  value={tipoExamen} 
                  onChange={e => setTipoExamen(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                >
                  <option value="Informe Médico">Informe Médico</option>
                  {(usuarioLogueado?.rol === 'tecnico' || usuarioLogueado?.rol === 'secretaria') && (
                    <>
                      <option value="Radiografía">Radiografía</option>
                      <option value="Tomografía">Tomografía</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Título del Estudio</label>
                <input 
                  type="text" 
                  placeholder="Ej: Radiografía de Tórax AP" 
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Archivo de Examen (Cualquier Formato)</label>
                <input 
                  type="file" 
                  onChange={e => setArchivo(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-800 hover:file:bg-red-100 cursor-pointer border border-slate-200 rounded-xl bg-slate-50 p-1"
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer mt-2"
              >
                Subir y Notificar
              </button>
            </form>
          </div>
        )}

      </div>
    </main>

   {/* MODAL EXPEDIENTE */}
{pacienteSeleccionado && (
  <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-fadeIn">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">{pacienteSeleccionado.nombre_completo}</h3>
          <p className="text-xs text-slate-400">C.I: {pacienteSeleccionado.cedula}</p>
        </div>
        <button 
          onClick={() => {
            setPacienteSeleccionado(null);
            setEstudiosPaciente([]);
          }}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer font-bold text-sm"
        >
          ✕
        </button>
      </div>

      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Estudios Cargados</h4>

      {cargandoEstudios ? (
        <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-red-800 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs">Cargando expediente...</p>
        </div>
      ) : estudiosPaciente.length === 0 ? (
        <p className="text-xs text-center text-slate-400 py-6">Este paciente aún no tiene exámenes registrados.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {estudiosPaciente.map(e => (
            <div key={e.id} className="p-3 border border-slate-100 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 text-[9px] font-bold text-red-800 bg-red-50 rounded mb-1">
                  {e.tipo_examen}
                </span>
                <h5 className="text-xs font-semibold text-slate-800">{e.titulo}</h5>
                <span className="text-[10px] text-slate-400">{new Date(e.fecha_estudio).toLocaleDateString()}</span>
              </div>
              <a 
                href={`/api/descargar/${e.id}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-red-950 hover:bg-red-800 text-white text-xs font-medium rounded-lg transition-colors inline-block"
              >
                Descargar
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

    {/* MODAL PARA EDITAR PACIENTE (SOLO SECRETARÍA) */}
    {pacienteAEditar && usuarioLogueado?.rol === 'secretaria' && (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900">Editar Datos del Paciente</h3>
            <button onClick={() => setPacienteAEditar(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">✕</button>
          </div>

          <form onSubmit={handleActualizarPaciente} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Cédula / DNI</label>
              <input 
                type="text" 
                value={formEditPaciente.cedula}
                onChange={e => setFormEditPaciente({...formEditPaciente, cedula: e.target.value})}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Nombre Completo</label>
              <input 
                type="text" 
                value={formEditPaciente.nombre_completo}
                onChange={e => setFormEditPaciente({...formEditPaciente, nombre_completo: e.target.value})}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
                required 
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Teléfono</label>
              <input 
                type="text" 
                value={formEditPaciente.telefono}
                onChange={e => setFormEditPaciente({...formEditPaciente, telefono: e.target.value})}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                value={formEditPaciente.correo}
                onChange={e => setFormEditPaciente({...formEditPaciente, correo: e.target.value})}
                className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button 
                type="button"
                onClick={() => setPacienteAEditar(null)}
                className="w-1/2 py-2.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

  </div>
);
}