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
// 2. RUTA ABSOLUTA DE ARCHIVOS (Railway / Local)
// =============================================================
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Servir la carpeta estática públicamente
app.use('/uploads', express.static(uploadDir));

// CONFIGURACIÓN DE MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Guarda usando la ruta absoluta
  },
  filename: (req, file, cb) => {
    // Reemplaza espacios por guiones bajos pero SIN agregar Date.now()
    const nombreLimpio = file.originalname.replace(/\s+/g, '_');
    cb(null, file.originalname);

    // Si prefieres el nombre 100% exacto original (incluso con sus espacios intactos):
    // cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
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

            <p style="font-size: 12px; color: #611B1E; line-height: 1.5; text-align: center; margin-bottom: 0; font-weight: 500;">
              Para acceder, ingresa con tu <strong>número de cédula </strong> y tu clave registrada (Tu Cédula).
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

// RUTA: Inicializar Tablas en la Base de Datos
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

      CREATE TABLE IF NOT EXISTS estudios (
        id SERIAL PRIMARY KEY,
        paciente_id INT REFERENCES pacientes(id) ON DELETE CASCADE,
        tipo_examen VARCHAR(50) NOT NULL,
        titulo VARCHAR(150) NOT NULL,
        archivo_path TEXT NOT NULL,
        fecha_estudio DATE DEFAULT CURRENT_DATE
      );
    `);
    res.send("Base de datos e historial médico listos");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RUTA: Crear un nuevo paciente
app.post('/api/pacientes', async (req, res) => {
  const { cedula, nombre_completo, telefono, correo, clave } = req.body;

  try {
    // 1. Validar si ya existe un paciente registrado con esa cédula
    const existe = await pool.query('SELECT id FROM pacientes WHERE cedula = $1', [cedula]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Este paciente ya se encuentra registrado' });
    }

    // 2. Registrar el nuevo paciente
    const result = await pool.query(
      `INSERT INTO pacientes (cedula, nombre_completo, telefono, correo, clave) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [cedula, nombre_completo, telefono, correo, clave]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("🔥 Error al registrar paciente:", err);
    res.status(500).json({ error: 'Error interno en el servidor' });
  }
});

// RUTA: Obtener la lista de todos los pacientes
app.get('/api/pacientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, cedula, nombre_completo, correo, telefono FROM pacientes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RUTA: Editar paciente
app.put('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cedula, nombre_completo, telefono, correo, clave } = req.body;

    if (clave && clave.trim() !== '') {
      // Si se envió una contraseña nueva, la actualiza
      await pool.query(
        'UPDATE pacientes SET cedula = $1, nombre_completo = $2, telefono = $3, correo = $4, clave = $5 WHERE id = $6',
        [cedula, nombre_completo, telefono, correo, clave, id]
      );
    } else {
      // Si se dejó en blanco, mantiene la clave anterior
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

// OBTENER USUARIOS DEL PERSONAL
app.get('/api/admin/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, cedula, nombre_completo, rol FROM personal ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// CREAR USUARIO DEL PERSONAL
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

// ACTUALIZAR ROL DE UN USUARIO
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

// ELIMINAR UN USUARIO DEL PERSONAL
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

// ACTUALIZAR CONTRASEÑA DE UN USUARIO DEL PERSONAL
app.post('/api/estudios', upload.array('archivos'), async (req, res) => {
  const { paciente_id, tipo_examen, titulo, notificar_correo } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Debes adjuntar al menos un archivo' });
  }

  try {
    const estudiosGuardados = [];

    // 1. Guardar cada archivo usando su nombre original como título en la BD
    for (const file of req.files) {
      const nombreReal = file.originalname;

      const result = await pool.query(
        'INSERT INTO estudios (paciente_id, tipo_examen, titulo, archivo_path) VALUES ($1, $2, $3, $4) RETURNING *',
        [
          paciente_id, 
          tipo_examen, 
          nombreReal,   // En la BD se guarda el nombre real del archivo
          file.filename // Nombre guardado en el servidor
        ]
      );
      estudiosGuardados.push(result.rows[0]);
    }

    // 2. Responder al frontend con los registros creados
    res.json({ mensaje: 'Estudios cargados correctamente', estudios: estudiosGuardados });

    // 3. Conversión segura del flag notificar_correo
    const debeNotificar = String(notificar_correo) === 'true' || notificar_correo === true;

    console.log(`📧 Evaluando envío de correo... (notificar_correo recibido: "${notificar_correo}", evaluado: ${debeNotificar})`);

    if (debeNotificar) {
      const pacienteQuery = await pool.query(
        'SELECT nombre_completo, correo FROM pacientes WHERE id = $1',
        [paciente_id]
      );

      if (pacienteQuery.rows.length > 0) {
        const paciente = pacienteQuery.rows[0];
        
        if (paciente.correo && paciente.correo.trim() !== '') {
          console.log(`📩 Intentando enviar correo a: ${paciente.correo}`);
          
          try {
            await enviarCorreoPaciente(
              paciente.correo,
              paciente.nombre_completo,
              tipo_examen || 'Radiografía',
              titulo || 'Nuevo Estudio de Imagen' // Asunto enviado al correo
            );
            console.log(`✅ Correo enviado exitosamente a ${paciente.correo}`);
          } catch (emailErr) {
            console.error('❌ Error en el servidor de correo (Nodemailer/SMTP):', emailErr.message);
          }

        } else {
          console.log(`⚠️ El paciente "${paciente.nombre_completo}" no tiene correo electrónico registrado.`);
        }
      } else {
        console.log(`⚠️ No se encontró al paciente con ID: ${paciente_id}`);
      }
    } else {
      console.log('ℹ️ Se omitió el envío de correo (el usuario activo tiene rol técnico o notificar_correo es false).');
    }

  } catch (err) {
    console.error('🔥 Error al registrar estudio:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// RUTA: Login del paciente y sus exámenes
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

// RUTA: Login de Personal Administrativo
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

// 🟢 RUTA CORREGIDA: Descargar archivo buscando directamente en uploadDir
app.get('/api/descargar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT archivo_path, titulo FROM estudios WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estudio no encontrado en la base de datos' });
    }

    const estudio = result.rows[0];
    
    // Extraemos solo el nombre limpio del archivo
    const soloNombreArchivo = path.basename(estudio.archivo_path);
    const filePath = path.join(uploadDir, soloNombreArchivo);

    console.log("🔍 Buscando archivo físico en:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error("❌ Archivo físico no encontrado en:", filePath);
      return res.status(404).json({ error: 'Archivo físico no encontrado en el servidor' });
    }

    const extension = path.extname(soloNombreArchivo);
    res.download(filePath, `${estudio.titulo}${extension}`);

  } catch (err) {
    console.error('🔥 Error en descarga:', err.message);
    res.status(500).json({ error: 'Error del servidor al descargar el archivo' });
  }
});

// RUTA: Obtener los estudios de un paciente específico (Para el PanelPersonal)
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

// ELIMINAR UN ESTUDIO
app.delete('/api/estudios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM estudios WHERE id = $1', [id]);
    res.json({ mensaje: 'Estudio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el estudio' });
  }
});

// ELIMINAR UN PACIENTE
app.delete('/api/pacientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Borra primero los estudios asociados para mantener integridad
    await pool.query('DELETE FROM estudios WHERE paciente_id = $1', [id]);
    await pool.query('DELETE FROM pacientes WHERE id = $1', [id]);
    res.json({ mensaje: 'Paciente eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el paciente' });
  }
});

// OBTENER TODOS LOS USUARIOS DEL PERSONAL
app.get('/api/admin/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, cedula, nombre_completo, rol FROM usuarios_personal ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// ACTUALIZAR ROL DE UN USUARIO
app.put('/api/admin/usuarios/:id/rol', async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    await pool.query('UPDATE usuarios_personal SET rol = $1 WHERE id = $2', [rol, id]);
    res.json({ mensaje: 'Rol actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el rol' });
  }
});

// 1. SECRETARÍA / SUPERADMIN: Crear orden de estudio pendiente
app.post('/api/estudios/pendiente', async (req, res) => {
  const { paciente_id, tipo_examen, titulo } = req.body;

  if (!paciente_id || !tipo_examen || !titulo) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO estudios (paciente_id, tipo_examen, titulo, estado) 
       VALUES ($1, $2, $3, 'pendiente') RETURNING *`,
      [paciente_id, tipo_examen, titulo]
    );
    res.status(201).json({ mensaje: 'Estudio asignado con éxito', estudio: result.rows[0] });
  } catch (err) {
    console.error('🔥 Error al asignar estudio:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. TÉCNICOS / MÉDICOS: Obtener lista de estudios pendientes
// 1. OBTENER ESTUDIOS PENDIENTES (Con información del paciente)
app.get('/api/estudios/pendientes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.id, e.tipo_examen, e.titulo, e.fecha_estudio, e.estado, e.ruta_archivo,
             p.nombre_completo AS paciente_nombre, p.cedula AS paciente_cedula
      FROM estudios e
      JOIN pacientes p ON e.paciente_id = p.id
      WHERE e.estado != 'completado'
      ORDER BY e.fecha_estudio DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pendientes:', error);
    res.status(500).json({ error: 'Error al consultar pendientes' });
  }
});

// 2. SECRETARÍA: CREAR ORDEN DE ESTUDIO (Estado: pendiente_tecnico)
app.post('/api/estudios/crear-orden', async (req, res) => {
  try {
    const { paciente_id, tipo_examen, titulo } = req.body;

    await pool.query(
      'INSERT INTO estudios (paciente_id, tipo_examen, titulo, fecha_estudio, estado) VALUES ($1, $2, $3, NOW(), $4)',
      [paciente_id, tipo_examen, titulo, 'pendiente_tecnico']
    );

    res.json({ mensaje: 'Orden de examen creada para el técnico' });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error al registrar orden' });
  }
});

// 3. TÉCNICO: CARGAR IMÁGENES/PLACAS (Pasa a: pendiente_medico)
app.put('/api/estudios/:id/cargar-imagenes', upload.array('archivos'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Debes adjuntar al menos una imagen' });
    }

    const rutas = req.files.map(f => f.filename || f.path).join(',');

    await pool.query(
      'UPDATE estudios SET ruta_archivo = $1, estado = $2 WHERE id = $3',
      [rutas, 'pendiente_medico', id]
    );

    res.json({ mensaje: 'Imágenes cargadas. Orden enviada al médico.' });
  } catch (error) {
    console.error('Error al cargar imágenes:', error);
    res.status(500).json({ error: 'Error al actualizar estudio' });
  }
});

// 4. MÉDICO: CARGAR INFORME Y COMPLETAR (Pasa a: completado)
app.put('/api/estudios/:id/cargar-informe', upload.array('archivos'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Debes adjuntar el informe en PDF o imagen' });
    }

    // Obtenemos archivos previos (imágenes del técnico) para conservar todo en la columna
    const estudioActual = await pool.query('SELECT ruta_archivo FROM estudios WHERE id = $1', [id]);
    const archivosPrevios = estudioActual.rows[0]?.ruta_archivo || '';
    
    const nuevasRutas = req.files.map(f => f.filename || f.path).join(',');
    const rutasTotales = archivosPrevios ? `${archivosPrevios},${nuevasRutas}` : nuevasRutas;

    await pool.query(
      'UPDATE estudios SET ruta_archivo = $1, estado = $2 WHERE id = $3',
      [rutasTotales, 'completado', id]
    );

    res.json({ mensaje: 'Informe médico adjuntado. Examen completado.' });
  } catch (error) {
    console.error('Error al cargar informe:', error);
    res.status(500).json({ error: 'Error al finalizar estudio' });
  }
});

// 3. TÉCNICO / MÉDICO / SUPERADMIN: Adjuntar resultados y completar la orden
app.put('/api/estudios/:id/completar', upload.array('archivos'), async (req, res) => {
  const { id } = req.params;
  const { notificar_correo } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Debes adjuntar al menos un archivo' });
  }

  try {
    // Actualiza la orden pendiente asignando el archivo y cambiando el estado a completado
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      if (i === 0) {
        await pool.query(
          `UPDATE estudios 
           SET archivo_path = $1, estado = 'completado', fecha_estudio = NOW() 
           WHERE id = $2`,
          [file.filename, id]
        );
      } else {
        // Si subió más de un archivo para la misma orden, creamos registros completados adicionales
        const ordenBase = await pool.query('SELECT paciente_id, tipo_examen FROM estudios WHERE id = $1', [id]);
        const { paciente_id, tipo_examen } = ordenBase.rows[0];

        await pool.query(
          `INSERT INTO estudios (paciente_id, tipo_examen, titulo, archivo_path, estado) 
           VALUES ($1, $2, $3, $4, 'completado')`,
          [paciente_id, tipo_examen, file.originalname, file.filename]
        );
      }
    }

    res.json({ mensaje: 'Resultados cargados y orden completada con éxito' });

    // Notificación en segundo plano si aplica
    if (String(notificar_correo) === 'true') {
      const pacienteQuery = await pool.query(
        `SELECT p.correo, p.nombre_completo, e.tipo_examen, e.titulo 
         FROM estudios e JOIN pacientes p ON e.paciente_id = p.id WHERE e.id = $1`,
        [id]
      );

      if (pacienteQuery.rows.length > 0 && pacienteQuery.rows[0].correo) {
        const { correo, nombre_completo, tipo_examen, titulo } = pacienteQuery.rows[0];
        enviarCorreoPaciente(correo, nombre_completo, tipo_examen, titulo).catch(console.error);
      }
    }

  } catch (err) {
    console.error('🔥 Error al completar estudio:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// =============================================================
// 5. INICIAR SERVIDOR
// =============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});