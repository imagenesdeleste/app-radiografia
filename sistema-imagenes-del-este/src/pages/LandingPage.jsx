import React, { useState, useEffect } from 'react';

export default function LandingPage({ navegar }) {
  const [faqOpen, setFaqOpen] = useState(null);
  const [menuMovil, setMenuMovil] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Estado Formulario de Contacto
  const [formContacto, setFormContacto] = useState({
    nombre: '',
    cedula: '',
    telefono: '',
    correo: '',
    mensaje: ''
  });
  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  // Detectar scroll para navbar dinámico
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Diapositivas para el Hero
  const slides = [
    {
      badge: "Tecnología de Punta",
      title: "Radiología Digital de ",
      highlight: "Alta Resolución",
      desc: "Imágenes de máxima precisión con dosis mínimas de radiación. Diagnósticos eficientes e informes digitales.",
      btnText: "Ver Equipos",
      btnLink: "#equipos",
      icon: "fa-x-ray"
    },
    {
      badge: "Tomografía Multicorte",
      title: "Tomografía Axial ",
      highlight: "3D de Alta Precisión",
      desc: "Estudios tomográficos detallados para reconstrucciones anatómicas de alta calidad en tiempo récord.",
      btnText: "Ver Tomógrafo",
      btnLink: "#tomografo",
      icon: "fa-circle-dot"
    },
    {
      badge: "Plataforma Digital 24/7",
      title: "Consulta tus Resultados ",
      highlight: "en Línea",
      desc: "Ingresa con tu número de cédula para ver, descargar o imprimir tus exámenes médicos sin salir de casa.",
      btnText: "Ir al Portal",
      isPortalBtn: true,
      icon: "fa-file-medical"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // Envío de Formulario
  const handleEnviarContacto = (e) => {
    e.preventDefault();
    // Aquí puedes enlazar EmailJS o enviar a tu API/backend
    setMensajeEnviado(true);
    setTimeout(() => {
      setMensajeEnviado(false);
      setFormContacto({ nombre: '', cedula: '', telefono: '', correo: '', mensaje: '' });
    }, 4000);
  };

  // Publicaciones de Instagram Mockups (@imagenesdeleste_bqto)
  const instagramPosts = [
    {
      id: 1,
      titulo: "Tomografía Multicorte disponible de Lunes a Sábado",
      tag: "#TomografiaBQTO",
      likes: "142",
      img: "assets/portal-preview.jpeg",
      link: "https://instagram.com/imagenesdeleste_bqto"
    },
    {
      id: 2,
      titulo: "Ecografía Pélvica y Abdominal con diagnósticos al instante",
      tag: "#EcografiaLara",
      likes: "98",
      img: "assets/portal-preview.jpeg",
      link: "https://instagram.com/imagenesdeleste_bqto"
    },
    {
      id: 3,
      titulo: "Radiología digital: menor radiación y máxima nitidez",
      tag: "#SaludBarquisimeto",
      likes: "210",
      img: "assets/portal-preview.jpeg",
      link: "https://instagram.com/imagenesdeleste_bqto"
    }
  ];

  // Personal / Equipo Médico
  const equipoMedico = [
    {
      nombre: "Dra. María Fernández",
      cargo: "Especialista en Radiodiagnóstico",
      exp: "15+ años de experiencia",
      img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop"
    },
    {
      nombre: "Dr. Carlos Mendoza",
      cargo: "Especialista en Tomografía y Resonancia",
      exp: "12+ años de experiencia",
      img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop"
    },
    {
      nombre: "Licd. Roberto Silva",
      cargo: "Técnico Superior en Radiología",
      exp: "10+ años de experiencia",
      img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-brand-50 text-brand-900 font-sans flex flex-col justify-between selection:bg-brand-400 selection:text-white">
      
      {/* ========================================== */}
      {/* 1. HEADER DINÁMICO                         */}
      {/* ========================================== */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-brand-900/95 backdrop-blur-md shadow-lg border-b border-brand-800 py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          
          <a href="#inicio" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105 " 
            />
          </a>

          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-brand-100">
            <a href="#inicio" className="hover:text-brand-300 transition-colors">Inicio</a>
            <a href="#equipos" className="hover:text-brand-300 transition-colors">Tecnología</a>
            <a href="#personal" className="hover:text-brand-300 transition-colors">Personal</a>
            <a href="#instagram" className="hover:text-brand-300 transition-colors">Instagram</a>
            <a href="#contacto" className="hover:text-brand-300 transition-colors">Ubicación</a>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => navegar('/pacientes')}
              className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition duration-200 cursor-pointer flex items-center gap-2 border border-brand-400/30"
            >
              <i className="fa-solid fa-file-medical text-xs"></i>
              Portal Pacientes
            </button>
          </div>

          <button 
            onClick={() => setMenuMovil(!menuMovil)} 
            className="md:hidden text-white text-xl p-2 rounded-lg focus:outline-none"
            aria-label="Abrir menú"
          >
            <i className={`fa-solid ${menuMovil ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>

        {menuMovil && (
          <div className="md:hidden bg-brand-900 border-b border-brand-800 px-6 py-4 space-y-3 mt-3">
            <a href="#inicio" onClick={() => setMenuMovil(false)} className="block text-xs font-bold uppercase text-white py-1">Inicio</a>
            <a href="#equipos" onClick={() => setMenuMovil(false)} className="block text-xs font-bold uppercase text-white py-1">Tecnología</a>
            <a href="#personal" onClick={() => setMenuMovil(false)} className="block text-xs font-bold uppercase text-white py-1">Personal</a>
            <a href="#instagram" onClick={() => setMenuMovil(false)} className="block text-xs font-bold uppercase text-white py-1">Instagram</a>
            <a href="#contacto" onClick={() => setMenuMovil(false)} className="block text-xs font-bold uppercase text-white py-1">Ubicación y Contacto</a>
            <button
              type="button"
              onClick={() => { setMenuMovil(false); navegar('/pacientes'); }}
              className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-3 rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-file-medical"></i>
              Consultar Resultados
            </button>
          </div>
        )}
      </header>

      <main>
        
        {/* ========================================== */}
        {/* 2. HERO FULL SCREEN CAROUSEL               */}
        {/* ========================================== */}
        <section id="inicio" className="relative min-h-screen bg-brand-900 text-white flex items-center pt-24 pb-16 px-6 lg:px-12 overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 opacity-90 z-0"></div>

          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 min-h-[500px]">
            <div className="space-y-6 text-center lg:text-left transition-all duration-500">
              <span className="inline-block bg-brand-400 text-white text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                {slides[currentSlide].badge}
              </span>
              
              <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight text-white">
                {slides[currentSlide].title}
                <span className="text-brand-300 block sm:inline">{slides[currentSlide].highlight}</span>
              </h1>
              
              <p className="text-brand-100/90 text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                {slides[currentSlide].desc}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                {slides[currentSlide].isPortalBtn ? (
                  <button 
                    onClick={() => navegar('/pacientes')} 
                    className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fa-solid fa-user-check"></i> {slides[currentSlide].btnText}
                  </button>
                ) : (
                  <a 
                    href={slides[currentSlide].btnLink} 
                    className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {slides[currentSlide].btnText} <i className="fa-solid fa-arrow-right text-sm"></i>
                  </a>
                )}

                <a 
                  href="https://wa.me/584245715351" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp text-emerald-400 text-lg"></i> Contactar Asesor
                </a>
              </div>
            </div>

            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-full max-w-md bg-brand-950/80 p-6 rounded-3xl border border-brand-700/60 shadow-2xl backdrop-blur-sm">
                <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-md">
                  <i className={`fa-solid ${slides[currentSlide].icon}`}></i>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wide">Unidad de Imágenes</h3>
                  <p className="text-xs text-brand-200">Calle 8 entre Carreras 21 y 22, Barquisimeto</p>
                  <div className="pt-4 border-t border-brand-800/80">
                    <span className="text-[11px] font-semibold text-brand-300 bg-brand-900 px-3 py-1 rounded-full border border-brand-700">
                      Respuesta Rápida y Garantizada
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? 'w-8 bg-brand-300' : 'w-2.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </section>

        {/* BANNER CONSULTA */}
        <section className="py-10 px-6 lg:px-12 max-w-6xl mx-auto -mt-10 relative z-30">
          <div className="bg-brand-100 border border-brand-200 rounded-3xl p-6 lg:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-white bg-brand-400 px-3 py-1 rounded-md">
                Resultados en Línea
              </span>
              <h2 className="text-xl lg:text-2xl font-black text-brand-900">
                ¿Buscas tus exámenes o informe médico?
              </h2>
              <p className="text-xs text-brand-800">Accede con tu número de cédula en cualquier momento.</p>
            </div>
            <button 
              type="button"
              onClick={() => navegar('/pacientes')} 
              className="w-full md:w-auto bg-brand-600 hover:bg-brand-700 text-white font-bold px-7 py-3.5 rounded-xl shadow-md transition text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
            >
              Consultar por Cédula <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </section>

        {/* ========================================== */}
        {/* 3. EQUIPOS MÉDICOS DESTACADOS (ZIG-ZAG)    */}
        {/* ========================================== */}
        <section id="equipos" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto space-y-24">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white bg-brand-600 px-3 py-1 rounded-full">
              Equipamiento de Vanguardia
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-brand-900">Tecnología Especializada a tu Servicio</h2>
            <p className="text-xs lg:text-sm text-brand-800">Ofrecemos estudios con nitidez absoluta y máxima confiabilidad diagnóstica.</p>
          </div>

          {/* ITEM 1: TOMÓGRAFO (Imagen Izquierda, Texto Derecha) */}
          <div id="tomografo" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-brand-200 group">
              <img 
                src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&auto=format&fit=crop" 
                alt="Tomógrafo Computarizado" 
                className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-brand-950/20"></div>
              <span className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-md shadow">
                Tomografía Multicorte
              </span>
            </div>

            <div className="space-y-5">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center text-2xl font-bold border border-brand-200">
                <i className="fa-solid fa-circle-dot"></i>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-brand-900">
                Tomógrafo Computarizado de Alta Precisión
              </h3>
              <p className="text-xs lg:text-sm text-brand-800 leading-relaxed">
                Contamos con un **Tomógrafo Multicorte de última generación**, diseñado para adquirir imágenes volumétricas tridimensionales en cuestión de segundos. Este equipo permite realizar reconstrucciones complejas óseas, cerebrales, torácicas y abdominales con un nivel de detalle milimétrico.
              </p>
              <ul className="space-y-2 text-xs font-bold text-brand-900">
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-brand-600"></i> Adquisición ultrarrápida de cortes volumétricos</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-brand-600"></i> Reconstrucciones 3D de alta definición</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-brand-600"></i> Protocolos de baja dosis de radiación</li>
              </ul>
              <a 
                href="https://wa.me/584245715351?text=Hola,%20deseo%20agendar%20una%20Tomografia" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow transition"
              >
                Agendar Tomografía <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

          {/* ITEM 2: RADIOGRAFÍA (Texto Izquierda, Imagen Derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5 lg:order-1 order-2">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center text-2xl font-bold border border-brand-200">
                <i className="fa-solid fa-x-ray"></i>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-brand-900">
                Radiografía Digital Directa
              </h3>
              <p className="text-xs lg:text-sm text-brand-800 leading-relaxed">
                Nuestro sistema de **Rayos X Digitalizado** reemplaza las placas tradicionales por sensores de alta sensibilidad. Esto nos permite procesar las placas de forma instantánea en monitores médicos diagnósticos, ajustando contrastes para revelar fracturas, patologías pulmonares o lesiones articulares imperceptibles en impresiones convencionales.
              </p>
              <ul className="space-y-2 text-xs font-bold text-brand-900">
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-brand-600"></i> Reducción de radiación hasta en un 80%</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-brand-600"></i> Procesamiento y entrega digital inmediata</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-brand-600"></i> Compatible con formatos médicos DICOM</li>
              </ul>
              <a 
                href="https://wa.me/584245715351?text=Hola,%20deseo%20agendar%20Radiografia" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow transition"
              >
                Agendar Radiografía <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-brand-200 group lg:order-2 order-1">
              <img 
                src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=800&auto=format&fit=crop" 
                alt="Radiografía Digital" 
                className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-brand-950/20"></div>
              <span className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-md shadow">
                Radiología Digital
              </span>
            </div>
          </div>

          {/* ITEM 3: ECOGRAFÍA (Imagen Izquierda, Texto Derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-brand-200 group">
              <img 
                src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=800&auto=format&fit=crop" 
                alt="Ecografía y Ultrasonido" 
                className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-brand-950/20"></div>
              <span className="absolute top-4 left-4 bg-brand-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-md shadow">
                Ultrasonido Doppler
              </span>
            </div>

            <div className="space-y-5">
              <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center text-2xl font-bold border border-brand-200">
                <i className="fa-solid fa-wave-square"></i>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-brand-900">
                Ecografía General y Doppler Color
              </h3>
              <p className="text-xs lg:text-sm text-brand-800 leading-relaxed">
                Disponemos de **ecógrafos con traductores multifrecuencia** y módulo Doppler Color para estudios abdominales, pélvicos, renales, obstétricos, tiroideos y de partes blandas. Un procedimiento totalmente indoloro, inocuo y sin emisión de radiación ionizante.
              </p>
              <ul className="space-y-2 text-xs font-bold text-brand-900">
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-brand-600"></i> Evaluación vascular Doppler en tiempo real</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-brand-600"></i> Diagnóstico de partes blandas y articulaciones</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-brand-600"></i> Informe fotográfico de alta definición</li>
              </ul>
              <a 
                href="https://wa.me/584245715351?text=Hola,%20deseo%20agendar%20Ecografia" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow transition"
              >
                Agendar Ecografía <i className="fa-solid fa-arrow-right"></i>
              </a>
            </div>
          </div>

        </section>

        {/* ========================================== */}
        {/* 4. PERSONAL Y EQUIPO MÉDICO                */}
        {/* ========================================== */}
        <section id="personal" className="py-20 px-6 lg:px-12 bg-brand-100/60 border-y border-brand-200">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-white bg-brand-600 px-3 py-1 rounded-full">
                Especialistas Calificados
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-brand-900">Nuestro Personal Médico</h2>
              <p className="text-xs lg:text-sm text-brand-800">Profesionales comprometidos con el diagnóstico certero y el trato humano.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {equipoMedico.map((medico, idx) => (
                <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-brand-200 text-center space-y-4 hover:shadow-md transition">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-brand-200 shadow-md">
                    <img src={medico.img} alt={medico.nombre} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-900">{medico.nombre}</h3>
                    <p className="text-xs text-brand-600 font-bold mt-0.5">{medico.cargo}</p>
                    <span className="inline-block mt-2 text-[10px] font-semibold text-brand-800 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                      {medico.exp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================== */}
        {/* 5. INSTAGRAM FEED EMBED / MOSTRADOR         */}
        {/* ========================================== */}
        <section id="instagram" className="py-20 px-6 lg:px-12 max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-white bg-brand-600 px-3 py-1 rounded-full">
              Comunidad en Vivo
            </span>
            <h2 className="text-3xl font-black text-brand-900">Síguenos en Instagram</h2>
            <p className="text-xs lg:text-sm text-brand-800">
              Mantente informado con nuestras publicaciones diarias en <strong className="text-brand-600">@imagenesdeleste_bqto</strong>
            </p>
          </div>

          {/* Grid de Publicaciones Instagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instagramPosts.map((post) => (
              <a 
                key={post.id} 
                href={post.link} 
                target="_blank" 
                rel="noreferrer" 
                className="bg-white rounded-2xl overflow-hidden border border-brand-200 shadow-sm hover:shadow-lg transition group"
              >
                <div className="relative h-60 overflow-hidden bg-brand-900">
                  <img src={post.img} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-90" />
                  <div className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full text-xs backdrop-blur-sm">
                    <i className="fa-brands fa-instagram"></i>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-extrabold text-brand-600 uppercase tracking-wider block">{post.tag}</span>
                  <p className="text-xs font-bold text-brand-900 line-clamp-2">{post.titulo}</p>
                  <div className="pt-2 flex items-center justify-between text-[11px] text-brand-800/70 border-t border-brand-100">
                    <span className="flex items-center gap-1 font-semibold"><i className="fa-solid fa-heart text-rose-500"></i> {post.likes} me gusta</span>
                    <span className="font-bold text-brand-600 group-hover:underline">Ver en IG →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="text-center">
            <a 
              href="https://instagram.com/imagenesdeleste_bqto" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs px-8 py-3.5 rounded-full shadow-lg hover:opacity-90 transition"
            >
              <i className="fa-brands fa-instagram text-base"></i> Ver perfil @imagenesdeleste_bqto
            </a>
          </div>
        </section>

        {/* ========================================== */}
        {/* 6. CONTACTO CON FORMULARIO Y MAPA C8       */}
        {/* ========================================== */}
        <section id="contacto" className="py-20 px-6 lg:px-12 bg-brand-900 text-white">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Formulario que llega al Correo */}
            <div className="bg-brand-950 p-8 rounded-3xl border border-brand-800 shadow-xl space-y-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-brand-600 text-white px-3 py-1 rounded-md">
                  Mensaje Directo
                </span>
                <h3 className="text-2xl font-black text-white mt-2">Envíanos una Consulta</h3>
                <p className="text-xs text-brand-200 mt-1">Completa tus datos y nos pondremos en contacto vía correo o teléfono.</p>
              </div>

              {mensajeEnviado && (
                <div className="p-3 bg-emerald-900/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl font-bold text-center">
                  ¡Mensaje enviado con éxito! Te responderemos muy pronto.
                </div>
              )}

              <form onSubmit={handleEnviarContacto} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-200 mb-1">Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ej: Juan Pérez" 
                    value={formContacto.nombre}
                    onChange={e => setFormContacto({...formContacto, nombre: e.target.value})}
                    className="w-full px-4 py-2.5 text-xs bg-brand-900 border border-brand-700 rounded-xl text-white focus:outline-none focus:border-brand-400 placeholder:text-brand-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-200 mb-1">Cédula / DNI</label>
                    <input 
                      type="text" 
                      placeholder="Ej: 15420980" 
                      value={formContacto.cedula}
                      onChange={e => setFormContacto({...formContacto, cedula: e.target.value})}
                      className="w-full px-4 py-2.5 text-xs bg-brand-900 border border-brand-700 rounded-xl text-white focus:outline-none focus:border-brand-400 placeholder:text-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-200 mb-1">Teléfono</label>
                    <input 
                      type="text" 
                      placeholder="0412-1234567" 
                      value={formContacto.telefono}
                      onChange={e => setFormContacto({...formContacto, telefono: e.target.value})}
                      className="w-full px-4 py-2.5 text-xs bg-brand-900 border border-brand-700 rounded-xl text-white focus:outline-none focus:border-brand-400 placeholder:text-brand-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-200 mb-1">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="ejemplo@correo.com" 
                    value={formContacto.correo}
                    onChange={e => setFormContacto({...formContacto, correo: e.target.value})}
                    className="w-full px-4 py-2.5 text-xs bg-brand-900 border border-brand-700 rounded-xl text-white focus:outline-none focus:border-brand-400 placeholder:text-brand-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-brand-200 mb-1">Estudio de Interés o Mensaje</label>
                  <textarea 
                    rows="3" 
                    placeholder="Escribe tu consulta o examen que necesitas..." 
                    value={formContacto.mensaje}
                    onChange={e => setFormContacto({...formContacto, mensaje: e.target.value})}
                    className="w-full px-4 py-2.5 text-xs bg-brand-900 border border-brand-700 rounded-xl text-white focus:outline-none focus:border-brand-400 placeholder:text-brand-500 resize-none"
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
                >
                  Enviar al Correo Médico
                </button>
              </form>
            </div>

            {/* Ubicación y Mapa Exacto Calle 8 */}
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-brand-800 text-brand-200 px-3 py-1 rounded-md border border-brand-700">
                  Ubicación Exacta
                </span>
                <h3 className="text-2xl font-black text-white mt-2">Visítanos en Nuestra Sede</h3>
                <p className="text-xs text-brand-200 mt-1">
                  <strong>Dirección:</strong> Calle 8 entre Carreras 21 y 22, Barquisimeto, Edo. Lara.
                </p>
              </div>

              {/* Mapa de Google Maps Incrustado */}
              <div className="w-full h-80 rounded-3xl overflow-hidden border-2 border-brand-700 shadow-2xl">
                <iframe 
                  title="Mapa Unidad de Imagenes del Este"
                  src="https://maps.google.com/maps?q=Calle%208%20entre%20carreras%2021%20y%2022%20Barquisimeto%20Lara&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                  className="w-full h-full border-0" 
                  allowFullScreen="" 
                  loading="lazy"
                ></iframe>
              </div>

              <div className="p-4 bg-brand-950/60 rounded-2xl border border-brand-800/80 flex items-center justify-between text-xs text-brand-200">
                <span className="flex items-center gap-2"><i className="fa-solid fa-clock text-brand-400"></i> Lunes a Sábado: 8:00 AM - 6:00 PM</span>
                <a href="https://wa.me/584245715351" target="_blank" rel="noreferrer" className="text-emerald-400 font-bold hover:underline">
                  Ver indicaciones →
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================== */}
        {/* 7. PREGUNTAS FRECUENTES                    */}
        {/* ========================================== */}
        <section id="faq" className="py-20 px-6 lg:px-12 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
              Resuelve tus Dudas
            </span>
            <h2 className="text-3xl font-black text-brand-900">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "¿Cómo descargo mis estudios en la página web?", a: "Ingresa al 'Portal Pacientes', coloca tu número de cédula y la clave asignada en recepción para ver o descargar tus archivos." },
              { q: "¿Cuánto tardan en estar listos los resultados?", a: "Las imágenes digitales se suben casi de inmediato. El informe firmado por el médico radiólogo tarda entre 24 a 48 horas hábiles." },
              { q: "¿Atienden por orden de llegada o cita previa?", a: "Para radiografías atendemos por orden de llegada. Para tomografías y ecografías recomendamos agendar previa cita vía WhatsApp." }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl border border-brand-200 overflow-hidden shadow-sm">
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-5 font-bold text-xs lg:text-sm text-brand-900 flex justify-between items-center hover:bg-brand-50 transition cursor-pointer"
                >
                  <span>{item.q}</span>
                  <i className={`fa-solid fa-chevron-down text-brand-600 transition-transform ${faqOpen === index ? 'rotate-180' : ''}`}></i>
                </button>
                {faqOpen === index && (
                  <div className="p-5 pt-0 text-xs text-brand-800/80 border-t border-brand-100 bg-brand-50/50 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ========================================== */}
      {/* 8. FOOTER          */}
      {/* ========================================== */}
      <footer id="contacto-footer" className="bg-brand-600 text-white pt-14 pb-6 border-t border-brand-700 shadow-inner">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left items-start pb-12">
          
          {/* COLUMNA 1 */}
          <div className="flex flex-col items-center md:items-start space-y-5">
            <div className="w-48 h-auto flex justify-center md:justify-start">
              <img 
                src="/logo.png" 
                alt="Unidad de Imágenes Del Este" 
                className="w-full h-full object-contain brightness-0 invert drop-shadow-sm" 
              />
            </div>

            <p className="text-xs font-bold tracking-tight text-brand-100 italic">
              "El Centro de Imágenes de los Barquisimetanos"
            </p>

            <div className="space-y-2 pt-2 text-xs font-medium text-brand-100/90">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Contacto</h4>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <i className="fa-solid fa-location-dot text-brand-300"></i> Calle 8 entre Carreras 21 y 22, Bqto.
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <i className="fa-solid fa-phone text-brand-300"></i> +58 424-5715351
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <i className="fa-solid fa-envelope text-brand-300"></i> centrodeimagenesdeleste@gmail.com
              </p>
            </div>
          </div>

          {/* COLUMNA 2 */}
          <div className="flex flex-col items-center space-y-4 md:pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Síguenos</h4>
            <div className="flex items-center justify-center gap-3">
              <a 
                href="https://instagram.com/imagenesdeleste_bqto" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-brand-600 text-white flex items-center justify-center text-lg transition-all shadow-sm"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a 
                href="#facebook" 
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-brand-600 text-white flex items-center justify-center text-lg transition-all shadow-sm"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a 
                href="https://wa.me/584245715351" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-brand-600 text-white flex items-center justify-center text-lg transition-all shadow-sm"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* COLUMNA 3 */}
          <div className="flex flex-col items-center md:items-end space-y-2.5 md:pt-4 text-xs font-semibold text-brand-100/90">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-1">Servicios</h4>
            <a href="#equipos" className="hover:text-white transition">Tecnología Médica</a>
            <button onClick={() => navegar('/pacientes')} className="hover:text-white transition cursor-pointer">
              Portal de Pacientes
            </button>
            <button onClick={() => navegar('/personal')} className="hover:text-white transition cursor-pointer">
              Acceso Personal
            </button>
            <a href="https://wa.me/584245715351" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Atención Corporativa
            </a>
          </div>

        </div>

        {/* SUB-FOOTER */}
        <div className="border-t border-brand-700/60 pt-6 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          

          <div className="text-center md:text-right text-[11px] text-brand-200/90 leading-relaxed">
            <p>© 2026 Unidad de Imágenes Del Este, C.A.</p>
            <p className="font-bold text-white">Powered by Axell Peraza</p>
          </div>
        </div>
      </footer>

      {/* ========================================== */}
      {/* BOTÓN FLOTANTE CASHEA (IZQUIERDA)          */}
      {/* ========================================== */}
      <a 
        href="https://wa.me/584245715351?text=Hola,%20quisiera%20pagar%20mi%20estudio%20con%20Cashea" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 left-6 z-50 bg-black hover:bg-zinc-900 text-white font-bold py-2.5 px-4 rounded-full shadow-2xl flex items-center gap-2.5 border border-zinc-700 transition hover:scale-105 active:scale-95 cursor-pointer group"
      >
        {/* Logo Oficial de Cashea */}
        <div className="w-6 h-6 rounded-full bg-[#DFFF00] flex items-center justify-center overflow-hidden p-0.5">
          <img 
            src="https://www.cashea.app/favicon.ico" 
            alt="Cashea Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <span className="text-xs font-bold pr-1">Pagar con Cashea</span>
      </a>

      {/* ========================================== */}
      {/* BOTÓN FLOTANTE WHATSAPP (DERECHA)          */}
      {/* ========================================== */}
      <a 
        href="https://wa.me/584245715351" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Contactar por WhatsApp"
      >
        <i className="fa-brands fa-whatsapp"></i>
      </a>

    </div>
  );
}

     
  