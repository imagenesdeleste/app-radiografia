import express from 'express';
import cors from 'cors';
import pg from 'pg';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

//Formatear nombres
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Reemplaza espacios por guiones bajos y agrega un timestamp único
    const nombreLimpio = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${nombreLimpio}`);
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

// RUTA 4: Subir Estudio / Resultado Médico
app.post('/api/estudios', upload.single('archivo'), async (req, res) => {
  const { paciente_id, tipo_examen, titulo } = req.body;
  const archivo_path = req.file ? req.file.path : null;

  if (!archivo_path) {
    return res.status(400).json({ error: 'Debes adjuntar un archivo' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO estudios (paciente_id, tipo_examen, titulo, archivo_path) VALUES ($1, $2, $3, $4) RETURNING *',
      [paciente_id, tipo_examen, titulo, archivo_path]
    );
    res.json(result.rows[0]);
  } catch (err) {
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

// RUTA 6: Obtener estudios directamente por ID de Paciente (Para el área de Personal)
app.get('/api/pacientes/:id/estudios', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, tipo_examen, titulo, archivo_path, fecha_estudio FROM estudios WHERE paciente_id = $1 ORDER BY fecha_estudio DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

import nodemailer from 'nodemailer';
import { cwd } from 'process';

// EMISOR DE CORREO ELECTRONICO 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemaimagenesdeleste@gmail.com',
    pass: 'uffg fssf lyfn hspl' // Generada en la seguridad de Google
  }
});

// Función para enviar la notificación por correo
const enviarCorreoNotificacion = async (emailPaciente, nombrePaciente, tipoExamen, tituloEstudio) => {
  const mailOptions = {
    from: '"Unidad de Imágenes Del Este" <tu_correo_clinica@gmail.com>',
    to: emailPaciente,
    subject: `¡Tus resultados de ${tipoExamen} están listos!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0284c7; text-align: center;">Unidad de Imágenes Del Este</h2>
        <p>Hola <strong>${nombrePaciente}</strong>,</p>
        <p>Te informamos que tu estudio <strong>"${tituloEstudio}"</strong> (${tipoExamen}) ya se encuentra disponible en nuestro portal digital.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="http://tu-dominio-clinica.com" style="background-color: #0f172a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Consultar mis Resultados</a>
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center;">Ingresa con tu número de cédula para ver y descargar tus archivos.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Correo de notificación enviado exitosamente');
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
  }
};

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