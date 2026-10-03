import React, { useState, useEffect } from 'react';

export default function PanelPersonal() {
  // 1. Autenticación y Rol (Mantiene sesión activa al refrescar F5)
  const [usuarioLogueado, setUsuarioLogueado] = useState(() => {
    try {
      const guardado = localStorage.getItem('usuarioLogueado');
      return guardado ? JSON.parse(guardado) : null;
    } catch (e) {
      return null;
    }
  });

  // SISTEMA DE NOTIFICACIONES TOAST (Reemplaza alert())
  const [toast, setToast] = useState({ mostrar: false, tipo: 'exito', mensaje: '' });

  const mostrarToast = (mensaje, tipo = 'exito') => {
    setToast({ mostrar: true, tipo, mensaje });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, mostrar: false }));
    }, 3500);
  };

  // MODAL DE CONFIRMACIÓN PERSONALIZADO (Reemplaza confirm())
  const [modalConfirm, setModalConfirm] = useState({ 
    mostrar: false, 
    titulo: '', 
    mensaje: '', 
    onConfirm: null 
  });

  const solicitarConfirmacion = (titulo, mensaje, accionConfirmar) => {
    setModalConfirm({
      mostrar: true,
      titulo,
      mensaje,
      onConfirm: () => {
        accionConfirmar();
        setModalConfirm({ mostrar: false, titulo: '', mensaje: '', onConfirm: null });
      }
    });
  };

  // MODAL CAMBIAR CONTRASEÑA PERSONALIZADO (Reemplaza prompt())
  const [modalClave, setModalClave] = useState({ mostrar: false, usuarioId: null, clave: '' });

  // Estados para la animación global de carga
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [mensajeCargando, setMensajeCargando] = useState('');
  const [mensajeFormPaciente, setMensajeFormPaciente] = useState({ tipo: '', texto: '' });

  // Estado para la animación del botón "Actualizar Pendientes"
  const [cargandoPendientes, setCargandoPendientes] = useState(false);

  const [autenticado, setAutenticado] = useState(() => {
    return !!localStorage.getItem('usuarioLogueado');
  });

  const [adminCedula, setAdminCedula] = useState('');
  const [adminClave, setAdminClave] = useState('');
  const [mostrarClaveAdmin, setMostrarClaveAdmin] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  // 2. Estado de Estudios Pendientes
  const [estudiosPendientes, setEstudiosPendientes] = useState([]);

  // Normalización de roles
  const rolActual = usuarioLogueado?.rol?.toLowerCase() || '';
  const esSuperAdmin = ['superadmin', 'admin'].includes(rolActual);
  const esSecretaria = ['secretaria', 'secretario'].includes(rolActual) || esSuperAdmin;
  const esMedico = ['medico', 'médico'].includes(rolActual);
  const esTecnico = ['tecnico', 'técnico', 'tecnico_radiologico'].includes(rolActual);

  // 3. Estados del Panel
  const [seccion, setSeccion] = useState(() => {
    try {
      const guardado = localStorage.getItem('usuarioLogueado');
      if (guardado) {
        const user = JSON.parse(guardado);
        const r = user?.rol?.toLowerCase() || '';
        if (r === 'medico' || r === 'médico' || r.includes('tecnico')) {
          return 'estudios-pendientes';
        }
      }
    } catch (e) {}
    return 'pacientes-lista';
  });

  const [pacientes, setPacientes] = useState([]);
  const [busquedaLista, setBusquedaLista] = useState('');

  // 4. Modal de Expediente
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [estudiosPaciente, setEstudiosPaciente] = useState([]);
  const [cargandoEstudios, setCargandoEstudios] = useState(false);

  // 5. Modal de Editar Paciente
  const [pacienteAEditar, setPacienteAEditar] = useState(null);
  const [formEditPaciente, setFormEditPaciente] = useState({
    cedula: '',
    nombre_completo: '',
    telefono: '',
    correo: '',
    clave: ''
  });

  // Guarda la orden pendiente que se va a responder desde la pestaña de subida
  const [estudioPendienteSeleccionado, setEstudioPendienteSeleccionado] = useState(null);

  // 6. Formulario Crear Paciente
  const [mostrarClavePaciente, setMostrarClavePaciente] = useState(true);
  const [formPaciente, setFormPaciente] = useState({
    cedula: '',
    nombre_completo: '',
    telefono: '',
    correo: '',
    clave: '',
    edad: '',
    es_menor_sin_cedula: false,
    cedula_representante: '',
    crear_orden: false,
    tipo_examen: 'Radiografía',
    titulo: ''
  });

  // Función para cambiar de sección en el Sidebar
  const cambiarSeccion = (nuevaSeccion) => {
    if (nuevaSeccion === 'subir-estudio') {
      setEstudioPendienteSeleccionado(null);
      setPacienteSeleccionadoSubida(null);
      setBusquedaPacienteSubida('');
      setTitulo('');
      setArchivos([]);
      if (!esMedico && !esTecnico) {
        setTipoExamen('Radiografía');
      }
    }
    setSeccion(nuevaSeccion);
  };

  const getLabelSubir = () => {
    if (esMedico) return 'Subir Informes';
    if (esTecnico) return 'Subir Estudios';
    return 'Crear Orden / Subir';
  };

  const getLabelSubirMobile = () => {
    if (esMedico) return 'Informes';
    if (esTecnico) return 'Estudios';
    return 'Crear Orden';
  };

  // 7. Formulario Crear Orden / Subir Estudio
  const [busquedaPacienteSubida, setBusquedaPacienteSubida] = useState('');
  const [pacienteSeleccionadoSubida, setPacienteSeleccionadoSubida] = useState(null);
  const [tipoExamen, setTipoExamen] = useState('Radiografía');
  const [titulo, setTitulo] = useState('');
  const [archivos, setArchivos] = useState([]);

  // 8. Gestión de Usuarios
  const [usuariosPersonal, setUsuariosPersonal] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [formNuevoUsuario, setFormNuevoUsuario] = useState({
    cedula: '',
    nombre_completo: '',
    clave: '',
    rol: 'tecnico'
  });

  // CARGAR PACIENTES
  const cargarPacientes = async () => {
    try {
      const res = await fetch('/api/pacientes');
      const data = await res.json();
      if (Array.isArray(data)) setPacientes(data);
    } catch (e) {
      console.error("Error al cargar pacientes", e);
    }
  };

  // CARGAR USUARIOS
  const cargarUsuariosPersonal = async () => {
    setCargandoUsuarios(true);
    try {
      const res = await fetch('/api/admin/usuarios');
      const data = await res.json();
      if (Array.isArray(data)) setUsuariosPersonal(data);
    } catch (e) {
      console.error("Error al cargar usuarios", e);
    } finally {
      setCargandoUsuarios(false);
    }
  };

  // CARGAR ESTUDIOS PENDIENTES
  const cargarEstudiosPendientes = async (mostrarAnimacion = false) => {
    if (mostrarAnimacion) setCargandoPendientes(true);
    try {
      const res = await fetch('/api/estudios/pendientes');
      const data = await res.json();
      if (Array.isArray(data)) setEstudiosPendientes(data);
    } catch (e) {
      console.error("Error al obtener pendientes", e);
    } finally {
      if (mostrarAnimacion) setCargandoPendientes(false);
    }
  };

  useEffect(() => {
    if (!autenticado) return;

    cargarPacientes();

    const intervalo = setInterval(() => {
      cargarEstudiosPendientes(false);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [autenticado]);

  useEffect(() => {
    if (autenticado) {
      if (seccion === 'gestion-usuarios' && esSuperAdmin) {
        cargarUsuariosPersonal();
      }
      if (seccion === 'estudios-pendientes') {
        cargarEstudiosPendientes(true);
      }
    }
  }, [autenticado, seccion]);

  useEffect(() => {
    if (esMedico) {
      setTipoExamen('Informe Médico');
    }
  }, [seccion, usuarioLogueado]);

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

  const getMensajeCargandoSubida = () => {
    if ((esMedico || esSecretaria) && tipoExamen === 'Informe Médico') {
      return 'Subiendo informe médico y enviando notificación al paciente...';
    }
    if (esTecnico) {
      return 'Subiendo placas y estudios radiológicos...';
    }
    return 'Subiendo archivos y procesando solicitud...';
  };

  // Login del Personal
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorLogin('');

    setCargandoEnvio(true);
    setMensajeCargando('Verificando credenciales e iniciando sesión...');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula: adminCedula, clave: adminClave })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('usuarioLogueado', JSON.stringify(data.usuario));
        setAutenticado(true);
        setUsuarioLogueado(data.usuario);
        setAdminCedula('');
        setAdminClave('');

        const r = data.usuario?.rol?.toLowerCase() || '';
        if (r === 'medico' || r === 'médico' || r.includes('tecnico')) {
          setSeccion('estudios-pendientes');
        } else {
          setSeccion('pacientes-lista');
        }
        mostrarToast(`¡Bienvenido/a, ${data.usuario.nombre_completo}!`, 'exito');
      } else {
        setErrorLogin(data.error || 'Credenciales inválidas');
      }
    } catch {
      setErrorLogin('Error de conexión con el servidor');
    } finally {
      setCargandoEnvio(false);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuarioLogueado');
    setAutenticado(false);
    setUsuarioLogueado(null);
    setAdminCedula('');
    setAdminClave('');
    mostrarToast('Sesión cerrada correctamente', 'info');
  };

  // NOTIFICAR POR CORREO
  const handleNotificarCorreo = async (estudioId, correoPaciente) => {
    if (!estudioId) {
      return mostrarToast('Selecciona o crea un estudio previamente para notificar al paciente.', 'advertencia');
    }

    try {
      const res = await fetch(`/api/estudios/${estudioId}/notificar-correo`, {
        method: 'POST'
      });
      const data = await res.json();

      if (res.ok) {
        mostrarToast('📧 ¡Correo enviado con éxito al paciente!', 'exito');
      } else {
        mostrarToast(`⚠️ ${data.error || 'No se pudo enviar el correo'}`, 'advertencia');
      }
    } catch (error) {
      mostrarToast('Error de conexión al intentar enviar el correo', 'error');
    }
  };

  // NOTIFICAR POR WHATSAPP
  const handleNotificarWhatsApp = (pacienteNombre, pacienteTelefono, pacienteCedula, tituloEstudio) => {
    let tel = pacienteTelefono;

    if (!tel && (pacienteCedula || pacienteSeleccionadoSubida?.id)) {
      const pacienteEncontrado = pacientes.find(
        (p) => p.cedula === pacienteCedula || p.id === pacienteSeleccionadoSubida?.id
      );
      if (pacienteEncontrado && pacienteEncontrado.telefono) {
        tel = pacienteEncontrado.telefono;
      }
    }

    if (!tel || !tel.trim()) {
      return mostrarToast('El paciente no tiene un número de teléfono registrado.', 'advertencia');
    }

    let num = tel.replace(/\D/g, ''); 
    if (num.startsWith('0')) {
      num = '58' + num.substring(1); 
    } else if (!num.startsWith('58') && num.length === 10) {
      num = '58' + num;
    }

    const mensaje = encodeURIComponent(
      `¡Hola, ${pacienteNombre}! 👋\n\nTe saludamos de *Unidad de Imágenes Del Este*.\n\nLe informamos que su estudio *${tituloEstudio || 'Médico'}* ya se encuentra disponible en nuestro portal web.\n\nPuedes consultar y descargar tus resultados ingresando en:\nhttps://www.unidaddeimagenesdeleste.com/pacientes\n\n🔑 *Datos de acceso:*\n- *Cédula:* ${pacienteCedula}\n- *Clave:* Tu cédula`
    );

    window.open(`https://wa.me/${num}?text=${mensaje}`, '_blank');
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
      const res = await fetch(`/api/pacientes/${pacienteAEditar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEditPaciente)
      });

      if (res.ok) {
        mostrarToast('¡Paciente actualizado correctamente!', 'exito');
        setPacienteAEditar(null);
        cargarPacientes();
      } else {
        mostrarToast('Error al actualizar datos del paciente', 'error');
      }
    } catch (e) {
      console.error('Error:', e);
      mostrarToast('Error de conexión', 'error');
    }
  };

  const abrirExpediente = async (paciente) => {
    setPacienteSeleccionado(paciente);
    setCargandoEstudios(true);
    setEstudiosPaciente([]);

    try {
      const res = await fetch(`/api/estudios/paciente/${paciente.id}`);
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
    setMensajeFormPaciente({ tipo: '', texto: '' });

    try {
      const res = await fetch('/api/pacientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPaciente)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setFormPaciente({
          cedula: '',
          nombre_completo: '',
          telefono: '',
          correo: '',
          clave: '',
          edad: '',
          es_menor_sin_cedula: false,
          cedula_representante: '',
          crear_orden: false,
          tipo_examen: 'Radiografía',
          titulo: ''
        });
        cargarPacientes();
        cargarEstudiosPendientes(false);
        
        mostrarToast(
          formPaciente.crear_orden 
            ? '¡Paciente registrado y orden enviada!' 
            : '¡Paciente registrado con éxito!',
          'exito'
        );
        setSeccion('pacientes-lista');
      } else {
        setMensajeFormPaciente({ 
          tipo: 'error', 
          texto: data.error || 'No se pudo registrar el paciente.' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensajeFormPaciente({ 
        tipo: 'error', 
        texto: 'Error de conexión con el servidor. Intenta de nuevo.' 
      });
    }
  };

  const handleCrearOrdenSinArchivos = async () => {
    if (!pacienteSeleccionadoSubida) return mostrarToast('Selecciona un paciente de la lista', 'advertencia');
    if (!titulo.trim()) return mostrarToast('Ingresa el título del estudio', 'advertencia');

    setCargandoEnvio(true);
    setMensajeCargando(
      tipoExamen === 'Informe Médico'
        ? 'Creando orden de informe médico...'
        : 'Creando orden de examen para el técnico...'
    );

    try {
      const res = await fetch('/api/estudios/crear-orden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_id: pacienteSeleccionadoSubida.id,
          tipo_examen: tipoExamen,
          titulo: titulo
        })
      });

      if (res.ok) {
        mostrarToast('¡Orden creada con éxito! Ya le aparece a los encargados.', 'exito');
        setTitulo('');
        setPacienteSeleccionadoSubida(null);
        setBusquedaPacienteSubida('');
        cargarEstudiosPendientes(false);
      } else {
        mostrarToast('Error al crear la orden de examen', 'error');
      }
    } catch (e) {
      console.error('Error:', e);
      mostrarToast('Error de conexión con el servidor', 'error');
    } finally {
      setCargandoEnvio(false);
    }
  };

  const handleSubirEstudioConArchivos = async () => {
    if (!pacienteSeleccionadoSubida) return mostrarToast('Selecciona un paciente de la lista.', 'advertencia');
    if (!titulo.trim()) return mostrarToast('Ingresa el título del estudio.', 'advertencia');
    if (archivos.length === 0) return mostrarToast('Debes adjuntar al menos un archivo para subir.', 'advertencia');

    const formData = new FormData();
    archivos.forEach((file) => {
      formData.append('archivos', file);
    });

    const esCargaInforme = esMedico || esSecretaria || tipoExamen === 'Informe Médico';
    const esRespuestaTecnico = esTecnico || estudioPendienteSeleccionado?.estado === 'pendiente_tecnico';

    setCargandoEnvio(true);
    setMensajeCargando(getMensajeCargandoSubida());

    try {
      let res;
      let estudioIdProcesado = estudioPendienteSeleccionado?.id;

      if (estudioPendienteSeleccionado) {
        const endpoint = esRespuestaTecnico && estudioPendienteSeleccionado.estado === 'pendiente_tecnico' && tipoExamen !== 'Informe Médico'
          ? `/api/estudios/${estudioPendienteSeleccionado.id}/cargar-imagenes`
          : `/api/estudios/${estudioPendienteSeleccionado.id}/cargar-informe`;

        res = await fetch(endpoint, {
          method: 'PUT',
          body: formData
        });
      } else {
        formData.append('paciente_id', pacienteSeleccionadoSubida.id);
        formData.append('tipo_examen', tipoExamen);
        formData.append('titulo', titulo);
        formData.append('notificar_correo', esCargaInforme);

        res = await fetch('/api/estudios', {
          method: 'POST',
          body: formData
        });
      }

      if (res.ok) {
        const responseData = await res.json().catch(() => ({}));
        if (!estudioIdProcesado) {
          estudioIdProcesado = responseData.id || responseData.estudioId || responseData.id_estudio || responseData.estudio?.id;
        }

        let correoEnviado = false;
        let mensajeCorreoError = '';

        if (estudioIdProcesado && (tipoExamen === 'Informe Médico' || esCargaInforme)) {
          try {
            const resCorreo = await fetch(`/api/estudios/${estudioIdProcesado}/notificar-correo`, {
              method: 'POST'
            });
            const dataCorreo = await resCorreo.json().catch(() => ({}));

            if (resCorreo.ok) {
              correoEnviado = true;
            } else {
              mensajeCorreoError = dataCorreo.error || 'El paciente no posee correo registrado';
            }
          } catch (errCorreo) {
            console.error('Error al notificar correo:', errCorreo);
            mensajeCorreoError = 'Error de conexión con servidor de correos';
          }
        }

        if (tipoExamen === 'Informe Médico' || esMedico) {
          if (correoEnviado) {
            mostrarToast('📧 ¡Informe cargado con éxito y correo enviado al paciente!', 'exito');
          } else if (mensajeCorreoError) {
            mostrarToast(`✅ Informe cargado. (Correo: ${mensajeCorreoError})`, 'advertencia');
          } else {
            mostrarToast('✅ ¡Informe cargado con éxito!', 'exito');
          }
        } else {
          if (correoEnviado) {
            mostrarToast('📧 ¡Estudio cargado con éxito y notificado por correo!', 'exito');
          } else {
            mostrarToast(
              estudioPendienteSeleccionado 
                ? '¡Orden actualizada y procesada con éxito!' 
                : '¡Estudio cargado con éxito!',
              'exito'
            );
          }
        }

        setTitulo('');
        handleLimpiarArchivos();
        setPacienteSeleccionadoSubida(null);
        setBusquedaPacienteSubida('');
        setEstudioPendienteSeleccionado(null);
        cargarEstudiosPendientes(false);
        setSeccion('estudios-pendientes');
      } else {
        mostrarToast('Error al subir los archivos al servidor.', 'error');
      }
    } catch (error) {
      console.error('Error al conectar:', error);
      mostrarToast('Error de conexión con el servidor.', 'error');
    } finally {
      setCargandoEnvio(false);
    }
  };

  const handleCancelarOrdenPendiente = (estudioId) => {
    solicitarConfirmacion(
      '¿Cancelar Orden?',
      '¿Estás seguro de que deseas cancelar y eliminar esta orden pendiente?',
      async () => {
        try {
          const res = await fetch(`/api/estudios/${estudioId}`, {
            method: 'DELETE'
          });

          if (res.ok) {
            mostrarToast('¡Orden cancelada y eliminada con éxito!', 'exito');
            cargarEstudiosPendientes(false);
          } else {
            mostrarToast('Error al eliminar la orden', 'error');
          }
        } catch (e) {
          console.error('Error:', e);
          mostrarToast('Error de conexión con el servidor', 'error');
        }
      }
    );
  };

  const handleGuardarEstudio = (e) => {
    e.preventDefault();
    if (archivos.length > 0) {
      handleSubirEstudioConArchivos();
    } else {
      handleCrearOrdenSinArchivos();
    }
  };

  const handleCrearUsuarioPersonal = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formNuevoUsuario)
      });

      const data = await res.json();

      if (res.ok) {
        mostrarToast('¡Usuario registrado con éxito!', 'exito');
        setFormNuevoUsuario({ cedula: '', nombre_completo: '', clave: '', rol: 'tecnico' });
        cargarUsuariosPersonal();
      } else {
        mostrarToast(data.error || 'Error al registrar usuario', 'error');
      }
    } catch (e) {
      console.error('Error:', e);
      mostrarToast('Error de conexión con el servidor', 'error');
    }
  };

  const handleCambiarRol = async (usuarioId, nuevoRol) => {
    try {
      const res = await fetch(`/api/admin/usuarios/${usuarioId}/rol`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: nuevoRol })
      });

      if (res.ok) {
        mostrarToast('¡Rol actualizado con éxito!', 'exito');
        cargarUsuariosPersonal();
      } else {
        mostrarToast('Error al actualizar el rol', 'error');
      }
    } catch (e) {
      console.error('Error:', e);
      mostrarToast('Error de conexión', 'error');
    }
  };

  const handleAbrirModalCambiarClave = (usuarioId) => {
    setModalClave({ mostrar: true, usuarioId, clave: '' });
  };

  const handleEjecutarCambioClave = async (e) => {
    e.preventDefault();
    if (!modalClave.clave || modalClave.clave.trim() === '') {
      return mostrarToast('Ingresa una contraseña válida', 'advertencia');
    }

    try {
      const res = await fetch(`/api/admin/usuarios/${modalClave.usuarioId}/clave`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: modalClave.clave })
      });

      if (res.ok) {
        mostrarToast('¡Contraseña actualizada con éxito!', 'exito');
        setModalClave({ mostrar: false, usuarioId: null, clave: '' });
      } else {
        mostrarToast('Error al actualizar la contraseña', 'error');
      }
    } catch (e) {
      console.error('Error:', e);
      mostrarToast('Error de conexión con el servidor', 'error');
    }
  };

  const handleEliminarUsuarioPersonal = (usuarioId) => {
    solicitarConfirmacion(
      '¿Eliminar Usuario?',
      '¿Seguro que deseas eliminar este usuario del personal? Perderá el acceso de inmediato.',
      async () => {
        try {
          const res = await fetch(`/api/admin/usuarios/${usuarioId}`, {
            method: 'DELETE'
          });

          if (res.ok) {
            mostrarToast('¡Usuario eliminado correctamente!', 'exito');
            cargarUsuariosPersonal();
          } else {
            mostrarToast('Error al eliminar el usuario', 'error');
          }
        } catch (e) {
          console.error('Error:', e);
          mostrarToast('Error de conexión con el servidor', 'error');
        }
      }
    );
  };

  const handleEliminarEstudio = (estudioId) => {
    solicitarConfirmacion(
      '¿Eliminar Estudio?',
      '¿Estás seguro de eliminar este estudio de la base de datos de forma permanente?',
      async () => {
        const res = await fetch(`/api/estudios/${estudioId}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          mostrarToast('Estudio eliminado con éxito', 'exito');
          setEstudiosPaciente(prev => prev.filter(e => e.id !== estudioId));
        } else {
          mostrarToast('Error al eliminar el estudio', 'error');
        }
      }
    );
  };

  const handleEliminarPaciente = (pacienteId) => {
    solicitarConfirmacion(
      '¿Borrar Paciente Completo?',
      '¿Seguro que deseas borrar este paciente y TODOS sus estudios asociados?',
      async () => {
        const res = await fetch(`/api/pacientes/${pacienteId}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          mostrarToast('Paciente eliminado del sistema', 'exito');
          cargarPacientes();
        } else {
          mostrarToast('Error al eliminar el paciente', 'error');
        }
      }
    );
  };

  const pacientesFiltradosLista = pacientes.filter(p => 
    p.cedula.toLowerCase().includes(busquedaLista.toLowerCase()) ||
    p.nombre_completo.toLowerCase().includes(busquedaLista.toLowerCase())
  );

  const pacientesFiltradosSubida = busquedaPacienteSubida.trim() === '' ? [] : pacientes.filter(p =>
    p.cedula.toLowerCase().includes(busquedaPacienteSubida.toLowerCase()) ||
    p.nombre_completo.toLowerCase().includes(busquedaPacienteSubida.toLowerCase())
  );

  const pendientesFiltradosPorRol = estudiosPendientes.filter((est) => {
    if (esTecnico && !esSecretaria && est.tipo_examen === 'Informe Médico') {
      return false;
    }
    return true;
  });

  /* LOGIN ADMINISTRATIVO */
  if (!autenticado) {
    return (
      <div className="min-h-screen bg-rose-950 flex flex-col justify-center items-center p-4 font-sans">
        <div className="w-full max-w-sm bg-white border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Logo Unidad de Imágenes" 
                className="w-full h-full object-contain drop-shadow-sm" 
              />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Acceso Administrativo</h2>
            <p className="text-xs text-slate-400">Ingresa con tus credenciales de personal</p>
          </div>

          <form onSubmit={handleAdminLogin} autoComplete="off" className="space-y-4">
            {errorLogin && (
              <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl text-center font-medium">
                {errorLogin}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Usuario o Cédula</label>
              <input 
                type="text" 
                autoComplete="off"
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
                  autoComplete="new-password"
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
                  {mostrarClaveAdmin ? '🙈' : '👁️'}
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
    <div className="flex h-screen overflow-hidden bg-slate-100 font-sans text-slate-800 relative">

      {/* NOTIFICACIÓN TOAST FLOTANTE Y ANIMADA */}
      {toast.mostrar && (
        <div className="fixed top-5 right-5 z-[120] max-w-sm w-full animate-bounce-short transition-all duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 ${
            toast.tipo === 'exito' 
              ? 'bg-emerald-900 text-white border-emerald-700' 
              : toast.tipo === 'error'
              ? 'bg-red-900 text-white border-red-700'
              : toast.tipo === 'advertencia'
              ? 'bg-amber-800 text-white border-amber-600'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="text-base">
                {toast.tipo === 'exito' && '✅'}
                {toast.tipo === 'error' && '❌'}
                {toast.tipo === 'advertencia' && '⚠️'}
                {toast.tipo === 'info' && 'ℹ️'}
              </span>
              <p className="text-xs font-semibold leading-snug">{toast.mensaje}</p>
            </div>
            <button 
              onClick={() => setToast({ ...toast, mostrar: false })}
              className="text-xs opacity-70 hover:opacity-100 font-bold px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PERSONALIZADO */}
      {modalConfirm.mostrar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center animate-fade-in">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ⚠️
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">{modalConfirm.titulo}</h3>
            <p className="text-xs text-slate-500 mb-6">{modalConfirm.mensaje}</p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalConfirm({ mostrar: false, titulo: '', mensaje: '', onConfirm: null })}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={modalConfirm.onConfirm}
                className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-md cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PERSONALIZADO DE CAMBIO DE CONTRASEÑA DE USUARIO */}
      {modalClave.mostrar && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[110]">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">🔑 Cambiar Contraseña</h3>
              <button 
                onClick={() => setModalClave({ mostrar: false, usuarioId: null, clave: '' })} 
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEjecutarCambioClave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Nueva Contraseña
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={modalClave.clave}
                  onChange={e => setModalClave({ ...modalClave, clave: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  required
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button 
                  type="button"
                  onClick={() => setModalClave({ mostrar: false, usuarioId: null, clave: '' })}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-md cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* SIDEBAR LATERAL FIJO */}
      <aside className="hidden md:flex w-64 h-full bg-slate-100 text-slate-900 flex-col justify-between p-4 shrink-0 border-r border-slate-200/80">
        <div>
          <div className="flex items-center space-x-3 px-2 py-4 mb-6 border-b border-slate-200">
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img 
                src="/logo.png" 
                alt="Logo Unidad de Imágenes" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">{usuarioLogueado?.nombre_completo || 'Panel Interno'}</h2>
              <p className="text-[11px] text-slate-500">Unidad de Imágenes del Este</p>
              {usuarioLogueado?.rol && (
                <span className="inline-block px-2 py-0.5 mt-1 text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-800 border border-red-200 rounded-md">
                  {usuarioLogueado.rol}
                </span>
              )}
            </div>
          </div>

          <nav className="space-y-2">

            {/* BOTÓN 1: PACIENTES */}
            <button
              onClick={() => cambiarSeccion('pacientes-lista')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                seccion === 'pacientes-lista'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'hover:bg-slate-200/60 text-slate-900 hover:text-slate-900'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs text-slate-900">Pacientes ({pacientes.length})</span>
            </button>

            {/* BOTÓN 2: CREAR PACIENTE */}
            {esSecretaria && (
              <button
                onClick={() => cambiarSeccion('crear-paciente')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  seccion === 'crear-paciente'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                    : 'hover:bg-slate-200/60 text-slate-900 hover:text-slate-900'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-900">Crear Paciente</span>
              </button>
            )}

            {/* BOTÓN 3: CREAR ORDEN / SUBIR */}
            <button
              onClick={() => cambiarSeccion('subir-estudio')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                seccion === 'subir-estudio'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'hover:bg-slate-200/60 text-slate-900 hover:text-slate-900'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-xs text-slate-900">{getLabelSubir()}</span>
            </button>

            {/* BOTÓN 4: ESTUDIOS PENDIENTES */}
            <button
              onClick={() => cambiarSeccion('estudios-pendientes')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                seccion === 'estudios-pendientes'
                  ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                  : 'hover:bg-slate-200/60 text-slate-900 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-900">Pendientes</span>
              </div>

              {pendientesFiltradosPorRol.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500 text-white rounded-full shadow-sm">
                  {pendientesFiltradosPorRol.length}
                </span>
              )}
            </button>

            {/* BOTÓN 5: GESTIÓN DE USUARIOS */}
            {esSuperAdmin && (
              <button
                onClick={() => cambiarSeccion('gestion-usuarios')}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  seccion === 'gestion-usuarios'
                    ? 'bg-white text-slate-900 shadow-md border border-slate-200'
                    : 'hover:bg-slate-200/60 text-slate-900 hover:text-slate-900'
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs text-slate-900">Usuarios</span>
              </button>
            )}

          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">MedicsWebs v1.0.1</span>
          <button 
            onClick={handleCerrarSesion} 
            className="text-xs text-red-600 hover:text-red-800 transition-colors font-bold cursor-pointer"
          >
            Salir
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 h-full p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto">
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
                            {esSecretaria && (
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

          {/* VISTA: CREAR PACIENTES */}
          {seccion === 'crear-paciente' && esSecretaria && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Registrar Nuevo Paciente</h2>
                <p className="text-xs text-slate-500 mt-0.5">Ingresa los datos personales y genera su orden de examen si está en sala.</p>
              </div>

              <form onSubmit={handleGuardarPaciente} className="space-y-4">

                {mensajeFormPaciente.texto && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    mensajeFormPaciente.tipo === 'error' 
                      ? 'bg-red-50 border border-red-200 text-red-700' 
                      : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  }`}>
                    <span>⚠️ {mensajeFormPaciente.texto}</span>
                    <button 
                      type="button" 
                      onClick={() => setMensajeFormPaciente({ tipo: '', texto: '' })}
                      className="font-bold text-sm px-1 cursor-pointer hover:text-slate-900"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* CASILLA: MENOR DE EDAD SIN CÉDULA */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={formPaciente.es_menor_sin_cedula}
                      onChange={e => {
                        const checked = e.target.checked;
                        setFormPaciente(prev => ({
                          ...prev,
                          es_menor_sin_cedula: checked,
                          cedula_representante: checked ? prev.cedula_representante : '',
                          cedula: checked && prev.cedula_representante ? prev.cedula_representante : (checked ? '' : prev.cedula)
                        }));
                      }}
                      className="w-4 h-4 text-red-800 rounded focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-amber-900">👶 Paciente menor de edad sin cédula</span>
                  </label>

                  {formPaciente.es_menor_sin_cedula && (
                    <div>
                      <label className="block text-[11px] font-semibold text-amber-900 uppercase tracking-wider mb-1">
                        Cédula del Representante / Padre
                      </label>
                      <input 
                        type="text" 
                        placeholder="Ej: 12345678" 
                        value={formPaciente.cedula_representante}
                        onChange={e => {
                          const val = e.target.value;
                          setFormPaciente(prev => ({
                            ...prev,
                            cedula_representante: val,
                            cedula: val 
                          }));
                        }}
                        className="w-full px-4 py-2.5 text-sm bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
                        required={formPaciente.es_menor_sin_cedula}
                      />
                      <p className="text-[10px] text-amber-700 mt-1">
                        * Se usará esta cédula como identificador del paciente para consultar sus exámenes.
                      </p>
                    </div>
                  )}
                </div>

                {!formPaciente.es_menor_sin_cedula && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Cédula / DNI (Usuario)</label>
                    <input 
                      type="text" 
                      placeholder="Ej: 12345678" 
                      value={formPaciente.cedula}
                      onChange={e => setFormPaciente({...formPaciente, cedula: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      required={!formPaciente.es_menor_sin_cedula}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Nombre Completo del Paciente</label>
                  <input 
                    type="text" 
                    placeholder="Nombre y Apellidos del paciente" 
                    value={formPaciente.nombre_completo}
                    onChange={e => setFormPaciente({...formPaciente, nombre_completo: e.target.value})}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Edad</label>
                    <input 
                      type="text" 
                      placeholder="Introducir edad" 
                      value={formPaciente.edad}
                      onChange={e => setFormPaciente({...formPaciente, edad: e.target.value})}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
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
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Contraseña Asignada</label>
                  <div className="relative">
                    <input 
                      type={mostrarClavePaciente ? 'text' : 'password'} 
                      placeholder="Ingrese la contraseña" 
                      value={formPaciente.clave}
                      onChange={e => setFormPaciente({...formPaciente, clave: e.target.value})}
                      className="w-full pl-4 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-medium text-slate-800"
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarClavePaciente(!mostrarClavePaciente)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-sm select-none"
                      title={mostrarClavePaciente ? 'Ocultar clave' : 'Mostrar clave'}
                    >
                      {mostrarClavePaciente ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer select-none mb-3">
                    <input 
                      type="checkbox" 
                      checked={formPaciente.crear_orden}
                      onChange={e => setFormPaciente({...formPaciente, crear_orden: e.target.checked})}
                      className="w-4 h-4 text-red-800 rounded focus:ring-red-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-800">📋 Generar Orden de Examen Inicial de una vez</span>
                  </label>

                  {formPaciente.crear_orden && (
                    <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tipo de Examen</label>
                        <select 
                          value={formPaciente.tipo_examen}
                          onChange={e => setFormPaciente({...formPaciente, tipo_examen: e.target.value})}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg cursor-pointer font-medium"
                        >
                          <option value="Radiografía">Radiografía (Para Técnico)</option>
                          <option value="Tomografía">Tomografía (Para Técnico)</option>
                          <option value="Tomografías y/o Radiografías">Tomografías y Radiografías (Ambas)</option>
                          <option value="Informe Médico">Informe Médico (Para Médico / Secretaría)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Título / Estudio Solicitado</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Radiografía Panorámica / Tomografía de Tórax" 
                          value={formPaciente.titulo}
                          onChange={e => setFormPaciente({...formPaciente, titulo: e.target.value})}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                          required={formPaciente.crear_orden}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-red-800 hover:bg-red-950 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer mt-2"
                >
                  {formPaciente.crear_orden ? 'Guardar Paciente y Enviar Orden' : 'Guardar Solo Paciente'}
                </button>
              </form>
            </div>
          )}

          {/* VISTA: CREAR ORDEN / SUBIR RESULTADO */}
          {seccion === 'subir-estudio' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
              
              {estudioPendienteSeleccionado && (
                <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-900 block">⌛ Respondiendo Orden Pendiente:</span>
                    <span className="text-amber-800 font-medium">{estudioPendienteSeleccionado.titulo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEstudioPendienteSeleccionado(null);
                      setPacienteSeleccionadoSubida(null);
                      setBusquedaPacienteSubida('');
                      setTitulo('');
                      setArchivos([]);
                      if (!esMedico && !esTecnico) setTipoExamen('Radiografía');
                    }}
                    className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                  >
                    ✕ Crear Nueva Orden
                  </button>
                </div>
              )}

              <div className="mb-6 pb-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">
                  {estudioPendienteSeleccionado ? 'Cargar Resultado de Orden Pendiente' : 'Crear Orden de Examen o Subir Resultado'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {estudioPendienteSeleccionado 
                    ? `Adjuntando archivos para la orden pendiente: ${estudioPendienteSeleccionado.titulo}`
                    : 'Selecciona un paciente registrado para enviarle la orden al técnico o subir un resultado directo.'}
                </p>
              </div>

              <form onSubmit={handleGuardarEstudio} className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Buscar Paciente (Cédula o Nombre)
                  </label>
                  
                  {pacienteSeleccionadoSubida ? (
                    <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-xs text-sky-900 block">{pacienteSeleccionadoSubida.nombre_completo}</strong>
                          <span className="text-[11px] text-sky-600">C.I: {pacienteSeleccionadoSubida.cedula}</span>
                          {pacienteSeleccionadoSubida.correo && (
                            <span className="text-[10px] text-slate-500 block">✉️ {pacienteSeleccionadoSubida.correo}</span>
                          )}
                          {pacienteSeleccionadoSubida.telefono && (
                            <span className="text-[10px] text-slate-500 block">📞 {pacienteSeleccionadoSubida.telefono}</span>
                          )}
                        </div>
                        {!estudioPendienteSeleccionado && (
                          <button 
                            type="button" 
                            onClick={() => { setPacienteSeleccionadoSubida(null); setBusquedaPacienteSubida(''); }}
                            className="text-xs text-red-500 hover:underline font-medium cursor-pointer"
                          >
                            Cambiar
                          </button>
                        )}
                      </div>

                      <div className="pt-2 border-t border-sky-200/60 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-sky-800 uppercase">Notificar al paciente:</span>
                        
                        <button
                          type="button"
                          onClick={() => handleNotificarCorreo(estudioPendienteSeleccionado?.id, pacienteSeleccionadoSubida.correo)}
                          className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-700 border border-sky-300 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          📧 Correo
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNotificarWhatsApp(
                            pacienteSeleccionadoSubida.nombre_completo,
                            pacienteSeleccionadoSubida.telefono,
                            pacienteSeleccionadoSubida.cedula,
                            titulo || 'Estudio Médico'
                          )}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                        >
                          💬 WhatsApp
                        </button>
                      </div>
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
                    disabled={!!estudioPendienteSeleccionado || esMedico || (esTecnico && !esSecretaria)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 cursor-pointer disabled:opacity-75 disabled:bg-slate-100 font-medium"
                  >
                    {esTecnico && !esSecretaria && (
                      <>
                        <option value="Radiografía">Radiografía</option>
                        <option value="Tomografía">Tomografía</option>
                        <option value="Tomografías y/o Radiografías">Tomografías y/o Radiografías</option>
                      </>
                    )}

                    {esMedico && !esSecretaria && (
                      <option value="Informe Médico">Informe Médico</option>
                    )}

                    {esSecretaria && (
                      <>
                        <option value="Radiografía">Radiografía (Para Técnico)</option>
                        <option value="Tomografía">Tomografía (Para Técnico)</option>
                        <option value="Tomografías y/o Radiografías">Tomografías y/o Radiografías (Ambas)</option>
                        <option value="Informe Médico">Informe Médico (Para Médico / Secretaría)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Título del Estudio
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: Radiografía Panorámica / Tomografía de Tórax" 
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    readOnly={!!estudioPendienteSeleccionado}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 read-only:bg-slate-100"
                    required 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    {tipoExamen === 'Informe Médico' ? 'Archivo del Informe Médico (PDF/Doc)' : 'Archivos de Examen / Placas'} 
                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                      (Opcional si solo deseas crear la orden pendiente)
                    </span>
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

                {esSecretaria ? (
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    {!estudioPendienteSeleccionado && (
                      <button 
                        type="button" 
                        onClick={handleCrearOrdenSinArchivos}
                        className="w-full sm:w-1/2 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        📋 Crear Orden (Para Pendientes)
                      </button>
                    )}

                    <button 
                      type="button" 
                      onClick={handleSubirEstudioConArchivos}
                      className={`w-full ${!estudioPendienteSeleccionado ? 'sm:w-1/2' : 'w-full'} py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer`}
                    >
                      📤 Subir Archivos Directo y Notificar
                    </button>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button 
                      type="button" 
                      onClick={handleSubirEstudioConArchivos}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {esMedico || tipoExamen === 'Informe Médico' ? (
                        <>📧 Subir Informe y Notificar por Correo</>
                      ) : (
                        <>📤 Subir y Procesar Estudio</>
                      )}
                    </button>
                  </div>
                )}

              </form>
            </div>
          )}

          {/* VISTA: ESTUDIOS PENDIENTES */}
          {seccion === 'estudios-pendientes' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Bandeja de Estudios Pendientes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Seguimiento de exámenes por procesar o informar.</p>
                </div>
                
                <button 
                  onClick={() => cargarEstudiosPendientes(true)}
                  disabled={cargandoPendientes}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-60 select-none"
                >
                  <span className={`inline-block ${cargandoPendientes ? 'animate-spin' : ''}`}>🔄</span>
                  <span>{cargandoPendientes ? 'Actualizando...' : 'Actualizar'}</span>
                </button>
              </div>

              {pendientesFiltradosPorRol.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs">🎉 ¡Todo al día! No hay estudios pendientes.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendientesFiltradosPorRol.map((est) => {
                    const esInformeMedico = est.tipo_examen === 'Informe Médico';
                    
                    const esMiTurnoTecnico = (esTecnico || esSuperAdmin) && est.estado === 'pendiente_tecnico' && !esInformeMedico;
                    const esMiTurnoMedico = (esMedico || esSecretaria || esSuperAdmin);

                    return (
                      <div key={est.id} className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-100 text-red-800">
                              {est.tipo_examen}
                            </span>
                            
                            {!esInformeMedico && est.estado === 'pendiente_tecnico' && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                ⌛ Esperando Placas (Técnico)
                              </span>
                            )}
                            
                            {(est.estado === 'pendiente_medico' || esInformeMedico) && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                                🩺 Esperando Informe (Médico / Secretaría)
                              </span>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900">{est.titulo}</h4>
                          <p className="text-xs text-slate-600">Paciente: <strong>{est.paciente_nombre}</strong> (C.I: {est.paciente_cedula})</p>
                          <span className="text-[10px] text-slate-400">Fecha de orden: {new Date(est.fecha_estudio).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {esSecretaria && (
                            <button
                              onClick={() => handleCancelarOrdenPendiente(est.id)}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                              title="Cancelar esta orden"
                            >
                              🗑️ Cancelar
                            </button>
                          )}

                          {esMiTurnoTecnico && (
                            <button
                              onClick={() => {
                                const pacienteInfo = pacientes.find(p => p.id === est.paciente_id || p.cedula === est.paciente_cedula);
                                setPacienteSeleccionadoSubida({
                                  id: est.paciente_id,
                                  nombre_completo: est.paciente_nombre,
                                  cedula: est.paciente_cedula,
                                  correo: est.paciente_correo || est.correo || pacienteInfo?.correo || '',
                                  telefono: est.paciente_telefono || est.telefono || pacienteInfo?.telefono || ''
                                });
                                setTipoExamen(est.tipo_examen);
                                setTitulo(est.titulo);
                                setEstudioPendienteSeleccionado(est);
                                setArchivos([]);
                                setSeccion('subir-estudio');
                              }}
                              className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                            >
                              📸 Cargar Placas
                            </button>
                          )}

                          {esMiTurnoMedico && (
                            <button
                              onClick={() => {
                                const pacienteInfo = pacientes.find(p => p.id === est.paciente_id || p.cedula === est.paciente_cedula);
                                setPacienteSeleccionadoSubida({
                                  id: est.paciente_id,
                                  nombre_completo: est.paciente_nombre,
                                  cedula: est.paciente_cedula,
                                  correo: est.paciente_correo || est.correo || pacienteInfo?.correo || '',
                                  telefono: est.paciente_telefono || est.telefono || pacienteInfo?.telefono || ''
                                });
                                setTipoExamen('Informe Médico');
                                setTitulo(est.titulo);
                                setEstudioPendienteSeleccionado(est);
                                setArchivos([]);
                                setSeccion('subir-estudio');
                              }}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                            >
                              📝 Cargar Informe
                            </button>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VISTA: GESTIÓN DE USUARIOS */}
          {seccion === 'gestion-usuarios' && esSuperAdmin && (
            <div className="space-y-6">
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
                      <option value="tecnico_radiologico">Técnico Radiológico</option>
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

                              <button
                                type="button"
                                onClick={() => handleAbrirModalCambiarClave(u.id)}
                                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                title="Cambiar contraseña"
                              >
                                🔑
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEliminarUsuarioPersonal(u.id)}
                                className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                title="Eliminar usuario"
                              >
                                🗑️️
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
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 shrink-0">
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

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 shrink-0">
              Estudios e Historial Cargado
            </h4>

            {cargandoEstudios ? (
              <div className="py-8 text-center text-slate-400 flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-red-800 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs">Cargando expediente...</p>
              </div>
            ) : estudiosPaciente.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-6">Este paciente aún no tiene exámenes registrados.</p>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-1 flex-1">
                {estudiosPaciente.map(e => {
                  const archivosLista = e.archivo_path 
                    ? e.archivo_path.split(',').map(a => a.trim()).filter(Boolean) 
                    : [];

                  return (
                    <div key={e.id} className="p-3.5 border border-slate-200 bg-slate-50 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="inline-block px-2 py-0.5 text-[9px] font-bold text-red-800 bg-red-50 rounded mb-1">
                            {e.tipo_examen}
                          </span>
                          <h5 className="text-xs font-bold text-slate-800">{e.titulo}</h5>
                          <span className="text-[10px] text-slate-400">
                            {new Date(e.fecha_estudio).toLocaleDateString()}
                          </span>
                        </div>

                        {esSuperAdmin && (
                          <button 
                            onClick={() => handleEliminarEstudio(e.id)}
                            className="px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            title="Eliminar este estudio"
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      {esSecretaria && (
                        <div className="pt-2 border-t border-slate-200 flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Notificar:</span>
                          
                          <button
                            type="button"
                            onClick={() => handleNotificarCorreo(e.id, pacienteSeleccionado.correo)}
                            className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            📧 Correo
                          </button>

                          <button
                            type="button"
                            onClick={() => handleNotificarWhatsApp(
                              pacienteSeleccionado.nombre_completo,
                              pacienteSeleccionado.telefono,
                              pacienteSeleccionado.cedula,
                              e.titulo
                            )}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            💬 WhatsApp
                          </button>
                        </div>
                      )}

                      {archivosLista.length > 0 ? (
                        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Archivos del estudio:</p>
                          <div className="space-y-1">
                            {archivosLista.map((arch, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg text-xs">
                                <span className="truncate max-w-[200px] sm:max-w-[260px] text-slate-700 font-medium">
                                  📄 {arch}
                                </span>
                                <a 
                                  href={`/api/descargar-archivo/${encodeURIComponent(arch)}`} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-red-950 hover:bg-red-800 text-white text-[11px] font-semibold rounded-lg transition-colors inline-block shrink-0"
                                >
                                  Descargar
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic pt-1">Sin archivos adjuntos registrados.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL EDITAR PACIENTE */}
      {pacienteAEditar && esSecretaria && (
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
          onClick={() => cambiarSeccion('pacientes-lista')}
          className={`flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-colors ${
            seccion === 'pacientes-lista' ? 'text-red-900 font-bold' : 'text-slate-400'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-[10px]">Pacientes</span>
        </button>

        {esSecretaria && (
          <button
            onClick={() => cambiarSeccion('crear-paciente')}
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
          onClick={() => cambiarSeccion('subir-estudio')}
          className={`flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-colors ${
            seccion === 'subir-estudio' ? 'text-red-900 font-bold' : 'text-slate-400'
          }`}
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-[10px]">{getLabelSubirMobile()}</span>
        </button>

        <button
          onClick={() => cambiarSeccion('estudios-pendientes')}
          className={`relative flex flex-col items-center justify-center w-full py-1 cursor-pointer transition-colors ${
            seccion === 'estudios-pendientes' ? 'text-red-900 font-bold' : 'text-slate-400'
          }`}
        >
          {pendientesFiltradosPorRol.length > 0 && (
            <span className="absolute top-0 right-3 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {pendientesFiltradosPorRol.length}
            </span>
          )}
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px]">Pendientes</span>
        </button>

        {esSuperAdmin && (
          <button
            onClick={() => cambiarSeccion('gestion-usuarios')}
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
          onClick={handleCerrarSesion}
          className="flex flex-col items-center justify-center w-full py-1 text-red-500 cursor-pointer"
        >
          <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[10px]">Salir</span>
        </button>

      </div>

      {/* OVERLAY ANIMADO CON EL LOGO DE LA EMPRESA */}
      {cargandoEnvio && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[100] font-sans">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center max-w-sm w-full text-center border border-slate-100">
            
            <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-red-100 border-t-red-800 animate-spin"></div>
              <img 
                src="/logo.png" 
                alt="Logo Unidad de Imágenes" 
                className="w-20 h-20 object-contain animate-pulse drop-shadow-sm" 
              />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Unidad de Imágenes Del Este
            </h3>
            
            <p className="text-xs text-slate-600 font-medium leading-relaxed animate-pulse">
              {mensajeCargando}
            </p>

            <div className="mt-5 pt-4 border-t border-slate-100 w-full flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <span className="w-1.5 h-1.5 bg-red-800 rounded-full animate-ping"></span>
              Por favor, espere un momento...
            </div>
          </div>
        </div>
      )}

    </div>
  );
}