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
  origin: 'https://www.unidaddeimagenesdeleste.com',
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
      // 🟢 Dirección con tu dominio verificado
      from: 'Unidad de Imágenes Del Este <notificaciones@unidaddeimagenesdeleste.com>',
      to: [correoPaciente],
      reply_to: 'sistemaunidaddeimagenes@gmail.com',
      subject: `¡Tus resultados de ${tipoExamen} están listos!`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; background-color: #F9F6F0; padding: 25px; border-radius: 16px;">
          
          <!-- TARJETA PRINCIPAL BLANCA -->
          <div style="background-color: #ffffff; border: 1px solid #EFE9E0; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">

            <!-- HEADER CON LOGO Y MARCA -->
            <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 2px solid #EFE9E0;">
              <img 
                src="https://www.unidaddeimagenesdeleste.com/logo.png" 
                alt="Unidad de Imágenes Del Este" 
                style="max-width: 170px; height: auto; display: block; margin: 0 auto 12px auto;" 
              />
              <span style="font-size: 10px; font-weight: 800; color: #7A2328; text-transform: uppercase; letter-spacing: 1.5px; display: block;">
                Centro de Imágenes Médicas Del Este
              </span>
            </div>

            <!-- SALUDO Y MENSAJE PRINCIPAL -->
            <h2 style="color: #2D2423; font-size: 20px; margin-top: 0; margin-bottom: 12px; font-weight: 800;">
              ¡Hola, <span style="color: #7A2328;">${nombrePaciente}</span>!
            </h2>

            <p style="font-size: 14px; color: #3D1C1E; line-height: 1.6; margin-bottom: 20px;">
              Te informamos que tu estudio radiológico ha sido procesado exitosamente por nuestro equipo especialista y ya se encuentra disponible en nuestro portal web.
            </p>

            <!-- TARJETA DESTACADA CON DETALLES DEL ESTUDIO -->
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

            <!-- BOTÓN CTA VINO TINTO -->
            <div style="text-align: center; margin: 30px 0;">
              <a 
                href="https://www.unidaddeimagenesdeleste.com/pacientes" 
                style="background-color: #7A2328; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; display: inline-block; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(122, 35, 40, 0.25);"
              >
                Consultar Mis Resultados →
              </a>
            </div>

            <p style="font-size: 12px; color: #611B1E; line-height: 1.5; text-align: center; margin-bottom: 0; font-weight: 500;">
              Para acceder, ingresa con tu <strong>número de cédula</strong> y tu clave registrada.
            </p>

            <!-- LÍNEA DIVISORA -->
            <hr style="border: none; border-top: 1px solid #EFE9E0; margin: 25px 0 20px 0;" />

            <!-- DATOS DE LA CLÍNICA EN BARQUISIMETO -->
            <div style="text-align: center; font-size: 11px; color: #3D1C1E; line-height: 1.6;">
              <p style="margin: 0; font-weight: 700; color: #7A2328;">Unidad de Imágenes Del Este, C.A.</p>
              <p style="margin: 2px 0 0 0; color: #611B1E;">Calle 8 entre Carreras 21 y 22, Barquisimeto, Edo. Lara</p>
              <p style="margin: 2px 0 0 0; color: #611B1E;">Contacto / WhatsApp: +58 424-5715351</p>
            </div>

          </div>

          <!-- FOOTER EXTERNO DE SEGURIDAD -->
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