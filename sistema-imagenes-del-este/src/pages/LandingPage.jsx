import React, { useState, useEffect } from 'react';

export default function LandingPage({ navegar }) {
  const [faqOpen, setFaqOpen] = useState(null);
  const [menuMovil, setMenuMovil] = useState(false);

  // 1. Estado para el Header Transparente -> Sólido al hacer Scroll
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Diapositivas para el Hero Carousel (3 Presentaciones)
  const slides = [
    {
      badge: "Tecnología de Punta",
      title: "Radiología Digital de ",
      highlight: "Alta Resolución",
      desc: "Imágenes de máxima precisión con hasta un 80% menos de radiación. Diagnósticos eficientes e informes digitales en minutos.",
      btnText: "Ver Servicios",
      btnLink: "#servicios",
      icon: "fa-x-ray",
      img: "assets/portal-preview.jpeg"
    },
    {
      badge: "Diagnóstico Inocuo",
      title: "Ecografías y Doppler ",
      highlight: "en Tiempo Real",
      desc: "Evaluación anatómica completa, no invasiva y totalmente libre de radiación. Atendido por personal médico calificado.",
      btnText: "Agendar Cita",
      btnLink: "https://wa.me/584245715351?text=Hola,%20deseo%20agendar%20una%20ecografia",
      icon: "fa-wave-square",
      img: "assets/portal-preview.jpeg"
    },
    {
      badge: "Plataforma Digital 24/7",
      title: "Resultados Médicos a un ",
      highlight: "Solo Clic",
      desc: "Ingresa con tu número de cédula para consultar, ver e imprimir tus informes y estudios desde la comodidad de tu hogar.",
      btnText: "Ir al Portal",
      isPortalBtn: true,
      icon: "fa-file-medical",
      img: "assets/portal-preview.jpeg"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play del Carousel cada 6 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-brand-50 text-brand-900 font-sans flex flex-col justify-between selection:bg-brand-400 selection:text-white">
      
      {/* ========================================== */}
      {/* 1. HEADER DINÁMICO (TRANSPARENTE / SÓLIDO) */}
      {/* ========================================== */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-brand-900/95 backdrop-blur-md shadow-lg border-b border-brand-800 py-3' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#inicio" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105 brightness-0 invert" 
            />
            <span className="hidden sm:inline-block font-black text-sm tracking-tight text-white uppercase">
              Unidad de Imágenes <span className="text-brand-300">Del Este</span>
            </span>
          </a>

          {/* Menú Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-brand-100">
            <a href="#inicio" className="hover:text-brand-300 transition-colors">Inicio</a>
            <a href="#servicios" className="hover:text-brand-300 transition-colors">Exámenes</a>
            <a href="#nosotros" className="hover:text-brand-300 transition-colors">Nosotros</a>
            <a href="#faq" className="hover:text-brand-300 transition-colors">Preguntas</a>
            <a href="#contacto" className="hover:text-brand-300 transition-colors">Contacto</a>
          </nav>

          {/* Botón CTA Header */}
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

          {/* Hamburguesa Móvil */}
          <button 
            onClick={() => setMenuMovil(!menuMovil)} 
            className="md:hidden text-white text-xl p-2 rounded-lg focus:outline-none"
            aria-label="Abrir menú"
          >
            <i className={`fa-solid ${menuMovil ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Desplegable Móvil */}
        {menuMovil && (
          <div className="md:hidden bg-brand-900 border-b border-brand-800 px-6 py-4 space-y-3 mt-3">
            <a href="#inicio" onClick={() => setMenuMovil(false)} className="block text-xs font-bold uppercase text-white py-1">Inicio</a>
            <a href="#servicios" onClick={() => setMenuMovil(false)} className="block text-xs font-bold uppercase text-white py-1">Exámenes</a>
            <a href="#nosotros" onClick={() => setMenuMovil(false)} className="block text-xs font-bold uppercase text-white py-1">Nosotros</a>
            <a href="#faq" onClick={() => setMenuMovil(false)} className="block text-xs font-bold uppercase text-white py-1">Preguntas</a>
            <a href="#contacto" onClick={() => setMenuMovil(false)} className="block text-xs font-bold uppercase text-white py-1">Contacto</a>
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
        {/* 2. HERO FULL SCREEN CAROUSEL (3 SLIDES)     */}
        {/* ========================================== */}
        <section id="inicio" className="relative min-h-screen bg-brand-900 text-white flex items-center pt-24 pb-16 px-6 lg:px-12 overflow-hidden shadow-2xl">
          
          {/* Fondo Decorativo de Oscuridad */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-950 opacity-90 z-0"></div>

          <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 min-h-[500px]">
            
            {/* Contenido de la Diapositiva */}
            <div className="space-y-6 text-center lg:text-left transition-all duration-500 transform">
              <span className="inline-block bg-brand-400 text-white text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md animate-fade-in">
                {slides[currentSlide].badge}
              </span>
              
              <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight text-white">
                {slides[currentSlide].title}
                <span className="text-brand-300 block sm:inline">{slides[currentSlide].highlight}</span>
              </h1>
              
              <p className="text-brand-100/90 text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                {slides[currentSlide].desc}
              </p>

              {/* Botones Interactivos */}
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

            {/* Vista Previa / Tarjeta Ilustrativa */}
            <div className="hidden lg:flex justify-center items-center">
              <div className="relative w-full max-w-md bg-brand-950/80 p-6 rounded-3xl border border-brand-700/60 shadow-2xl backdrop-blur-sm">
                <div className="w-16 h-16 bg-brand-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-md">
                  <i className={`fa-solid ${slides[currentSlide].icon}`}></i>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-white uppercase tracking-wide">Unidad de Imágenes</h3>
                  <p className="text-xs text-brand-200">Barquisimeto, Estado Lara</p>
                  <div className="pt-4 border-t border-brand-800/80">
                    <span className="text-[11px] font-semibold text-brand-300 bg-brand-900 px-3 py-1 rounded-full border border-brand-700">
                      Servicio Rápido y Garantizado
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Controles e Indicadores del Carousel */}
          <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-8 bg-brand-300' : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Diapositiva ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 3. BANNER CONSULTA POR CÉDULA              */}
        {/* ========================================== */}
        <section className="py-12 px-6 lg:px-12 max-w-6xl mx-auto -mt-10 relative z-30">
          <div className="bg-brand-100 border border-brand-200 rounded-3xl p-6 lg:p-10 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-white bg-brand-400 px-3 py-1 rounded-md shadow-sm">
                Servicio en Línea
              </span>
              <h2 className="text-2xl lg:text-3xl font-black text-brand-900 tracking-tight">
                ¿Consultar o descargar tus exámenes?
              </h2>
              <p className="text-xs lg:text-sm text-brand-800 font-medium">
                Accede a la plataforma web ingresando con tu número de cédula.
              </p>
            </div>

            <div className="flex justify-center md:justify-end">
              <button 
                type="button"
                onClick={() => navegar('/pacientes')} 
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold px-8 py-4 rounded-xl shadow-md transition duration-200 cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Ingresar Cédula <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 4. SECCIÓN DE EXÁMENES Y SERVICIOS          */}
        {/* ========================================== */}
        <section id="servicios" className="py-16 px-6 lg:px-12 bg-brand-100/50 border-y border-brand-200">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-white bg-brand-600 px-3 py-1 rounded-full shadow-sm">
                Nuestras Especialidades
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-brand-900">Estudios de Alta Precisión</h2>
              <p className="text-brand-800 font-medium text-sm">Equipos digitales operados por especialistas capacitados.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Radiografía */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-brand-200 hover:shadow-md transition duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                    <i className="fa-solid fa-x-ray"></i>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">Radiografía Digital</h3>
                  <p className="text-xs text-brand-800/80 leading-relaxed">
                    Captura instantánea de alta resolución con dosis de radiación reducidas. Entrega digital inmediata.
                  </p>
                </div>
                <a 
                  href="https://wa.me/584245715351?text=Hola,%20deseo%20agendar%20una%20Radiografia" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold text-xs transition"
                >
                  Consultar Disponibilidad <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </a>
              </div>

              {/* Ecografías */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-brand-200 hover:shadow-md transition duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                    <i className="fa-solid fa-wave-square"></i>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">Ecografías (Ultrasonido)</h3>
                  <p className="text-xs text-brand-800/80 leading-relaxed">
                    Evaluaciones abdominales, pélvicas, renales y Doppler en tiempo real, totalmente inocuas.
                  </p>
                </div>
                <a 
                  href="https://wa.me/584245715351?text=Hola,%20deseo%20agendar%20una%20Ecografia" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold text-xs transition"
                >
                  Consultar Disponibilidad <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </a>
              </div>

              {/* Rayos X Especiales */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-brand-200 hover:shadow-md transition duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                    <i className="fa-solid fa-bone"></i>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">Rayos X Especializados</h3>
                  <p className="text-xs text-brand-800/80 leading-relaxed">
                    Estudios articulares, traumatológicos y preoperatorios con nitidez quirúrgica.
                  </p>
                </div>
                <a 
                  href="https://wa.me/584245715351?text=Hola,%20deseo%20agendar%20Rayos%20X" 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold text-xs transition"
                >
                  Consultar Disponibilidad <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================== */}
        {/* 5. NOSOTROS / POR QUÉ ELEGIRNOS            */}
        {/* ========================================== */}
        <section id="nosotros" className="py-16 px-6 lg:px-12 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
                Compromiso y Calidad
              </span>
              <h2 className="text-3xl font-black text-brand-900">
                Atención médica humana con respuesta inmediata
              </h2>
              <p className="text-xs lg:text-sm text-brand-800/90 leading-relaxed">
                Nos enfocamos en ofrecer un servicio rápido y confiable. Eliminamos las demoras entregando tus informes directamente a tu dispositivo móvil o computadora.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-900">Informes Médicos Firmados</h4>
                    <p className="text-[11px] text-brand-800/70">Avalados por especialistas en radiodiagnóstico.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-900">Ubicación Céntrica</h4>
                    <p className="text-[11px] text-brand-800/70">Barquisimeto - Fácil acceso y estacionamiento.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-100 border border-brand-200 p-8 rounded-3xl text-center space-y-4 shadow-sm">
              <h3 className="text-xl font-black text-brand-900">¿Atención Corporativa?</h3>
              <p className="text-xs text-brand-800 leading-relaxed">
                Planes de evaluaciones médicas masivas para empresas y centros de salud aliados.
              </p>
              <a 
                href="https://wa.me/584245715351?text=Hola,%20quisiera%20informacion%20sobre%20servicio%20corporativo" 
                target="_blank" 
                rel="noreferrer"
                className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow transition"
              >
                Contactar a Coordinación
              </a>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 6. PREGUNTAS FRECUENTES                    */}
        {/* ========================================== */}
        <section id="faq" className="py-16 px-6 lg:px-12 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
              Resuelve tus Dudas
            </span>
            <h2 className="text-3xl font-black text-brand-900">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "¿Cómo descargo mis estudios en la página web?", a: "Ingresa al 'Portal Pacientes', coloca tu número de cédula y la clave asignada en recepción para visualizar o descargar tus archivos." },
              { q: "¿Cuánto tardan en estar listos los resultados?", a: "Las imágenes digitales están disponibles casi de inmediato. El informe firmado por el médico especialista tarda entre 24 a 48 horas." },
              { q: "¿Atienden por orden de llegada o cita previa?", a: "Para radiografías atendemos por orden de llegada. Para ecografías recomendamos agendar previamente vía WhatsApp." }
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
      {/* 7. FOOTER ESTILO LABORATORIO ONG           */}
      {/* ========================================== */}
      <footer id="contacto" className="bg-brand-600 text-white pt-14 pb-6 border-t border-brand-700 shadow-inner">
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
                <i className="fa-solid fa-location-dot text-brand-300"></i> Barquisimeto, Venezuela
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
            <a href="#servicios" className="hover:text-white transition">Exámenes</a>
            <button onClick={() => navegar('/pacientes')} className="hover:text-white transition cursor-pointer">
              Registrarse / Consultar
            </button>
            <button onClick={() => navegar('/personal')} className="hover:text-white transition cursor-pointer">
              Acceso Personal
            </button>
            <a href="https://wa.me/584245715351" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Servicio Corporativo
            </a>
          </div>

        </div>

        {/* PIE DE PÁGINA */}
        <div className="border-t border-brand-700/60 pt-6 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <a 
            href="https://wa.me/584245715351?text=Hola,%20deseo%20pagar%20mi%20estudio%20con%20Cashea" 
            target="_blank" 
            rel="noreferrer"
            className="bg-black hover:bg-zinc-900 text-white font-bold py-2.5 px-5 rounded-full flex items-center gap-2.5 shadow-lg transition transform active:scale-95"
          >
            <span className="w-5 h-5 bg-[#DFFF00] text-black font-black rounded-full flex items-center justify-center text-[10px]">
              c
            </span>
            <span>Pagar con Cashea</span>
          </a>

          <div className="text-center md:text-right text-[11px] text-brand-200/90 leading-relaxed">
            <p>© 2026 Unidad de Imágenes Del Este, C.A.</p>
            <p className="font-bold text-white">Powered by Axell Peraza</p>
          </div>
        </div>
      </footer>

      {/* BOTÓN WHATSAPP */}
      <a 
        href="https://wa.me/584245715351" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center text-2xl transition hover:scale-110 z-50"
      >
        <i className="fa-brands fa-whatsapp"></i>
      </a>

    </div>
  );
}