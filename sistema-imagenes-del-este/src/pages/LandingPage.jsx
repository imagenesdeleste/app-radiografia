import React, { useState } from 'react';

export default function LandingPage({ navegar }) {
  const [faqOpen, setFaqOpen] = useState(null);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-brand-50 text-brand-900 font-sans">
      
      {/* 1. HERO SECTION (Encabezado principal en Vino Oscuro) */}
      <section className="relative bg-brand-800 text-white py-20 px-6 lg:px-12 overflow-hidden shadow-xl">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <span className="inline-block bg-brand-400 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-sm">
              Tecnología de Punta
            </span>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
              Radiología Digital de <span className="text-brand-300">Alta Resolución</span>
            </h1>
            <p className="text-brand-100/90 text-lg leading-relaxed">
              Resultados precisos con hasta un 80% menos de radiación. Atención rápida e informes digitales al instante.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#servicios" 
                className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition duration-200 flex items-center gap-2"
              >
                Ver Estudios <i className="fa-solid fa-arrow-down text-sm"></i>
              </a>
              <a 
                href="#contacto" 
                className="bg-brand-900/40 hover:bg-brand-900/70 text-brand-50 border border-brand-400/40 font-semibold px-6 py-3.5 rounded-xl transition duration-200"
              >
                Agendar Cita
              </a>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="w-full h-80 bg-brand-900/50 rounded-3xl border border-brand-400/30 p-4 flex items-center justify-center shadow-2xl">
              <img 
                src="assets/portal-preview.jpeg" 
                alt="Radiología Digital" 
                className="rounded-2xl object-cover h-full w-full shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. PORTAL DE PACIENTES (Tarjeta Beige Claro estilo Post) */}
      <section className="py-16 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="bg-brand-100 border border-brand-200 rounded-3xl p-8 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-white bg-brand-400 px-3 py-1 rounded-md shadow-sm">
              ¡Reserva o Consulta Hoy!
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-600 tracking-tight">
              Consulta los resultados de tus <span className="text-brand-900">estudios</span>
            </h2>
            <p className="text-brand-900/80 leading-relaxed font-medium">
              Accede a tus imágenes e informes médicos desde cualquier dispositivo ingresando con tu número de cédula.
            </p>
          </div>

          <div className="bg-brand-50 p-6 rounded-2xl border border-brand-200 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto text-2xl border border-brand-200">
              <i className="fa-solid fa-file-medical"></i>
            </div>
            <h3 className="text-xl font-bold text-brand-900">¿Tienes un examen pendiente?</h3>
            <p className="text-sm text-brand-900/70">Ingresa a nuestra plataforma en un solo clic.</p>
            
            <button 
              type="button"
              onClick={() => navegar('/pacientes')} 
              className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-4 rounded-xl shadow-md transition duration-200 w-full cursor-pointer"
            >
              Ir al Portal de Pacientes <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* 3. SERVICIOS (Tarjetas Blancas sobre fondo Beige Hueso) */}
      <section id="servicios" className="py-16 px-6 lg:px-12 bg-brand-100/60 border-y border-brand-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-white bg-brand-600 px-3 py-1 rounded-full shadow-sm">
              Servicios Especializados
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-brand-900">Diagnóstico de Alta Precisión</h2>
            <p className="text-brand-900/70 font-medium">Equipos de vanguardia operados por especialistas capacitados.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Radiografía Digital */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-200 hover:shadow-md transition duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                  <i className="fa-solid fa-x-ray"></i>
                </div>
                <h3 className="text-xl font-bold text-brand-900">Radiografía Digital</h3>
                <p className="text-sm text-brand-900/75 leading-relaxed">Imágenes nítidas con mínima exposición a radiación. Proceso instantáneo y ecológico.</p>
              </div>
              <a 
                href="https://wa.me/584245715351?text=Hola,%20deseo%20agendar%20una%20Radiografia" 
                target="_blank" 
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold text-sm transition"
              >
                Agendar Radiografía <i className="fa-solid fa-arrow-right text-xs"></i>
              </a>
            </div>

            {/* Ecografías */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-200 hover:shadow-md transition duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                  <i className="fa-solid fa-wave-square"></i>
                </div>
                <h3 className="text-xl font-bold text-brand-900">Ecografías (Ultrasonido)</h3>
                <p className="text-sm text-brand-900/75 leading-relaxed">Evaluación anatómica en tiempo real no invasiva y totalmente libre de radiación.</p>
              </div>
              <a 
                href="https://wa.me/584245715351?text=Hola,%20deseo%20agendar%20una%20Ecografia" 
                target="_blank" 
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold text-sm transition"
              >
                Agendar Ecografía <i className="fa-solid fa-arrow-right text-xs"></i>
              </a>
            </div>

            {/* Rayos X Especializados */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-200 hover:shadow-md transition duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-brand-600 text-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                  <i className="fa-solid fa-bone"></i>
                </div>
                <h3 className="text-xl font-bold text-brand-900">Rayos X Especializados</h3>
                <p className="text-sm text-brand-900/75 leading-relaxed">Exámenes focalizados para la detección rápida de afecciones articulares o preoperatorias.</p>
              </div>
              <a 
                href="https://wa.me/584245715351?text=Hola,%20deseo%20agendar%20Rayos%20X" 
                target="_blank" 
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold text-sm transition"
              >
                Agendar Rayos X <i className="fa-solid fa-arrow-right text-xs"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PREGUNTAS FRECUENTES */}
      <section className="py-16 px-6 lg:px-12 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600 bg-brand-100 px-3 py-1 rounded-full border border-brand-200">
            Dudas Frecuentes
          </span>
          <h2 className="text-3xl font-extrabold text-brand-900">Información para Pacientes</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: "¿Cómo descargo mis estudios?", a: "Solo debes ingresar al Portal de Pacientes con tu número de cédula y clave registrada para obtener tu reporte e imágenes." },
            { q: "¿Cuánto tardan en entregar los resultados?", a: "Las imágenes digitales están disponibles de inmediato en la plataforma. El informe firmado por el especialista tarda entre 24 a 48 horas." },
            { q: "¿Necesito cita previa para una radiografía?", a: "Atendemos por orden de llegada para estudios simples, y con cita previa asignada para tomografías o ecografías especializadas." }
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-xl border border-brand-200 overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full text-left p-5 font-bold text-brand-900 flex justify-between items-center hover:bg-brand-50 transition"
              >
                <span>{item.q}</span>
                <i className={`fa-solid fa-chevron-down text-brand-600 transition-transform ${faqOpen === index ? 'rotate-180' : ''}`}></i>
              </button>
              {faqOpen === index && (
                <div className="p-5 pt-0 text-sm text-brand-900/80 border-t border-brand-100 bg-brand-50/50 leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. FOOTER & UBICACIÓN (Fondo Oscuro de Contraste) */}
      <section id="contacto" className="py-16 px-6 lg:px-12 bg-brand-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-100 bg-brand-800 px-3 py-1 rounded-full border border-brand-600/50">
              Ubicación & Contacto
            </span>
            <h2 className="text-3xl font-bold">Unidad de Imágenes Del Este</h2>
            <p className="text-brand-100/80 text-sm leading-relaxed">Estamos a tu disposición para ofrecerte diagnósticos oportunos y confiables.</p>
            
            <ul className="space-y-4 text-sm text-brand-100/90">
              <li className="flex items-center gap-3"><i className="fa-solid fa-location-dot text-brand-400"></i> Este de Barquisimeto, Estado Lara</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-phone text-brand-400"></i> +58 424-571.53.51</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-envelope text-brand-400"></i> unidaddeimagenesdeleste@gmail.com</li>
              <li className="flex items-center gap-3"><i className="fa-solid fa-clock text-brand-400"></i> Lunes a Viernes: 8:00 AM - 6:00 PM, Sábados y domingos te atienden emerencias</li>
            </ul>
          </div>

          <div className="bg-brand-800 p-8 rounded-2xl border border-brand-700 flex flex-col justify-center text-center space-y-4 shadow-lg">
            <h3 className="text-xl font-bold text-white">Agenda tu Cita Directa</h3>
            <p className="text-brand-200 text-sm">Comunícate por WhatsApp con nuestro personal médico.</p>
            <a 
              href="https://wa.me/584245715351" 
              target="_blank" 
              rel="noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <i className="fa-brands fa-whatsapp text-lg"></i> Chatear por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* BOTÓN FLOTANTE DE WHATSAPP */}
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