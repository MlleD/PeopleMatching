var database = require('./config.js').database;
var emails = require('./lists/email-list.js');

// Creation des tables
database.connect(function(err) {
  if (err) throw err;
  var logintable = `CREATE TABLE IF NOT EXISTS Login (
    id_user INT NOT NULL UNIQUE AUTO_INCREMENT,
    firstname VARCHAR(255), lastname VARCHAR(255),
    birthdate DATE, city VARCHAR(255), country VARCHAR(255),
    email VARCHAR(255), password VARCHAR(255),
    PRIMARY KEY (id_user), CONSTRAINT U_User UNIQUE (email))`;
  var intereststable = `CREATE TABLE IF NOT EXISTS Interest (
    id_interest INT NOT NULL AUTO_INCREMENT UNIQUE,
    name VARCHAR(255) UNIQUE, category VARCHAR(255),
    PRIMARY KEY (id_interest), 
    CONSTRAINT PK_Interest PRIMARY KEY (id_interest),
    CONSTRAINT U_Interest UNIQUE (name, category))`;
  var liketable = `CREATE TABLE IF NOT EXISTS Appreciate (
    id_user INT, id_interest INT, degree INT,
    CONSTRAINT FK_Appreciate_Id_User FOREIGN KEY (id_user) REFERENCES Login(id_user),
    CONSTRAINT FK_Appreciate_Id_Interest FOREIGN KEY (id_interest) REFERENCES Interest(id_interest),
    CONSTRAINT U_Appreciate UNIQUE (id_user, id_interest))`;
  var matchingtable = `CREATE TABLE IF NOT EXISTS Matching (
    id_user1 INT, id_user2 INT,
    CONSTRAINT FK_Matching_Id_User1 FOREIGN KEY (id_user1) REFERENCES Login(id_user),
    CONSTRAINT FK_Matching_Id_User2 FOREIGN KEY (id_user2) REFERENCES Login(id_user),
    CONSTRAINT U_Matching UNIQUE (id_user1, id_user2),
    CHECK (id_user1 < id_user2))`;
  [logintable, intereststable, liketable, matchingtable].forEach(nametable => {
      database.query(nametable, function (err, result) {
        if (err) throw err;
      });
  })
});

// remplir
function insertInterests (listval, categorie) {
  for (let elem of listval) {
    var query = "INSERT INTO Interests(name, category) VALUES ('" + elem + "', '" + categorie + "')";
    database.query(query, function(err, result){
      if(err) throw err;
    });
  }
}

var sports = require('./lists/sports-name.js');
insertInterests(sports, 'Sport');

var arts = ['Architecture', 'Bandes dessinées', 'Cinema', 'Littérature', 'Musique', 'Peinture', 'Sculpture', 'Spectacle vivant', 'Medias'];
insertInterests(arts, 'Art');

function queryDatabase(query, paramsQuery) {
  database.query(query, paramsQuery, function(err, result) {
    if (err) throw err;
  });
}

var query = `INSERT INTO Users(email, password, firstname, lastname, birthdate, country) VALUES(?, ?, ?, ?, ?, ?)`;
queryDatabase(query, ['atest@gmail.fr', 'atest', 'Anna', 'Bell', '1991-01-22', 'Canada']);
queryDatabase(query, ['btest@gmail.fr', 'btest', 'Brandon', 'Shaun', '1996-05-23', 'France']);

query = `INSERT INTO Appreciate(id_user, id_interest, degree) VALUES(?, ?, ?)`;
[[1, 1, 5], [1, 2, 3], [2, 2, 3], [2, 4, 4]].forEach(val => queryDatabase(query, val));

database.end();
