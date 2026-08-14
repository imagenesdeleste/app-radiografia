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

      {/* FOOTER DISCRETO */}
      <footer className="py-4 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} Unidad de imagenes del Este - By Axell Peraza
      </footer>
    </div>
  );
}