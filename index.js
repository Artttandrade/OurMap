const express = require('express');
const fs = require('fs');
const path = require('path');

const favicon = require('serve-favicon');

const db = require('./database');

const socketio = require('socket.io');
const http = require('http');

const app = express();
const server = http.Server(app);
const io = socketio(server);

app.use(favicon('favicon.ico'));
app.use(express.static('src'));

function getCoodinates(sqlQuery, socket){
    db.query(sqlQuery, function(error, results, fields){
        if(error)
            console.log(error)
        socket.emit('locate', results)
    });
}

function execQuery(sqlQuery){
    db.query(sqlQuery, function(error, results, fields){
        if(error)
            console.log(error)
    });
}

function execQueryTotal(sqlQuery, io){
    db.query(sqlQuery, function(error, results, fields){
        if(error)
            console.log(error)
        //console.log(results)
        io.sockets.emit('locate', results)
    });
    
}



io.on('connection',async socket => {
    //console.log('Usuário conectado', socket.id);
    await getCoodinates('SELECT * FROM markers;', socket);
    

    socket.on('location', data =>{
        execQuery(`INSERT INTO markers (lat, lng) VALUES (${data.lat}, ${data.lng});`)

        execQueryTotal('SELECT * FROM markers;', io)
        //io.sockets.emit('newLocation', data);
    })

    socket.on('setName', data => {
        execQuery(`UPDATE markers SET name='${data.name}' WHERE id=${data.id}`);
        execQueryTotal('SELECT * FROM markers;', io);
    })

    socket.on('delete', async id => {
        await execQuery(`DELETE FROM markers WHERE id=${id}`);
        execQueryTotal('SELECT * FROM markers;', io);
    })
});

app.use('/', (request, response) => {
    fs.readFile('mapa.html', function(err, data){
        if(err){
            response.writeHead(500);
            return response.end('Erro ao carregar mapa');
        }
        
        response.writeHead(200);
        response.end(data);
    });
});

server.listen(3232);
console.log('Server Up');