import express from 'express';
import cors from 'cors';
import pg from 'pg';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { cwd } from 'process';
import { Resend } from 'resend';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(cors({
  origin: 'https://fronted-production-a731.up.railway.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Conexión a la base de datos PostgreSQL de Railway
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

export default pool;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Creamos la ruta usando process.cwd() para que no dé error en Railway
const uploadDir = path.join(process.cwd(), 'uploads');

// Si no existe la carpeta 'uploads', la crea automáticamente
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Servimos la carpeta para poder ver los PDF/archivos
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const nombreLimpio = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${nombreLimpio}`);
  }
});


const upload = multer({ 
  storage: storage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
});

app.post('/api/estudios/upload', upload.single('archivo'), async (req, res) => {
  // Tu lógica para subir el archivo...
});

// RUTA 1: Crear la tabla automáticamente si no existe
app.get('/init-db', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pacientes (
        id SERIAL PRIMARY KEY,
        cedula VARCHAR(20) UNIQUE NOT NULL,
        nombre_completo VARCHAR(150) NOT NULL,
        telefono VARCHAR(20),
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
    res.send("Base de datos e historial medico listos");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RUTA 2: Crear un nuevo paciente (con correo incluido)
app.post('/api/pacientes', async (req, res) => {
  const { cedula, nombre_completo, telefono, correo, clave } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO pacientes (cedula, nombre_completo, telefono, correo, clave) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [cedula, nombre_completo, telefono, correo, clave]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error al registrar paciente:", err);
    res.status(500).json({ error: err.message });
  }
});


// Servir la carpeta de archivos estáticos
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// RUTA 3: Obtener la lista de todos los pacientes (Para mostrarlos en un dropdown)
app.get('/api/pacientes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, cedula, nombre_completo FROM pacientes ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/estudios', upload.single('archivo'), async (req, res) => {
  const { paciente_id, tipo_examen, titulo } = req.body;
  const archivo_filename = req.file ? req.file.filename : null;

  if (!archivo_filename) {
    return res.status(400).json({ error: 'Debes adjuntar un archivo' });
  }

  try {
    // 1. Guardar en PostgreSQL
    const result = await pool.query(
      'INSERT INTO estudios (paciente_id, tipo_examen, titulo, archivo_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [paciente_id, tipo_examen, titulo, archivo_filename]
    );

    const nuevoEstudio = result.rows[0];

    // 2. Buscar datos del paciente
    const pacienteQuery = await pool.query(
      'SELECT nombre_completo, correo FROM pacientes WHERE id = $1',
      [paciente_id]
    );

    // 3. Responder de una vez al cliente (¡Para que la web responda en menos de 1 segundo!)
    res.json(nuevoEstudio);

    // 4. Disparar el envío de correo en segundo plano con Resend
    if (pacienteQuery.rows.length > 0 && pacienteQuery.rows[0].correo) {
      const paciente = pacienteQuery.rows[0];
      
      // Llamamos a la función sin el 'await' para que no frene la respuesta al usuario
      enviarCorreoPaciente(
        paciente.correo,
        paciente.nombre_completo,
        tipo_examen || 'Radiografía',
        titulo || 'Estudio de Imagen'
      ).catch(err => console.error('Error enviando correo en background:', err));
    }

  } catch (err) {
    console.error('🔥 Error al registrar estudio:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// RUTA 5: Login del Paciente y Carga de sus Exámenes
app.post('/api/paciente/login', async (req, res) => {
  const { cedula, clave } = req.body;

  try {
    // 1. Buscar si el paciente existe con esa cédula y clave
    const pacienteRes = await pool.query(
      'SELECT id, cedula, nombre_completo FROM pacientes WHERE cedula = $1 AND clave = $2',
      [cedula, clave]
    );

    if (pacienteRes.rows.length === 0) {
      return res.status(401).json({ error: 'Cédula o contraseña incorrecta' });
    }

    const paciente = pacienteRes.rows[0];

    // 2. Buscar SOLO los estudios que le pertenecen a este paciente
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

// API PARA AENVIAR CORREOS ELECTRONICOS DE NOTIFICACIÓN

const resend = new Resend(process.env.RESEND_API_KEY);

export const enviarCorreoPaciente = async (
  correoPaciente,
  nombrePaciente,
  tipoExamen = 'Estudio',
  tituloEstudio = 'Radiografía'
) => {
  try {
    const { data, error } = await resend.emails.send({
      // 🟢 Reemplazas 'onboarding@resend.dev' por tu dominio de GoDaddy verificado
      from: 'Unidad de Imágenes Del Este <notificaciones@unidaddeimagenesdeleste.com>',
      to: [correoPaciente], // 💡 Ahora le enviará a CUALQUIER correo de paciente
      reply_to: 'sistemaunidaddeimagenes@gmail.com',
      subject: `¡Tus resultados de ${tipoExamen} están listos!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0284c7; text-align: center; margin-bottom: 20px;">Unidad de Imágenes Del Este</h2>
          <p style="font-size: 16px; color: #334155;">Hola <strong>${nombrePaciente}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Te informamos que tu estudio <strong>"${tituloEstudio}"</strong> (${tipoExamen}) ya se encuentra disponible en nuestro portal digital.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://fronted-production-a731.up.railway.app" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Consultar Resultados
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">
            Ingresa con tu número de cédula para descargar tus archivos.
          </p>
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

// RUTA: Login de Personal
app.post('/api/admin/login', async (req, res) => {
  const { cedula, clave } = req.body;

  // Limpiamos espacios en blanco accidentales
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
// RUTA 8: Descarga de archivos conservando extensión original
app.get('/api/descargar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT archivo_path, titulo FROM estudios WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Estudio no encontrado');
    }

    const estudio = result.rows[0];
    const filePath = path.join(__dirname, estudio.archivo_path);

    // res.download() lee el archivo físico con su nombre original y lo entrega intacto
    res.download(filePath, (err) => {
      if (err && !res.headersSent) {
        console.error('Error al descargar archivo:', err);
        res.status(404).send('Archivo físico no encontrado en el servidor');
      }
    });
  } catch (err) {
    console.error('Error en ruta descarga:', err);
    res.status(500).send(err.message);
  }
});

// RUTA 2: Crear un nuevo paciente (Con correo incluido)
app.post('/api/pacientes', async (req, res) => {
  const { cedula, nombre_completo, telefono, correo, clave } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO pacientes (cedula, nombre_completo, telefono, correo, clave) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [cedula, nombre_completo, telefono, correo, clave]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RUTA 9: Editar / Actualizar información de un paciente
app.put('/api/pacientes/:id', async (req, res) => {
  const { id } = req.params;
  const { cedula, nombre_completo, telefono, correo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE pacientes 
       SET cedula = $1, nombre_completo = $2, telefono = $3, correo = $4 
       WHERE id = $5 
       RETURNING *`,
      [cedula, nombre_completo, telefono, correo, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    res.json({ mensaje: 'Paciente actualizado con éxito', paciente: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});