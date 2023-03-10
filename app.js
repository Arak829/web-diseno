const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes/index.js');
const fs = require('fs');
const { QueryTypes } = require("sequelize");
const Sequelize = require('sequelize');
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(process.env.NAME1,process.env.USER1, process.env.PASS1, { dialect: 'mysql', host: process.env.HOST1
 })

let gpsCoords = {latitud: 0, longitud: 0};
var mensaje = ''
var dataf=''

//settings
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// middlewares
app.use((req, res, next) => {
  console.log(`${req.url} - ${req.method}`);
  next();
} );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//routes
app.use(routes);


//static files
app.use(express.static(path.join(__dirname, 'public')));


//start the server
app.listen(app.get('port'), () =>{
  console.log('Server on port', app.get('port'))
});

//sniffer
const dgram = require('dgram');
const PORT = 52000;
const socket = dgram.createSocket('udp4');
socket.bind(PORT);
socket.on('listening', () =>{
  console.log('En funcionamiento')
});

socket.on('message',  (info,rinfo) => {
  dataf = JSON.parse(info);
  console.log(dataf);
  const {results, metadata} = sequelize.query(`INSERT INTO coords VALUES (null,${dataf.latitud},${dataf.longitud},\"${dataf.fecha}\",\"${dataf.hora}\",\"${rinfo.address}\")`);
  gpsCoords = {
    latitud: dataf.latitud,
    longitud: dataf.longitud
  };
  const content = `Latitud: ${dataf.latitud}, Longitud: ${dataf.longitud}, Fecha: ${dataf.fecha}, Hora: ${dataf.hora}\n`;
  
});


app.get('/', (req, res) => {
  res.render('pagina-principal', {
    lat: dataf.latitud,
    long: dataf.longitud,
    date: dataf.fecha,
    time: dataf.hora,
  });
});

app.get('/coords', (req, res) => {
  res.json({
    lat: dataf.latitud,
    long: dataf.longitud,
    date: dataf.fecha,
    time: dataf.hora,
  });
});
app.get('/linea',async (req, res) => {
  sequelize.query('SELECT distinct latitud,longitud FROM test.coords order by id desc limit 50', { raw: true }).then(function(rows){
    const values = rows[0].map(obj => [parseFloat(obj.latitud), parseFloat(obj.longitud)]);
    res.json({
      rows:values
    });
  })
  
  
});
//npm run dev