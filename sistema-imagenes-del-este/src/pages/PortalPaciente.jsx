import React, { useState } from 'react';

export default function PortalPaciente() {
  const [cedula, setCedula] = useState('');
  const [clave, setClave] = useState('');
  const [datosPaciente, setDatosPaciente] = useState(null);
  const [estudios, setEstudios] = useState([]);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('https://app-radiografia-production.up.railway.app/api/paciente/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula, clave })
      });

      const data = await res.json();

      if (res.ok) {
        setDatosPaciente(data.paciente);
        setEstudios(data.estudios);
      } else {
        setError(data.error || 'Cédula o contraseña incorrectas');
      }
    } catch {
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between items-center p-4 font-sans">
      
      {/* HEADER CON LOGO PNG */}
    <header className="w-full max-w-sm pt-8 pb-4 flex flex-col items-center">
      <div className="w-100 h-50 mb-3 flex items-center justify-center">
        <img 
          src="/logo.png" 
          alt="Logo Unidad de Imágenes" 
          className="w-full h-full object-contain drop-shadow-sm" 
        />
      </div>
      {/*<h1 className="text-xl font-bold tracking-tight text-slate-900">Unidad de Imágenes del Este</h1>*/}
      <p className="text-xs text-slate-400 uppercase tracking-widest mt-0.5">Portal del Paciente</p>
    </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="w-full max-w-sm my-auto">
        {!datosPaciente ? (
          
          /* TARJETA DE LOGIN ESTILO INSTAGRAM */
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              
              {error && (
                <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl text-center font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cédula / Identificación</label>
                <input 
                  type="text" 
                  placeholder="Ingrese su cédula" 
                  value={cedula}
                  onChange={e => setCedula(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Contraseña</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={clave}
                  onChange={e => setClave(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 px-4 bg-red-900 hover:bg-red-600 active:scale-[0.98] text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-lg shadow-slate-900/10 cursor-pointer"
              >
                Consultar Resultados
              </button>
            </form>
          </div>

          

        ) : (

          /* PERFIL DEL PACIENTE Y EXÁMENES ESTILO STORIES/FEED */
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xl shadow-slate-200/40">
            
            {/* Header Perfil Paciente */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 p-[2px]">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-sky-600 text-sm">
                    {datosPaciente.nombre_completo.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{datosPaciente.nombre_completo}</h3>
                  <p className="text-xs text-slate-400">V-{datosPaciente.cedula}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setDatosPaciente(null)} 
                className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1"
              >
                Salir
              </button>
            </div>

            {/* Listado de Exámenes */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Estudios disponibles ({estudios.length})</h4>

            {estudios.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-6">No hay resultados disponibles en este momento.</p>
            ) : (
              <div className="space-y-3">
                {estudios.map(e => (
                  <div key={e.id} className="p-3.5 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center justify-between hover:border-slate-200 transition-all">
                    <div className="pr-2">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-sky-600 bg-sky-50 rounded-md mb-1">
                        {e.tipo_examen}
                      </span>
                      <h5 className="text-xs font-semibold text-slate-800 leading-tight">{e.titulo}</h5>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{new Date(e.fecha_estudio).toLocaleDateString()}</span>
                    </div>

                    <a 
                    href={`https://app-radiografia-production.up.railway.app/api/descargar/${e.id}`} 
                    download
                    className="px-3.5 py-2 bg-slate-900 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Descargar</span>
                  </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* BOTÓN FLOTANTE WHATSAPP - ÁREA PACIENTE */}
<a
  href={`https://wa.me/584245715351?text=${encodeURIComponent(
    `Hola, soy ${pacienteLogueado?.nombre_completo || 'Paciente'} (C.I: ${pacienteLogueado?.cedula || ''}) y necesito ayuda con mis resultados médicos.`
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="fixed bottom-6 right-6 z-50 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold transition-all transform hover:scale-105 active:scale-95 border-2 border-white"
>
  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
  </svg>
  <span>¿Necesitas ayuda?</span>
</a>

      {/* FOOTER DISCRETO */}
      <footer className="py-4 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} Unidad de imagenes del Este - By Axell Peraza
      </footer>
    </div>
  );
}