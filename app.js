const express = require('express');
const session = require('express-session');
const moment = require('moment-timezone');

const app = express();


//Configuración de la sesión
app.use(session({
    secret: 'p3-GIVG-230574-sesionespersistentes', //Secreto para firmar la cookie de sesión
    resave:false,  //No resguardar la sesión si no ha sido modificada
    saveUninitialized:true,  //Guardar la sesión aunque no haya sido inicializada
    cookie:{secure:false, maxAge:24*60*60*1000}  //Usar secure:true solo si usas HTTPS, MAXAGE permite definir la duración máxima de la sesión (24 horas)- DURACIÓN MAXIMA DE LA SESIÓN
}));

//Midelware para mostrar detalles de la sesion
app.use((req,res, next)=>{
    if(req.session){
        if(!req.session.createdAt){
            req.session.createdAt=new Date(); //Asignamos la fecha de la creación de la sesión
        }
        req.session.lastAccess=new Date(); //Asignamos la última vez que se accedió a la sesión
    }
    next();
});


app.get('/login/',(req,res)=>{
    if(!req.session.createdAt){
        req.session.createdAt=new Date();
        req.session.lastAccess=new Date();
        res.send('La sesión ha sido iniciada');
    }else{
    res.send("La sesión ya existe");}
});

//Ruta para actualizar la fecha de última consulta
app.get('/update',(req,res)=>{
    if(req.session.createdAt){
        req.session.lastAccess=new Date();
        res.send('La fecha de último acceso ha sido actualizada.');
    }else{
        res.send('No hay una sesión activa');
    }
});


//Ruta para mostrar la información de la sesión
app.get('/status/:user',(req,res)=>{
    if(req.session.createdAt){
        const now =new Date();
        const started = new Date(req.session.createdAt);
        const lastUpdate = new Date(req.session.lastAccess);

        //Calcular la antiguedad de la sesión
        const sessionAgeMs= now - started;
        const hours = Math.floor(sessionAgeMs/(1000*60*60));
        const minutes = Math.floor((sessionAgeMs % (1000*60*60)/(1000*60)));
        const seconds = Math.floor((sessionAgeMs % (1000*60))/1000);

        //Convertir las fechas al uso horario de CDMX
        const createdAt_CDMX = moment(started).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');
        const lastAccess_CDMX = moment(lastUpdate).tz('America/Mexico_City').format('YYYY-MM-DD HH:mm:ss');

        res.json({
            user: req.session.user,
            message:'Estado de la session',
            sessionid: req.sessionID,
            inicio:createdAt_CDMX,
            ultimoAcceso: lastAccess_CDMX,
            antiguedad: `${hours} horas, ${minutes} minutos y ${seconds} segundos`
        });
        
    }else{
        res.send('No hay una sesión activa')
    }
})
app.get('/session/:user',(req,res)=>{
    if(req.session.createdAt){
const user = req.session.user;
      const sessionId = req.session.id;
        const createdAt = req.session.createdAt;
        const lastAccess = req.session.lastAccess;
        const sessionDuration = (new Date() - new Date(createdAt))/1000; //Duración de la sesión en segundos
        console.log(`La duración de la sesión es de ${sessionDuration} segundos.`);
        
       res.send(`
        <h1>Detalles de la sesion</h1>
            <p><strong>Usuario:</strong>${user}</p>
            <p><strong>ID de sesión:</strong>${sessionId}</p>
            <p><strong>Fecha de creación de la sesión:</strong>${createdAt}</p>
            <p><strong>último acceso:</strong>${lastAccess}</p>
            <p><strong>Duración de la sesión (en segundos):</strong>${sessionDuration}</p>
            `);
        }else{
            res.send('No hay una sesión activa')
        }
    })

//Ruta para cerrar la sesión
app.get('/logout/',(req,res)=>{
    if(req.session.createdAt){
    req.session.destroy((err)=>{
        if(err){
            return res.status(500).send('Error al cerrar sesion.');
        }
        res.send('<h1>Sesión cerrada exitosamente.</h1>');
    });
    }else{
    res.send('No hay una sesión activa para cerrar.')
    0}
});

//Iniciar el servidor en el puerto 3000
app.listen(3000,()=>{
    console.log('Servidor corriendo en el puerto 3000');
});
