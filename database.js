const mysql = require('mysql');

//Adicione aqui as configurações do seu Banco de Dados
const connection = mysql.createConnection({
    host: '',
    port: '',
    user: '',
    password: '',
    database: 'ourMap'
});

connection.connect(function(err){
    if(err) return console.log(err);
    console.log('DB connected.');
});

module.exports = connection;
