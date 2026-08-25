import React, { useState, useEffect } from 'react';

export default function PanelPersonal() {
  // 1. Autenticación y Rol
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [adminCedula, setAdminCedula] = useState('');
  const [adminClave, setAdminClave] = useState('');
  const [mostrarClaveAdmin, setMostrarClaveAdmin] = useState(false);
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
    correo: '',
    clave: ''
  });

  const [modalPacienteExiste, setModalPacienteExiste] = useState(false);

  // Super usuario comprobación
  const esSuperAdmin = usuarioLogueado?.rol === 'superadmin' || usuarioLogueado?.rol === 'admin';

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
  const [archivos, setArchivos] = useState([]);

  // 7. Gestión de Usuarios (SuperAdmin)
  const [usuariosPersonal, setUsuariosPersonal] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [formNuevoUsuario, setFormNuevoUsuario] = useState({
    cedula: '',
    nombre_completo: '',
    clave: '',
    rol: 'tecnico'
  });

  const cargarPacientes = async () => {
    try {
      const res = await fetch('https://app-radiografia-production.up.railway.app/api/pacientes');
      const data = await res.json();
      if (Array.isArray(data)) setPacientes(data);
    } catch (e) {
      console.error("Error al cargar pacientes", e);
    }
  };

  const cargarUsuariosPersonal = async () => {
    setCargandoUsuarios(true);
    try {
      const res = await fetch('https://app-radiografia-production.up.railway.app/api/admin/usuarios');
      const data = await res.json();
      if (Array.isArray(data)) setUsuariosPersonal(data);
    } catch (e) {
      console.error("Error al cargar usuarios de persona", e);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  useEffect(() => {
    if (autenticado) {
      cargarPacientes();
      if (seccion === 'gestion-usuarios' && esSuperAdmin) {
        cargarUsuariosPersonal();
      }
    }
  }, [autenticado, seccion]);

  // Selección acumulativa de archivos
  const handleArchivosChange = (e) => {
    if (e.target.files.length > 0) {
      const nuevosArchivos = Array.from(e.target.files);
      setArchivos((prev) => [...prev, ...nuevosArchivos]);
      e.target.value = ''; 
    }
  };

  const handleRemoverArchivo = (indexAEliminar) => {
    setArchivos((prev) => prev.filter((_, index) => index !== indexAEliminar));
  };

  const handleLimpiarArchivos = () => {
    setArchivos([]);
    const fileInput = document.getElementById('input-archivos');
    if (fileInput) fileInput.value = '';
  };

  // Login del Personal
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

  const handleAbrirEditar = (paciente) => {
    setPacienteAEditar(paciente);
    setFormEditPaciente({
      cedula: paciente.cedula || '',
      nombre_completo: paciente.nombre_completo || '',
      telefono: paciente.telefono || '',
      correo: paciente.correo || '',
      clave: ''
    });
  };

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

  const abrirExpediente = async (paciente) => {
    setPacienteSeleccionado(paciente);
    setCargandoEstudios(true);
    setEstudiosPaciente([]);

    try {
      const res = await fetch(`https://app-radiografia-production.up.railway.app/api/estudios/paciente/${paciente.id}`);
      if (res.ok) {
        const data = await res.json();
        setEstudiosPaciente(data);
      } else {
        setEstudiosPaciente([]);
      }
    } catch (error) {
      console.error("Error cargando expediente:", error);
      setEstudiosPaciente([]);
    } finally {
      setCargandoEstudios(false);
    }
  };

  const handleGuardarPaciente = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch('https://app-radiografia-production.up.railway.app/api/pacientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formPaciente)
    });

    const data = await res.json();

    if (res.ok) {
      alert('¡Paciente registrado con éxito!');
      setFormPaciente({ cedula: '', nombre_completo: '', telefono: '', correo: '', clave: '' });
      cargarPacientes();
      setSeccion('pacientes-lista');
    } else {
      // Si el servidor indica que ya existe, abrimos el modal
      if (res.status === 400 || data.error?.includes('registrado')) {
        setModalPacienteExiste(true);
      } else {
        alert(data.error || 'Error al registrar paciente');
      }
    }
  } catch (e) {
    console.error('Error:', e);
    alert('Error de conexión con el servidor');
  }
};

  const handleGuardarEstudio = async (e) => {
    e.preventDefault();
    if (archivos.length === 0 || !pacienteSeleccionadoSubida) {
      return alert('Selecciona un paciente y adjunta al menos un archivo');
    }

    const esTecnico = usuarioLogueado?.rol === 'tecnico';

    const formData = new FormData();
    formData.append('paciente_id', pacienteSeleccionadoSubida.id);
    formData.append('tipo_examen', tipoExamen);
    formData.append('titulo', titulo);
    formData.append('notificar_correo', !esTecnico);

    archivos.forEach((file) => {
      formData.append('archivos', file);
    });

    try {
      const res = await fetch('https://app-radiografia-production.up.railway.app/api/estudios', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        alert(
          esTecnico
          ? '¡Estudio(s) cargado(s) con éxito en la base de datos!'
          :'¡Estudio(s) cargado(s) y notificación enviada al paciente!'
        );
        setTitulo('');
        handleLimpiarArchivos();
        setPacienteSeleccionadoSubida(null);
        setBusquedaPacienteSubida('');
      } else {
        alert('Error al subir los archivos');
      }
    } catch (error) {
      console.error('Error al conectar:', error);
      alert('Error de conexión con el servidor');
    }
  };

  // Crear Usuario en la tabla persona (SuperAdmin)
  const handleCrearUsuarioPersonal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('https://app-radiografia-production.up.railway.app/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formNuevoUsuario)
      });

      const data = await res.json();

      if (res.ok) {
        alert('¡Usuario del personal registrado con éxito!');
        setFormNuevoUsuario({ cedula: '', nombre_completo: '', clave: '', rol: 'tecnico' });
        cargarUsuariosPersonal();
      } else {
        alert(data.error || 'Error al registrar usuario');
      }
    } catch (e) {
      console.error('Error:', e);
      alert('Error de conexión con el servidor');
    }
  };

  // Cambiar rol de usuario personal
  const handleCambiarRol = async (usuarioId, nuevoRol) => {
    try {
      const res = await fetch(`https://app-radiografia-production.up.railway.app/api/admin/usuarios/${usuarioId}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: nuevoRol })
      });

      if (res.ok) {
        alert('¡Rol actualizado con éxito!');
        cargarUsuariosPersonal();
      } else {
        alert('Error al actualizar el rol');
      }
    } catch (e) {
      console.error('Error:', e);
      alert('Error de conexión');
    }
  };

  // Cambiar contraseña de usuario personal
  const handleCambiarClaveUsuarioPersonal = async (usuarioId) => {
    const nuevaClave = prompt('Ingresa la nueva contraseña para este usuario:');
    if (!nuevaClave || nuevaClave.trim() === '') return;

    try {
      const res = await fetch(`https://app-radiografia-production.up.railway.app/api/admin/usuarios/${usuarioId}/clave`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: nuevaClave })
      });

      if (res.ok) {
        alert('¡Contraseña actualizada con éxito!');
      } else {
        alert('Error al actualizar la contraseña');
      }
    } catch (e) {
      console.error('Error:', e);
      alert('Error de conexión con el servidor');
    }
  };

  // Borrar usuario personal
  const handleEliminarUsuarioPersonal = async (usuarioId) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario? Perderá el acceso al sistema.')) return;

    try {
      const res = await fetch(`https://app-radiografia-production.up.railway.app/api/admin/usuarios/${usuarioId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('¡Usuario eliminado correctamente!');
        cargarUsuariosPersonal();
      } else {
        alert('Error al eliminar el usuario');
      }
    } catch (e) {
      console.error('Error:', e);
      alert('Error de conexión con el servidor');
    }
  };

  const handleEliminarEstudio = async (estudioId) => {
    if (!confirm('¿Estás seguro de eliminar este estudio de la base de datos?')) return;
    
    const res = await fetch(`https://app-radiografia-production.up.railway.app/api/estudios/${estudioId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      alert('Estudio eliminado');
      setEstudiosPaciente(prev => prev.filter(e => e.id !== estudioId));
    }
  };

  const handleEliminarPaciente = async (pacienteId) => {
    if (!confirm('¿Seguro que deseas borrar este paciente y TODOS sus estudios asociados?')) return;

    const res = await fetch(`https://app-radiografia-production.up.railway.app/api/pacientes/${pacienteId}`, {
      method: 'DELETE'
    });

    if (res.ok) {
      alert('Paciente eliminado');
      cargarPacientes();
    }
  };

  const pacientesFiltradosLista = pacientes.filter(p => 
    p.cedula.toLowerCase().includes(busquedaLista.toLowerCase()) ||
    p.nombre_completo.toLowerCase().includes(busquedaLista.toLowerCase())
  );

  const pacientesFiltradosSubida = busquedaPacienteSubida.trim() === '' ? [] : pacientes.filter(p =>
    p.cedula.toLowerCase().includes(busquedaPacienteSubida.toLowerCase()) ||
    p.nombre_completo.toLowerCase().includes(busquedaPacienteSubida.toLowerCase())
  );

  /* LOGIN ADMINISTRATIVO CON OJITO */
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-rose-950 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-50 h-50 mx-auto mb-3 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Logo Unidad de Imágenes" 
                className="w-full h-full object-contain drop-shadow-sm" 
              />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Acceso Administrativo</h2>
            <p className="text-xs text-slate-400">Ingresa con tus credenciales</p>
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
              <div className="relative">
                <input 
                  type={mostrarClaveAdmin ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  value={adminClave}
                  onChange={e => setAdminClave(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setMostrarClaveAdmin(!mostrarClaveAdmin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-sm select-none"
                  title={mostrarClaveAdmin ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarClaveAdmin ? 'X' : '👁️'}
                </button>
              </div>
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

  /* PANEL PRINCIPAL */
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-800">
      
      {/* SIDEBAR LATERAL */}
      <aside className="hidden md:flex w-64 bg-red-950 text-slate-300 flex-col justify-between p-4 shrink-0 shadow-xl">
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

            {(usuarioLogueado?.rol === 'secretaria' || esSuperAdmin) && (
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

            {/* BOTÓN SUPERADMIN */}
            {esSuperAdmin && (
              <button
                onClick={() => setSeccion('gestion-usuarios')}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  seccion === 'gestion-usuarios'
                    ? 'bg-red-800 text-white shadow-lg shadow-red-600/30'
                    : 'hover:bg-red-900 text-red-200 hover:text-slate-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Gestión de Usuarios</span>
              </button>
            )}
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
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
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
                            {(usuarioLogueado?.rol === 'secretaria' || esSuperAdmin) && (
                              <button onClick={() => handleAbrirEditar(p)} className="px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold cursor-pointer">
                                Editar
                              </button>
                            )}

                            {esSuperAdmin && (
                              <button onClick={() => handleEliminarPaciente(p.id)} className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold cursor-pointer">
                                Eliminar
                              </button>
                            )}

                            <button onClick={() => abrirExpediente(p)} className="px-3 py-1.5 bg-sky-50 text-sky-600 rounded-lg text-xs font-semibold cursor-pointer">
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

          {/* VISTA: CREAR PACIENTE */}
          {seccion === 'crear-paciente' && (usuarioLogueado?.rol === 'secretaria' || esSuperAdmin) && (
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

          {/* VISTA: SUBIR RESULTADO */}
          {seccion === 'subir-estudio' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Cargar Resultado Médico</h2>
                <p className="text-xs text-slate-500 mt-0.5">Busca al paciente por nombre o cédula para asociar el examen.</p>
              </div>

              <form onSubmit={handleGuardarEstudio} className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Buscar Paciente (Cédula o Nombre)
                  </label>
                  
                  {pacienteSeleccionadoSubida ? (
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-xs text-sky-900 block">{pacienteSeleccionadoSubida.nombre_completo}</strong>
                        <span className="text-[11px] text-sky-600">C.I: {pacienteSeleccionadoSubida.cedula}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => { setPacienteSeleccionadoSubida(null); setBusquedaPacienteSubida(''); }}
                        className="text-xs text-red-500 hover:underline font-medium cursor-pointer"
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
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Tipo de Examen
                  </label>
                  <select 
                    value={tipoExamen} 
                    onChange={e => setTipoExamen(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Informe Médico">Informe Médico</option>
                    {(usuarioLogueado?.rol === 'tecnico' || usuarioLogueado?.rol === 'secretaria' || esSuperAdmin) && (
                      <option value="Tomografías y/o Radiografías">Tomografías y/o Radiografías</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Título del estudio
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Radiografía de Tórax AP - Resultados Disponibles" 
                    value={titulo}
                    onChange={e => setTipoExamen ? setTitulo(e.target.value) : setTitulo(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Archivos de Examen (Selección Múltiple Acumulativa)
                  </label>
                  
                  <div className="flex items-center gap-2">
                    <input 
                      id="input-archivos"
                      type="file" 
                      multiple
                      onChange={handleArchivosChange}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-800 hover:file:bg-red-100 cursor-pointer border border-slate-200 rounded-xl bg-slate-50 p-1"
                    />

                    {archivos.length > 0 && (
                      <button
                        type="button"
                        onClick={handleLimpiarArchivos}
                        className="w-9 h-9 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl flex items-center justify-center transition-colors cursor-pointer shrink-0 text-sm"
                        title="Borrar todos los archivos"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {archivos.length > 0 && (
                    <div className="mt-3 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      <p className="text-[11px] text-emerald-700 font-bold mb-1">
                        ✓ {archivos.length} {archivos.length === 1 ? 'archivo listo' : 'archivos listos'} para subir:
                      </p>

                      {archivos.map((file, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                        >
                          <span className="truncate max-w-[240px] text-slate-700 font-medium">
                            📄 {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoverArchivo(idx)}
                            className="text-red-500 hover:text-red-700 font-bold text-xs px-1.5 py-0.5 rounded hover:bg-red-50 cursor-pointer"
                            title="Quitar este archivo"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer mt-2"
                >
                  {usuarioLogueado?.rol === 'tecnico' ? 'Subir Resultado' : 'Subir y Notificar'}
                </button>

              </form>
            </div>
          )}

          {/* VISTA: GESTIÓN Y CREACIÓN DE USUARIOS DEL PERSONAL (SUPERADMIN) */}
          {seccion === 'gestion-usuarios' && esSuperAdmin && (
            <div className="space-y-6">
              
              {/* FORMULARIO: REGISTRAR NUEVO USUARIO EN TABLA PERSONA */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
                <div className="mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-900">Registrar Nuevo Usuario del Personal</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Crea cuentas de acceso para médicos, secretarias o técnicos.</p>
                </div>

                <form onSubmit={handleCrearUsuarioPersonal} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Cédula / Usuario</label>
                    <input 
                      type="text" 
                      placeholder="Ej: 15987654" 
                      value={formNuevoUsuario.cedula}
                      onChange={e => setFormNuevoUsuario({...formNuevoUsuario, cedula: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nombre Completo</label>
                    <input 
                      type="text" 
                      placeholder="Dr. Juan Pérez" 
                      value={formNuevoUsuario.nombre_completo}
                      onChange={e => setFormNuevoUsuario({...formNuevoUsuario, nombre_completo: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Contraseña</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={formNuevoUsuario.clave}
                      onChange={e => setFormNuevoUsuario({...formNuevoUsuario, clave: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Rol Asignado</label>
                    <select 
                      value={formNuevoUsuario.rol}
                      onChange={e => setFormNuevoUsuario({...formNuevoUsuario, rol: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
                    >
                      <option value="tecnico">Técnico</option>
                      <option value="secretaria">Secretaría</option>
                      <option value="medico">Médico</option>
                      <option value="superadmin">SuperAdmin</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button 
                      type="submit" 
                      className="w-full py-3 bg-red-800 hover:bg-red-950 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Crear Usuario del Personal
                    </button>
                  </div>
                </form>
              </div>

              {/* TABLA: DIRECTORIO DE PERSONA, ROLES Y ACCIONES */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Personal Registrado</h3>
                    <p className="text-xs text-slate-500">Modifica roles, cambia contraseñas o elimina usuarios.</p>
                  </div>
                  <button 
                    onClick={cargarUsuariosPersonal}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    🔄 Actualizar
                  </button>
                </div>

                {cargandoUsuarios ? (
                  <div className="py-8 text-center text-slate-400">
                    <div className="w-5 h-5 border-2 border-red-800 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-xs">Cargando personal...</p>
                  </div>
                ) : usuariosPersonal.length === 0 ? (
                  <p className="text-xs text-center text-slate-400 py-6">No hay usuarios registrados en la tabla persona.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-2 font-semibold">Cédula</th>
                          <th className="py-3 px-2 font-semibold">Nombre Completo</th>
                          <th className="py-3 px-2 font-semibold">Rol Actual</th>
                          <th className="py-3 px-2 font-semibold text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usuariosPersonal.map(u => (
                          <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-2 font-semibold text-slate-900">{u.cedula}</td>
                            <td className="py-3 px-2 text-slate-700">{u.nombre_completo}</td>
                            <td className="py-3 px-2">
                              <span className="inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-800 rounded-md">
                                {u.rol}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right space-x-1.5">
                              {/* CAMBIAR ROL */}
                              <select 
                                value={u.rol}
                                onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                                className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 text-slate-700 font-medium cursor-pointer"
                              >
                                <option value="tecnico">Técnico</option>
                                <option value="secretaria">Secretaría</option>
                                <option value="medico">Médico</option>
                                <option value="superadmin">SuperAdmin</option>
                              </select>

                              {/* CAMBIAR CLAVE */}
                              <button
                                type="button"
                                onClick={() => handleCambiarClaveUsuarioPersonal(u.id)}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                title="Cambiar contraseña"
                              >
                                🔑
                              </button>

                              {/* ELIMINAR USUARIO */}
                              <button
                                type="button"
                                onClick={() => handleEliminarUsuarioPersonal(u.id)}
                                className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                title="Eliminar usuario"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

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

                    <div className="flex items-center space-x-2">
                      <a 
                        href={`https://app-radiografia-production.up.railway.app/api/descargar/${e.id}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-red-950 hover:bg-red-800 text-white text-xs font-medium rounded-lg transition-colors inline-block"
                      >
                        Descargar
                      </a>

                      {esSuperAdmin && (
                        <button 
                          onClick={() => handleEliminarEstudio(e.id)}
                          className="px-2.5 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          title="Eliminar este estudio"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL PARA EDITAR PACIENTE (CON CAMPO DE CONTRASEÑA OPCIONAL) */}
      {pacienteAEditar && (usuarioLogueado?.rol === 'secretaria' || esSuperAdmin) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Editar Datos del Paciente</h3>
              <button onClick={() => setPacienteAEditar(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer">✕</button>
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Nueva Contraseña <span className="text-[10px] text-slate-400 font-normal">(Dejar en blanco para no cambiar)</span>
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={formEditPaciente.clave}
                  onChange={e => setFormEditPaciente({...formEditPaciente, clave: e.target.value})}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setPacienteAEditar(null)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BARRA MÓVIL INFERIOR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 flex items-center justify-around py-2 px-1 shadow-lg">
        <button
          onClick={() => setSeccion('pacientes-lista')}
          className={`flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-colors ${
            seccion === 'pacientes-lista' ? 'text-red-900 font-bold' : 'text-slate-400'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[10px]">Pacientes</span>
        </button>

        {(usuarioLogueado?.rol === 'secretaria' || esSuperAdmin) && (
          <button
            onClick={() => setSeccion('crear-paciente')}
            className={`flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-colors ${
              seccion === 'crear-paciente' ? 'text-red-900 font-bold' : 'text-slate-400'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span className="text-[10px]">Nuevo</span>
          </button>
        )}

        <button
          onClick={() => setSeccion('subir-estudio')}
          className={`flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-colors ${
            seccion === 'subir-estudio' ? 'text-red-900 font-bold' : 'text-slate-400'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span className="text-[10px]">Cargar</span>
        </button>

        {esSuperAdmin && (
          <button
            onClick={() => setSeccion('gestion-usuarios')}
            className={`flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-colors ${
              seccion === 'gestion-usuarios' ? 'text-red-900 font-bold' : 'text-slate-400'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <span className="text-[10px]">Usuarios</span>
          </button>
        )}

        <button
          onClick={() => { setAutenticado(false); setUsuarioLogueado(null); }}
          className="flex flex-col items-center justify-center w-full py-1 text-red-500 cursor-pointer"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[10px]">Salir</span>
        </button>

      </div>

      {/* MODAL: PACIENTE YA EXISTE */}
        {modalPacienteExiste && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
              
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ⚠️
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">Éste paciente ya está registrado</h3>
                <p className="text-xs text-slate-500 mt-1">
                  La cédula <strong className="text-slate-800">{formPaciente.cedula}</strong> ya pertenece a un paciente que se encuentra registrado en el sistema.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalPacienteExiste(false)}
                className="w-full py-2.5 bg-red-800 hover:bg-red-950 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        )}

    </div>
  );
}