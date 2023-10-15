const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para el archivo index.html
app.get('/inicio', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'), function(err) {
        if (err) {
            res.status(500).send(err);
        }
    });
});

// Conectar a MongoDB
mongoose.connect('mongodb+srv://mlondono898:1234@cluster0.vwgmvp1.mongodb.net/mibasededatos', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

const User = mongoose.model('User', userSchema);

// Endpoint de registro
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'Usuario registrado exitosamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
});

// Endpoint de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            // Usuario autenticado correctamente, genera un token JWT
            const token = jwt.sign({ username }, 'tu_clave_secreta', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(401).json({ error: 'Credenciales incorrectas.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al autenticar el usuario.' });
    }
});

// Middleware para verificar el token de autenticación
function authenticateToken(req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Acceso denegado.' });

    jwt.verify(token, 'tu_clave_secreta', (err, user) => {
        if (err) return res.status(403).json({ error: 'Token no válido.' });
        req.user = user;
        next();
    });
}

// Ruta protegida que requiere autenticación
app.get('/protected', authenticateToken, (req, res) => {
    // Acceso permitido para usuarios autenticados
    res.json({ message: 'Acceso permitido.' });
});

// Iniciar el servidor en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});
