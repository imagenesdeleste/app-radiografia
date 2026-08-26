import express from 'express';
import cors from 'cors';
import pg from 'pg';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Resend } from 'resend';

dotenv.config();

const app = express();

// =============================================================
// 1. MIDDLEWARES Y CONFIGURACIÓN INICIAL
// =============================================================
app.use(cors({
  origin: ['https://www.unidaddeimagenesdeleste.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Path ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Conexión a la base de datos PostgreSQL en Railway
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

export default pool;

// =============================================================
// 2. RUTA ABSOLUTA DE ARCHIVOS Y CONFIGURACIÓN DE MULTER
// =============================================================
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Servir la carpeta estática públicamente
app.use('/uploads', express.static(uploadDir));

// MULTER: Reemplaza espacios por guiones bajos SIN agregar timestamps o prefijos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const nombreLimpio = file.originalname.replace(/\s+/g, '_');
    cb(null, nombreLimpio);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 } // Límite de 200MB
});

// =============================================================
// 3. RESEND Y SERVICIO DE CORREO
// =============================================================
const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarCorreoPaciente = async (
  correoPaciente,
  nombrePaciente,
  tipoExamen = 'Estudio',
  tituloEstudio = 'Radiografía'
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Unidad de Imágenes Del Este <notificaciones@unidaddeimagenesdeleste.com>',
      to: [correoPaciente],
      reply_to: 'sistemaunidaddeimagenes@gmail.com',
      subject: `¡Tus resultados de ${tipoExamen} están listos!`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; background-color: #F9F6F0; padding: 25px; border-radius: 16px;">
          <div style="background-color: #ffffff; border: 1px solid #EFE9E0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            
            <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #EFE9E0;">
              <img 
                src="https://www.unidaddeimagenesdeleste.com/logo.png" 
                alt="Unidad de Imágenes Del Este" 
                style="max-width: 170px; height: auto; display: block; margin: 0 auto 12px auto;" 
              />
              <span style="font-size: 10px; font-weight: 800; color: #7A2328; text-transform: uppercase; letter-spacing: 1.5px; display: block;">
                Unidad De Imágenes Del Este
              </span>
            </div>

            <h2 style="color: #2D2423; font-size: 20px; margin-top: 0; margin-bottom: 12px; font-weight: 800;">
              ¡Hola, <span style="color: #7A2328;">${nombrePaciente}</span>!
            </h2>

            <p style="font-size: 14px; color: #3D1C1E; line-height: 1.6; margin-bottom: 20px;">
              Te informamos que tu ${tituloEstudio} ha sido procesado exitosamente por nuestro equipo especialista y ya se encuentra disponible en nuestro portal web.
            </p>

            <div style="background-color: #F9F6F0; border-left: 4px solid #7A2328; padding: 16px 20px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0; font-size: 13px; color: #2D2423; font-weight: 600;">
                <strong style="color: #7A2328;">Estudio:</strong> ${tituloEstudio}
              </p>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #2D2423; font-weight: 600;">
                <strong style="color: #7A2328;">Tipo de Examen:</strong> ${tipoExamen}
              </p>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #16a34a; font-weight: 700;">
                ● Disponible para consulta y descarga
              </p>
            </div>

            <p style="font-size: 15px; color: #611B1E; line-height: 1.5; text-align: center; margin-bottom: 0; font-weight: 500;">
              Para acceder, tu contraseña<strong> ES el NÚMERO DE CÉDULA REGISTRADO</strong> en nuestro sistema .
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a 
                href="https://www.unidaddeimagenesdeleste.com/pacientes" 
                style="background-color: #7A2328; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(122, 35, 40, 0.25);"
              >
                Consultar Mis Resultados →
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #EFE9E0; margin: 25px 0 20px 0;" />

            <div style="text-align: center; font-size: 11px; color: #3D1C1E; line-height: 1.6;">
              <p style="margin: 0; font-weight: 700; color: #7A2328;">Unidad de Imágenes Del Este, C.A.</p>
              <p style="margin: 2px 0 0 0; color: #611B1E;">Calle 8 entre Carreras 21 y 22, Barquisimeto, Edo. Lara</p>
              <p style="margin: 2px 0 0 0; color: #611B1E;">Contacto / WhatsApp: +58 424-5715351</p>
            </div>

          </div>

          <div style="text-align: center; margin-top: 15px;">
            <p style="font-size: 10px; color: #994E4A; margin: 0;">
              Este es un correo automático del sistema de notificación médica. Por favor no respondas a esta dirección.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Error devuelto por Resend:', error.message);
      return false;
    }

    console.log('✅ Correo enviado exitosamente. ID:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Error con Resend:', error.message);
    return false;
  }
};

// =============================================================
// 4. RUTAS DE LA API
// =============================================================

// Inicializar base de datos
app.get('/init-db', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id SERIAL PRIMARY KEY,
        cedula VARCHAR(20) UNIQUE NOT NULL,
        nombre_completo VARCHAR(150) NOT NULL,
        telefono VARCHAR(20),
        correo VARCHAR(150),
        clave VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS personal (
        id SERIAL PRIMARY KEY,
        cedula VARCHAR(20) UNIQUE NOT NULL,
        nombre_completo VARCHAR(150) NOT NULL,
        clave VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'tecnico',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS estudios (
        id SERIAL PRIMARY KEY,
        paciente_id INT REFERENCES pacientes(id) ON DELETE CASCADE,
        tipo_examen VARCHAR(50) NOT NULL,
        titulo VARCHAR(150) NOT NULL,
        archivo_path TEXT,
        estado VARCHAR(50) DEFAULT 'pendiente_tecnico',
        fecha_estudio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    res.send("Base de datos e historial médico listos");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PACIENTES ---

// Registrar paciente y orden opcional
app.post('/api/pacientes', async (req, res) => {
  try {
    const { cedula, nombre_completo, telefono, correo, clave, crear_orden, tipo_examen, titulo } = req.body;

    if (!cedula || !nombre_completo || !clave) {
      return res.status(400).json({ error: 'Cédula, nombre y contraseña son obligatorios' });
    }

    const resultPaciente = await pool.query(
      'INSERT INTO pacientes (cedula, nombre_completo, telefono, correo, clave) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [cedula, nombre_completo, telefono, correo, clave]
    );

    const pacienteId = resultPaciente.rows[0].id;

    if (crear_orden && titulo) {
      await pool.query(
        'INSERT INTO estudios (paciente_id, tipo_examen, titulo, fecha_estudio, estado) VALUES ($1, $2, $3, NOW(), $4)',
        [pacienteId, tipo_examen || 'Informe Médico', titulo, 'pendiente_tecnico']
      );
    }

    res.json({ mensaje: 'Paciente registrado correctamente' });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    res.status(500).json({ error: 'Error en base de datos: ' + error.message });
  }
});

// Obtener pacientes
app.get('/api/pacientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, cedula, nombre_completo, correo, telefono FROM pacientes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar paciente
app.put('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cedula, nombre_completo, telefono, correo, clave } = req.body;

    if (clave && clave.trim() !== '') {
      await pool.query(
        'UPDATE pacientes SET cedula = $1, nombre_completo = $2, telefono = $3, correo = $4, clave = $5 WHERE id = $6',
        [cedula, nombre_completo, telefono, correo, clave, id]
      );
    } else {
      await pool.query(
        'UPDATE pacientes SET cedula = $1, nombre_completo = $2, telefono = $3, correo = $4 WHERE id = $5',
        [cedula, nombre_completo, telefono, correo, id]
      );
    }

    res.json({ mensaje: 'Paciente actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
});

// Eliminar paciente
app.delete('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM estudios WHERE paciente_id = $1', [id]);
    await pool.query('DELETE FROM pacientes WHERE id = $1', [id]);
    res.json({ mensaje: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el paciente' });
  }
});

// --- PERSONAL ADMINISTRATIVO ---

// Obtener usuarios del personal
app.get('/api/admin/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, cedula, nombre_completo, rol FROM personal ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Crear usuario del personal
app.post('/api/admin/usuarios', async (req, res) => {
  try {
    const { cedula, nombre_completo, clave, rol } = req.body;

    if (!cedula || !nombre_completo || !clave) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const usuarioExiste = await pool.query('SELECT id FROM personal WHERE cedula = $1', [cedula]);
    if (usuarioExiste.rows.length > 0) {
      return res.status(400).json({ error: 'Esa cédula ya pertenece a un usuario registrado' });
    }

    await pool.query(
      'INSERT INTO personal (cedula, nombre_completo, clave, rol) VALUES ($1, $2, $3, $4)',
      [cedula, nombre_completo, clave, rol || 'tecnico']
    );

    res.json({ mensaje: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error en base de datos: ' + error.message });
  }
});

// Actualizar rol
app.put('/api/admin/usuarios/:id/rol', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    await pool.query('UPDATE personal SET rol = $1 WHERE id = $2', [rol, id]);
    res.json({ mensaje: 'Rol actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ error: 'Error al actualizar el rol' });
  }
});

// Actualizar contraseña de personal
app.put('/api/admin/usuarios/:id/clave', async (req, res) => {
  try {
    const { id } = req.params;
    const { clave } = req.body;

    if (!clave || clave.trim() === '') {
      return res.status(400).json({ error: 'La nueva contraseña no puede estar vacía' });
    }

    await pool.query('UPDATE personal SET clave = $1 WHERE id = $2', [clave.trim(), id]);
    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ error: 'Error al actualizar la contraseña' });
  }
});

// Eliminar usuario de personal
app.delete('/api/admin/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM personal WHERE id = $1', [id]);
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

// Login de personal
app.post('/api/admin/login', async (req, res) => {
  const { cedula, clave } = req.body;

  const cedulaLimpia = String(cedula).trim();
  const claveLimpia = String(clave).trim();

  try {
    const result = await pool.query(
      'SELECT id, cedula, nombre_completo, rol FROM personal WHERE TRIM(cedula) = $1 AND TRIM(clave) = $2',
      [cedulaLimpia, claveLimpia]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({ mensaje: 'Login exitoso', usuario: result.rows[0] });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- GESTIÓN DE ESTUDIOS Y ÓRDENES ---

// Subir estudio directo (Soporta múltiples archivos guardando la lista concatenada por comas)
app.post('/api/estudios', upload.array('archivos'), async (req, res) => {
  const { paciente_id, tipo_examen, titulo, notificar_correo } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Debes adjuntar al menos un archivo' });
  }

  try {
    // Guarda los nombres limpios separados por coma en la misma columna archivo_path
    const rutas = req.files.map(f => f.filename).join(',');

    const result = await pool.query(
      `INSERT INTO estudios (paciente_id, tipo_examen, titulo, archivo_path, estado) 
       VALUES ($1, $2, $3, $4, 'completado') RETURNING *`,
      [paciente_id, tipo_examen, titulo, rutas]
    );

    res.json({ mensaje: 'Estudios cargados correctamente', estudio: result.rows[0] });

    const debeNotificar = String(notificar_correo) === 'true' || notificar_correo === true;

    if (debeNotificar) {
      const pacienteQuery = await pool.query(
        'SELECT nombre_completo, correo FROM pacientes WHERE id = $1',
        [paciente_id]
      );

      if (pacienteQuery.rows.length > 0) {
        const paciente = pacienteQuery.rows[0];
        if (paciente.correo && paciente.correo.trim() !== '') {
          try {
            await enviarCorreoPaciente(
              paciente.correo,
              paciente.nombre_completo,
              tipo_examen || 'Radiografía',
              titulo || 'Nuevo Estudio de Imagen'
            );
          } catch (emailErr) {
            console.error('❌ Error enviando correo:', emailErr.message);
          }
        }
      }
    }

  } catch (err) {
    console.error('🔥 Error al registrar estudio:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Obtener ordenes / estudios pendientes
app.get('/api/estudios/pendientes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.tipo_examen, e.titulo, e.fecha_estudio, e.estado, e.archivo_path,
             p.nombre_completo AS paciente_nombre, p.cedula AS paciente_cedula, e.paciente_id
      FROM estudios e
      JOIN pacientes p ON e.paciente_id = p.id
      WHERE e.estado != 'completado'
      ORDER BY e.fecha_estudio DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pendientes:', error);
    res.status(500).json({ error: 'Error al consultar pendientes: ' + error.message });
  }
});

// Crear orden de estudio (Secretaría)
app.post('/api/estudios/crear-orden', async (req, res) => {
  try {
    const { paciente_id, tipo_examen, titulo } = req.body;

    if (!paciente_id || !titulo) {
      return res.status(400).json({ error: 'Paciente y título son obligatorios' });
    }

    await pool.query(
      'INSERT INTO estudios (paciente_id, tipo_examen, titulo, fecha_estudio, estado) VALUES ($1, $2, $3, NOW(), $4)',
      [paciente_id, tipo_examen || 'Tomografías y/o Radiografías', titulo, 'pendiente_tecnico']
    );

    res.json({ mensaje: 'Orden creada correctamente' });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error al registrar la orden: ' + error.message });
  }
});

// Técnico: Cargar imágenes/placas (concatena si ya existía algo y pasa a pendiente_medico)
app.put('/api/estudios/:id/cargar-imagenes', upload.array('archivos'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Debes adjuntar al menos una imagen' });
    }

    const estudioActual = await pool.query('SELECT archivo_path FROM estudios WHERE id = $1', [id]);
    const archivosPrevios = estudioActual.rows[0]?.archivo_path || '';

    const nuevasRutas = req.files.map(f => f.filename).join(',');
    const rutasTotales = archivosPrevios ? `${archivosPrevios},${nuevasRutas}` : nuevasRutas;

    await pool.query(
      'UPDATE estudios SET archivo_path = $1, estado = $2 WHERE id = $3',
      [rutasTotales, 'pendiente_medico', id]
    );

    res.json({ mensaje: 'Imágenes cargadas. Orden enviada al médico.' });
  } catch (error) {
    console.error('Error al cargar imágenes:', error);
    res.status(500).json({ error: 'Error al actualizar estudio: ' + error.message });
  }
});

// Médico: Cargar informe y completar (concatena imágenes del técnico con el informe médico)
app.put('/api/estudios/:id/cargar-informe', upload.array('archivos'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Debes adjuntar el informe en PDF o imagen' });
    }

    const estudioActual = await pool.query('SELECT archivo_path FROM estudios WHERE id = $1', [id]);
    const archivosPrevios = estudioActual.rows[0]?.archivo_path || '';
    
    const nuevasRutas = req.files.map(f => f.filename).join(',');
    const rutasTotales = archivosPrevios ? `${archivosPrevios},${nuevasRutas}` : nuevasRutas;

    await pool.query(
      'UPDATE estudios SET archivo_path = $1, estado = $2 WHERE id = $3',
      [rutasTotales, 'completado', id]
    );

    res.json({ mensaje: 'Informe médico adjuntado. Examen completado.' });
  } catch (error) {
    console.error('Error al cargar informe:', error);
    res.status(500).json({ error: 'Error al finalizar estudio: ' + error.message });
  }
});

// Obtener expediente de un paciente
app.get('/api/estudios/paciente/:paciente_id', async (req, res) => {
  const { paciente_id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, tipo_examen, titulo, archivo_path, fecha_estudio FROM estudios WHERE paciente_id = $1 ORDER BY fecha_estudio DESC',
      [paciente_id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('🔥 Error al consultar expediente del paciente:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Cancelar/Eliminar una orden o estudio
app.delete('/api/estudios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM estudios WHERE id = $1', [id]);
    res.json({ mensaje: 'Orden o estudio eliminado correctamente' });
  } catch (error) {
    console.error('Error al borrar la orden:', error);
    res.status(500).json({ error: 'Error al eliminar la orden de la base de datos' });
  }
});

// --- PACIENTES (LOGIN PACIENTE) ---
app.post('/api/paciente/login', async (req, res) => {
  const { cedula, clave } = req.body;

  try {
    const pacienteRes = await pool.query(
      'SELECT id, cedula, nombre_completo FROM pacientes WHERE cedula = $1 AND clave = $2',
      [cedula, clave]
    );

    if (pacienteRes.rows.length === 0) {
      return res.status(401).json({ error: 'Cédula o contraseña incorrecta' });
    }

    const paciente = pacienteRes.rows[0];

    const estudiosRes = await pool.query(
      'SELECT id, tipo_examen, titulo, archivo_path, fecha_estudio FROM estudios WHERE paciente_id = $1 ORDER BY fecha_estudio DESC',
      [paciente.id]
    );

    res.json({
      paciente: paciente,
      estudios: estudiosRes.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Descargar el primer archivo de un estudio
app.get('/api/descargar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT archivo_path, titulo FROM estudios WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudio no encontrado en la base de datos' });
    }

    const estudio = result.rows[0];
    const primerArchivo = estudio.archivo_path ? estudio.archivo_path.split(',')[0] : '';
    const soloNombreArchivo = path.basename(primerArchivo);
    const filePath = path.join(uploadDir, soloNombreArchivo);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo físico no encontrado en el servidor' });
    }

    const extension = path.extname(soloNombreArchivo);
    res.download(filePath, `${estudio.titulo}${extension}`);

  } catch (err) {
    console.error('🔥 Error en descarga:', err.message);
    res.status(500).json({ error: 'Error del servidor al descargar el archivo' });
  }
});

// Descargar un archivo individual por su nombre de archivo
app.get('/api/descargar-archivo/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const soloNombreArchivo = path.basename(filename);
    const filePath = path.join(uploadDir, soloNombreArchivo);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo físico no encontrado en el servidor' });
    }

    res.download(filePath, soloNombreArchivo);
  } catch (err) {
    console.error('🔥 Error en descarga individual:', err.message);
    res.status(500).json({ error: 'Error al descargar el archivo' });
  }
});

// NOTIFICAR AL PACIENTE POR CORREO MANUALMENTE DESDE EL PANEL
app.post('/api/estudios/:id/notificar-correo', async (req, res) => {
  try {
    const { id } = req.params;

    // Consultar datos del estudio y del paciente
    const estudioQuery = await pool.query(
      `SELECT e.titulo, e.tipo_examen, p.nombre_completo, p.correo 
       FROM estudios e 
       JOIN pacientes p ON e.paciente_id = p.id 
       WHERE e.id = $1`, 
      [id]
    );

    if (estudioQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Estudio no encontrado' });
    }

    const { titulo, tipo_examen, nombre_completo, correo } = estudioQuery.rows[0];

    if (!correo || !correo.trim()) {
      return res.status(400).json({ error: 'El paciente no tiene un correo electrónico registrado' });
    }

    // Enviar el correo usando la función de Resend que ya tenemos
    const enviado = await enviarCorreoPaciente(correo, nombre_completo, tipo_examen, titulo);

    if (enviado) {
      res.json({ mensaje: 'Correo enviado exitosamente al paciente' });
    } else {
      res.status(500).json({ error: 'Error al enviar el correo a través de Resend' });
    }
  } catch (error) {
    console.error('Error al notificar por correo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// =============================================================
// 5. INICIAR SERVIDOR
// =============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});