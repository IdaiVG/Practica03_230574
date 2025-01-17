const express = require('express');
const session = require('express-session');
const moment = require('moment-timezone');

const app = express();


//Configuración de la sesión
app.use(session({
    secret: 'p3-GIVG-230574-sesionespersistentes', //Secreto para firmar la cookie de sesión
    resave:false,  //No resguardar la sesión si no ha sido modificada
    saveUninitialized:true,  //Guardar la sesión aunque no haya sido inicializada
    cookie:{secure:false, maxAge: 24 * 60 * 60 * 1000}  //Usar secure:true solo si usas HTTPS, MAXAGE permite definir la duración máxima de la sesión (24 horas)- DURACIÓN MAXIMA DE LA SESIÓN
}));
// Middleware para mostrar detalles de la sesión
app.use((req, res, next) => {
    if (req.session) {
        if (!req.session.createdAt) {
            req.session.createdAt = new Date(); // Fecha de creación
        }
        req.session.lastAccess = new Date(); // Último acceso
    }
    next();
});

// Ruta para iniciar sesión
app.get('/login/:User', (req, res) => {
    req.session.User = req.params.User;
    req.session.createdAt = new Date();
    req.session.lastAccess = new Date();
    res.send("La sesión ha sido iniciada.");
});

// Ruta para actualizar el último acceso
app.get('/update', (req, res) => {
    if (req.session.createdAt) {
        req.session.lastAccess = new Date();
        res.send("La fecha de último acceso ha sido actualizada.");
    } else {
        res.send("No hay sesión activa.");
    }
});

// Ruta para mostrar información de la sesión
app.get('/status', (req, res) => {
    if (req.session.createdAt) {
        const now = new Date();
        const started = new Date(req.session.createdAt);
        const lastUpdate = new Date(req.session.lastAccess);

        const sessionAgeMs = now - started;
        const hours = Math.floor(sessionAgeMs / (1000 * 60 * 60));
        const minutes = Math.floor((sessionAgeMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((sessionAgeMs % (1000 * 60)) / 1000);

        const createdAt_CDMX = moment(started).tz('America/Mexico_City').format('YYYY/MM/DD HH:mm:ss');
        const lastAccess_CDMX = moment(lastUpdate).tz('America/Mexico_City').format('YYYY/MM/DD HH:mm:ss');

        if (req.session.User) {
            res.json({
                User: req.session.User,
                message: 'Estado de la sesión',
                sessionid: req.sessionID,
                inicio: createdAt_CDMX,
                ultimoAcceso: lastAccess_CDMX,
                antiguedad: `${hours} horas, ${minutes} minutos y ${seconds} segundos`
            });
        } else {
            res.send('No hay una sesión activa.');
        }
    } else {
        res.send('No hay una sesión activa.');
    }
});

// Ruta para cerrar la sesión
app.get('/logout', (req, res) => {
    if (req.session.createdAt) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Error al cerrar sesión.');
            }
            res.send('<h1>Sesión cerrada exitosamente.</h1>');
        });
    } else {
        res.send('No hay una sesión activa para cerrar.');
    }
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});