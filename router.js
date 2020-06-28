const config = require('./config.js')
const server = config.server;
const database = config.database;

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
server.get('/', function (request, response) {
    response.render('home.ejs');
});

server.get('/signin', function(request, response) {
    const country_list = require('country-list');
    response.render('signin.ejs', {
        error: request.body.error,
        countries: country_list.getNames()
    });
});

server.post('/signin', function(request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        response.status(404).json({errors: errors.array()});
        response.end();
    } else {
        let query = 'INSERT INTO User(email, password, firstname, lastname, birthdate, country, sex)'
        + 'VALUES("' + request.body.email + '", "' + request.body.password + '", "'
        + request.body.firstname + '", "' + request.body.lastname + '", "' + request.body.birthdate
        + '", "' + request.body.country + '", "' + request.body.sex + '")';
        database.query(query, function(err, result) {
            if (err) {
                if (err.code == 'ER_DUP_ENTRY') {
                    response.send({error: 'Un compte existe déjà avec cet email. Connectez-vous.'});                  
                }
            }
            else {
                response.send({redirect: '/profile/' + result.insertId});
            }
        });
    }
});


server.get('/login', function (request, response) {
    response.render('login.ejs', {error: request.body.error});
});

server.post('/login', function (request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        response.status(404).json({errors: errors.array()});
        response.end();
    } else {
        const query = "SELECT * FROM User WHERE email = '" + request.body.email + "' AND password = '" + request.body.password + "'";
        database.query(query, function (err, result) {
            if (err) throw err;
            if (!result.length) {
                response.send({error: 'Email et/ou mot de passe incorrect'});
            } else {
                response.send({redirect: '/profile/' + result[0].id_user});
            }         
        });
    }
});

server.get('/profile/:iduser', function (request, response) {
    let query = `SELECT firstname, lastname, country, birthdate, sex FROM User WHERE id_user = ` + request.params.iduser;
    function age (birth) {
        now = new Date()
        ms_to_year = 1000 * 60 * 60 * 24 * 365;
        return Math.floor(parseInt(now - birth) / ms_to_year);
    }
    database.query(query, function(err, resName) {
        if (err) throw err;
        if(!resName.length) {
            response.send("Aucun utilisateur n'a cet identifiant utilisateur");
        }
        else {
            query = `SELECT category, name, degree FROM Appreciate INNER JOIN Interest 
            on Appreciate.id_user = ` + request.params.iduser +
                ` AND Appreciate.id_interest = Interest.id_interest`;
            database.query(query, function (err, resInterests) {
                if (err) throw err;
                response.render('profile.ejs', {
                    id: request.params.iduser,
                    firstname: resName[0].firstname,
                    lastname: resName[0].lastname,
                    country: resName[0].country,
                    age: age(resName[0].birthdate),
                    sex: resName[0].sex,
                    interests: resInterests,
                    search_results: []
                }
                );
            })
        }
    });
});

server.get('/search/form', function(request, response) {
    response.render('search.ejs', {search_results: []});
});

//url : search?query=Tennis&iduser=1
server.get('/search', function (request, response) {
    //(iduser, degree) des users aimant le centre d'interet cherché
    const query = 'SELECT a1.id_user, a1.degree FROM Appreciate a1 ' +
    'INNER JOIN Interest i ON i.name = "' + capitalizeFirstLetter(request.query.query) +
    '" WHERE a1.id_interest IN (SELECT id_interest FROM Appreciate WHERE id_user = ' + request.query.iduser +
    ') HAVING a1.id_user <> ' + request.query.iduser;
    database.query(query, function (err, result) {
        if (err) throw err;
        response.render('search.ejs', { id: request.query.iduser, search_results: result });
    });
});

server.get('/profile/:iduser/change',function(request, response) {
    let query = `SELECT * FROM User WHERE user.id_user = ?
    ; SELECT name, degree FROM Appreciate a 
    JOIN Interest i ON a.id_interest = i.id_interest
    WHERE a.id_user = ?`;
    database.query(query, [request.params.iduser, request.params.iduser],function(err, result) {
        if (err) throw err;
        response.render('changeprofile.ejs', {infos: result[0][0], interests: result[1]});
    });
});

server.get('/about', function (request, response) {
    response.render('about.ejs');
});

server.get('/contact', function (request, response) {
    response.render('contact.ejs');
});

server.use(function(request, response){
    response.send('On another page.');  
});

// Gestion du shutdown du routeur avec la commande CTRL-C
process.on( 'SIGINT', function() {
    database.end();
    process.exit();
});