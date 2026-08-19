import React, { useState } from 'react';

export default function LandingPage({ navegar }) {
  const [faqOpen, setFaqOpen] = useState(null);
  const [menuMovil, setMenuMovil] = useState(false);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-brand-50 text-brand-900 font-sans flex flex-col justify-between selection:bg-brand-400 selection:text-white">
      
      {/* ========================================== */}
      {/* 1. HEADER / NAVBAR STICKY                 */}
      {/* ========================================== */}
      <header className="sticky top-0 z-50 bg-brand-50/90 backdrop-blur-md border-b border-brand-200 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          
          {/* Logo y Nombre Marca */}
          <a href="#inicio" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Logo Unidad de Imágenes" 
              className="h-11 w-auto object-contain transition-transform group-hover:scale-105" 
            />
            <span className="hidden sm:inline-block font-black text-sm tracking-tight text-brand-900 uppercase">
              Unidad de Imágenes <span className="text-brand-600">Del Este</span>
            </span>
          </a>

          {/* Menú Desktop */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-brand-800">
            <a href="#inicio" className="hover:text-brand-600 transition-colors">Inicio</a>
            <a href="#servicios" className="hover:text-brand-600 transition-colors">Exámenes</a>
            <a href="#nosotros" className="hover:text-brand-600 transition-colors">Nosotros</a>
            <a href="#faq" className="hover:text-brand-600 transition-colors">Preguntas</a>
            <a href="#contacto" className="hover:text-brand-600 transition-colors">Contacto</a>
          </nav>

          {/* Botón CTA Directo al Portal */}
          <div className="hidden md:flex items-center gap-3">
            <button
              type="button"
              onClick={() => navegar('/pacientes')}
              className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition duration-200 cursor-pointer flex items-center gap-2"
            >
              <i className="fa-solid fa-file-medical text-xs"></i>
              Portal Pacientes
            </button>
          </div>

          {/* Botón Menú Móvil */}
          <button 
            onClick={() => setMenuMovil(!menuMovil)} 
            className="md:hidden text-brand-900 text-xl p-2 rounded-lg hover:bg-brand-100 focus:outline-none"
            aria-label="Abrir menú"
          >
            <i className={`fa-solid ${menuMovil ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>

        {/* Desplegable Móvil */}
        {menuMovil && (
          <div className="md:hidden bg-brand-100 border-b border-brand-200 px-6 py-4 space-y-3">
            <a 
              href="#inicio" 
              onClick={() => setMenuMovil(false)}
              className="block text-xs font-bold uppercase text-brand-900 py-1 hover:text-brand-600"
            >
              Inicio
            </a>
            <a 
              href="#servicios" 
              onClick={() => setMenuMovil(false)}
              className="block text-xs font-bold uppercase text-brand-900 py-1 hover:text-brand-600"
            >
              Exámenes y Estudios
            </a>
            <a 
              href="#nosotros" 
              onClick={() => setMenuMovil(false)}
              className="block text-xs font-bold uppercase text-brand-900 py-1 hover:text-brand-600"
            >
              Por Qué Elegirnos
            </a>
            <a 
              href="#faq" 
              onClick={() => setMenuMovil(false)}
              className="block text-xs font-bold uppercase text-brand-900 py-1 hover:text-brand-600"
            >
              Preguntas Frecuentes
            </a>
            <a 
              href="#contacto" 
              onClick={() => setMenuMovil(false)}
              className="block text-xs font-bold uppercase text-brand-900 py-1 hover:text-brand-600"
            >
              Ubicación y Citas
            </a>
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
        {/* 2. HERO PRINCIPAL ESTILO CLINICO           */}
        {/* ========================================== */}
        <section id="inicio" className="relative bg-brand-800 text-white py-16 lg:py-24 px-6 lg:px-12 overflow-hidden shadow-xl">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="space-y-6 text-center lg:text-left">
              <span className="inline-block bg-brand-400 text-white text-xs font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
                Diagnósticos Médicos Confiables
              </span>
              <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
                Imágenes Médicas de <span className="text-brand-300">Alta Resolución</span>
              </h1>
              <p className="text-brand-100/90 text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                Tecnología digital avanzada con máxima nitidez y hasta 80% menos radiación. Obtén tus resultados e informes en línea de manera rápida y segura.
              </p>

              {/* Botones de Acción */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
                <button 
                  onClick={() => navegar('/pacientes')} 
                  className="bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fa-solid fa-download text-sm"></i> Descargar Resultados
                </button>
                <a 
                  href="https://wa.me/584245715351?text=Hola,%20quisiera%20agendar%20una%20cita%20para%20un%20estudio" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-brand-900/60 hover:bg-brand-900 text-brand-50 border border-brand-400/40 font-bold px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp text-emerald-400 text-base"></i> Agendar por WhatsApp
                </a>
              </div>

              {/* Badges de Confianza */}
              <div className="pt-6 border-t border-brand-700/60 grid grid-cols-3 gap-4 text-center">
                <div>
                  <h4 className="text-xl font-black text-white">80%</h4>
                  <p className="text-[11px] text-brand-200">Menos Radiación</p>
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">100%</h4>
                  <p className="text-[11px] text-brand-200">Entrega Digital</p>
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">24/7</h4>
                  <p className="text-[11px] text-brand-200">Acceso en Web</p>
                </div>
              </div>
            </div>

            {/* Vista Previa de la Plataforma */}
            <div className="hidden lg:block">
              <div className="relative mx-auto max-w-md bg-brand-900/80 p-4 rounded-3xl border border-brand-700/60 shadow-2xl">
                <div className="bg-brand-100 rounded-2xl p-6 text-brand-900 space-y-4 shadow-inner">
                  <div className="flex items-center gap-3 pb-3 border-b border-brand-200">
                    <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">
                      <i className="fa-solid fa-x-ray"></i>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase">Portal Digital Activo</h4>
                      <p className="text-[10px] text-brand-800/70">Unidad de Imágenes Del Este</p>
                    </div>
                  </div>
                  <p className="text-xs text-brand-900/80 leading-normal">
                    Ingresa con tu cédula para consultar o descargar ecografías, radiografías e informes médicos firmados.
                  </p>
                  <button 
                    onClick={() => navegar('/pacientes')}
                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
                  >
                    Ingresar al Sistema
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================== */}
        {/* 3. BANNER DESTACADO PORTAL PACIENTES       */}
        {/* ========================================== */}
        <section className="py-12 px-6 lg:px-12 max-w-6xl mx-auto -mt-8 relative z-20">
          <div className="bg-brand-100 border border-brand-200 rounded-3xl p-6 lg:p-10 shadow-lg grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-white bg-brand-400 px-3 py-1 rounded-md shadow-sm">
                Servicio Online
              </span>
              <h2 className="text-2xl lg:text-3xl font-black text-brand-900 tracking-tight">
                ¿Te realizaste un estudio recientemente?
              </h2>
              <p className="text-xs lg:text-sm text-brand-800 font-medium">
                Consulta y descarga tus resultados directamente desde la comodidad de tu hogar.
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
        {/* 4. SECCIÓN DE SERVICIOS / EXÁMENES          */}
        {/* ========================================== */}
        <section id="servicios" className="py-16 px-6 lg:px-12 bg-brand-100/50 border-y border-brand-200">
          <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold uppercase tracking-widest text-white bg-brand-600 px-3 py-1 rounded-full shadow-sm">
                Catálogo de Servicios
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-brand-900">Estudios Radiológicos Especializados</h2>
              <p className="text-brand-800 font-medium text-sm">Contamos con personal médico calificado para diagnósticos precisos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Radiografía Digital */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-brand-200 hover:shadow-md transition duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                    <i className="fa-solid fa-x-ray"></i>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">Radiografía Digital</h3>
                  <p className="text-xs text-brand-800/80 leading-relaxed">
                    Captura instantánea de alta resolución. Proceso ecológico sin químicos y menor exposición radiológica.
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

              {/* Ecografía */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-brand-200 hover:shadow-md transition duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                    <i className="fa-solid fa-wave-square"></i>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">Ecografías (Ultrasonido)</h3>
                  <p className="text-xs text-brand-800/80 leading-relaxed">
                    Evaluaciones abdominales, pélvicas, partes blandas y Doppler en tiempo real, totalmente inocuas.
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

              {/* Rayos X Especializados */}
              <div className="bg-white rounded-2xl p-7 shadow-sm border border-brand-200 hover:shadow-md transition duration-300 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                    <i className="fa-solid fa-bone"></i>
                  </div>
                  <h3 className="text-lg font-bold text-brand-900">Rayos X Especializados</h3>
                  <p className="text-xs text-brand-800/80 leading-relaxed">
                    Estudios preoperatorios, óseos y articulares con procesamiento de imagen digitalizado.
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
        {/* 5. SECCIÓN POR QUÉ ELEGIRNOS               */}
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
                Nos enfocamos en brindar un servicio cálido y eficiente. Eliminamos los tiempos de espera innecesarios entregando tus estudios directamente a tu teléfono o computadora.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-900">Entrega de Informe Firmado</h4>
                    <p className="text-[11px] text-brand-800/70">Avalado por médicos radiólogos especialistas.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 flex items-center justify-center shrink-0 font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-brand-900">Ubicación Céntrica en Barquisimeto</h4>
                    <p className="text-[11px] text-brand-800/70">Fácil acceso y estacionamiento seguro.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-100 border border-brand-200 p-8 rounded-3xl text-center space-y-4 shadow-sm">
              <h3 className="text-xl font-black text-brand-900">¿Atención Corporativa o Convenios?</h3>
              <p className="text-xs text-brand-800 leading-relaxed">
                Ofrecemos planes de evaluaciones médicas e imágenes para empresas y centros de salud aliados.
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
            <h2 className="text-3xl font-black text-brand-900">Información al Paciente</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "¿Cómo descargo mis estudios en la página web?", a: "Haz clic en el botón 'Portal Pacientes', ingresa tu número de cédula y la contraseña asignada en recepción para ver tus archivos." },
              { q: "¿Cuánto tiempo tardan en estar listos los resultados?", a: "Las imágenes digitales están disponibles casi de inmediato en la plataforma. El informe firmado tarda entre 24 a 48 horas hábiles." },
              { q: "¿Atienden por orden de llegada o cita previa?", a: "Para radiografías simples atendemos por orden de llegada. Para ecografías recomendemos coordinar hora previa vía WhatsApp." }
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
      {/* 7. FOOTER EXACTO ESTILO LABORATORIO ONG    */}
      {/* ========================================== */}
      <footer id="contacto" className="bg-brand-600 text-white pt-14 pb-6 border-t border-brand-700 shadow-inner">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left items-start pb-12">
          
          {/* COLUMNA 1: LOGO, SLOGAN Y CONTACTO */}
          <div className="flex flex-col items-center md:items-start space-y-5">
            {/* Logo */}
            <div className="w-48 h-auto flex justify-center md:justify-start">
              <img 
                src="/logo.png" 
                alt="Unidad de Imágenes Del Este" 
                className="w-full h-full object-contain brightness-0 invert drop-shadow-sm" 
              />
            </div>

            {/* Slogan */}
            <p className="text-xs font-bold tracking-tight text-brand-100 italic">
              "El Centro de Imágenes de los Barquisimetanos"
            </p>

            {/* Datos de Contacto */}
            <div className="space-y-2 pt-2 text-xs font-medium text-brand-100/90">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2">Contacto</h4>
              
              <p className="flex items-center justify-center md:justify-start gap-2">
                <i className="fa-solid fa-location-dot text-brand-300"></i>
                Barquisimeto, Venezuela
              </p>
              
              <p className="flex items-center justify-center md:justify-start gap-2">
                <i className="fa-solid fa-phone text-brand-300"></i>
                +58 424-5715351
              </p>
              
              <p className="flex items-center justify-center md:justify-start gap-2">
                <i className="fa-solid fa-envelope text-brand-300"></i>
                centrodeimagenesdeleste@gmail.com
              </p>
            </div>
          </div>

          {/* COLUMNA 2: REDES SOCIALES */}
          <div className="flex flex-col items-center space-y-4 md:pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Síguenos</h4>
            
            <div className="flex items-center justify-center gap-3">
              <a 
                href="https://instagram.com/imagenesdeleste_bqto" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-brand-600 text-white flex items-center justify-center text-lg transition-all duration-200 shadow-sm"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>

              <a 
                href="#facebook" 
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-brand-600 text-white flex items-center justify-center text-lg transition-all duration-200 shadow-sm"
                aria-label="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>

              <a 
                href="https://wa.me/584245715351" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white hover:text-brand-600 text-white flex items-center justify-center text-lg transition-all duration-200 shadow-sm"
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* COLUMNA 3: SERVICIOS */}
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

        {/* BARRA INFERIOR CON CASHEA Y COPYRIGHT */}
        <div className="border-t border-brand-700/60 pt-6 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          
          {/* Botón Cashea */}
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

          {/* Firma */}
          <div className="text-center md:text-right text-[11px] text-brand-200/90 leading-relaxed">
            <p>© 2026 Unidad de Imágenes Del Este, C.A.</p>
            <p className="font-bold text-white">Powered by Axell Peraza</p>
          </div>

        </div>
      </footer>

      {/* BOTÓN FLOTANTE WHATSAPP */}
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