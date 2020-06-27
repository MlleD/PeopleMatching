// Point d'entrée côté serveur. Initialisation du stuff

const express = require('express');
const server = express();
var port = 8080;
server.listen(port);

const bodyParser = require('body-parser');
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended:false}));
server.set('view engine', 'ejs');

server.use(express.static('controllers'));
server.use(express.static('libs'));
server.use(express.static('lists'));
server.use(express.static('css'));

var mysql = require('mysql');

var database = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "PeopleMatching",
  multipleStatements: true
});
database.connect();

module.exports = {server: server, database: database}