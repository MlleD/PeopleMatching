const config = require('./config.js')
const server = config.server;
const database = config.database;

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// ---- FONCTIONS HELPER ----
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function age(birth) {
    now = new Date()
    ms_to_year = 1000 * 60 * 60 * 24 * 365;
    return Math.floor(parseInt(now - birth) / ms_to_year);
}

// ----  ROUTES ---- 
server.get('/', function (request, response) {
    if (request.session.user) {
        response.render('home.ejs', { id_user: request.session.user.id_user })
    } else {
        response.render('home.ejs', { id_user: null })
    }
});

server.get('/signin', function (request, response) {
    const country_list = require('country-list');
    response.render('signin.ejs', {
        error: request.body.error,
        countries: country_list.getNames(),
        id_user: request.session.id_user
    });
});

server.post('/signin', function (request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        response.status(404).json({ errors: errors.array() });
        response.end();
    } else {
        let query = 'INSERT INTO User(email, password, firstname, lastname, birthdate, country, sex)'
            + 'VALUES("' + request.body.email + '", "' + request.body.password + '", "'
            + request.body.firstname + '", "' + request.body.lastname + '", "' + request.body.birthdate
            + '", "' + request.body.country + '", "' + request.body.sex + '")';
        database.query(query, function (err, result) {
            if (err) {
                if (err.code == 'ER_DUP_ENTRY') {
                    response.send({ error: 'Un compte existe déjà avec cet email. Connectez-vous.' });
                }
            }
            else {
                request.session.user = { id_user: result.insertId }
                response.send({
                    redirect: '/profile/' + result.insertId,
                    id_user: result.insertId
                });
            }
        });
    }
});


server.get('/login', function (request, response) {
    response.render('login.ejs', { error: request.body.error, id_user: request.user });
});

server.post('/login', function (request, response) {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        response.status(404).json({ errors: errors.array() });
        response.end();
    } else {
        const query = "SELECT * FROM User WHERE email = '" + request.body.email + "' AND password = '" + request.body.password + "'";
        database.query(query, function (err, result) {
            if (err) throw err;
            if (!result.length) {
                response.send({ error: 'Email et/ou mot de passe incorrect' });
            } else {
                request.session.user = result[0]
                response.send({
                    redirect: '/profile/' + result[0].id_user,
                    id_user: result[0].id_user
                })
            }
        });
    }
});

server.get('/profile/:iduser', function (request, response) {
    if (!request.session.user) {
        response.status(404).send("Vous devez être connecté pour voir le contenu de cette page.")
    }
    let query = `SELECT firstname, lastname, country, birthdate, sex, description FROM User WHERE id_user = ` + request.params.iduser;
    database.query(query, function (err, resName) {
        if (err) throw err;
        if (!resName.length) {
            response.send("Aucun utilisateur n'a cet identifiant utilisateur");
        }
        else {
            query = `SELECT name, degree FROM Appreciate INNER JOIN Interest 
            on Appreciate.id_user = ` + request.params.iduser +
                ` AND Appreciate.id_interest = Interest.id_interest`;
            database.query(query, function (err, resInterests) {
                if (err) throw err;
                query = "SELECT id_user2 FROM Matching WHERE id_user1 = " + request.session.user.id_user  + " AND id_user2 = " + request.params.iduser;
                database.query(query, function (err, resLikes) {
                    if (err) throw err;
                    
                    response.render('profile.ejs', {
                        id_user: request.session.user.id_user,
                        same_id: request.session.user.id_user == request.params.iduser,
                        liked: resLikes.length != 0,
                        firstname: resName[0].firstname,
                        lastname: resName[0].lastname,
                        country: resName[0].country,
                        age: age(resName[0].birthdate),
                        sex: resName[0].sex,
                        description: resName[0].description,
                        interests: resInterests,
                        search_results: []
                    });
                })
            })
        }
    });
});


server.get('/profile/:iduser/change', function (request, response) {
    let query = `SELECT * FROM User WHERE user.id_user = ?
    ; SELECT name, degree FROM Appreciate a 
    JOIN Interest i ON a.id_interest = i.id_interest
    WHERE a.id_user = ?`;
    database.query(query, [request.params.iduser, request.params.iduser], function (err, result) {
        if (err) throw err;
        response.render('changeprofile.ejs', { infos: result[0][0], interests: result[1] });
    });
});

server.post('/profile/add_ci', function (request, response) {

    //On regarde si le centre d'intérêt à ajouter est déjà en BDD
    let id_ci;
    const query_is_new_ci = "SELECT id_interest FROM Interest WHERE name LIKE '%" + request.body.name + "%'";
    database.query(query_is_new_ci, function (err, res) {
        if (err) throw err;
        // Si le centre d'intérêt n'est pas en BDD dans la table Interest, alors on l'ajoute
        if (!res) {
            const query_new_id_ci = "INSERT INTO Interest (name) VALUES ('" + request.body.name + "')";
            database.query(query_new_id_ci, function (err, res_new_id_ci) {
                if (err) throw err;
                id_ci = res_new_id_ci.insertId;
            })
        } else {
            id_ci = res[0].id_interest;
        }

        //S'il y est déjà, alors on passe à la requête suivante
        // On ajoute le centre d'intérêt dans la table Appreciate

        const query_new_app = "INSERT INTO Appreciate (id_user, id_interest, degree) VALUES (" + request.session.user.id_user + ", " + id_ci + ", " + request.body.degree + ")";

        database.query(query_new_app, async function (err, resultF) {
            if (err) throw err;
            if (!resultF) {
                response.send("Pas de centre d'intérêt à ajouter");
            }
            else {
                response.status(200).send("L'ajout de ce centre d'intérêt (id : " + resultF.insertId + ") est enregistré");
            }
        })
    })
});

server.post('/profile/remove_ci', function (request, response) {
    const query_id_cat = "SELECT id_interest FROM Interest WHERE name LIKE '%" + request.body.deleted_ci + "%'";
    database.query(query_id_cat, async function (err, res_id_cat) {
        if (err) throw err;
        const query_delete = "DELETE FROM Appreciate WHERE id_user = " + request.session.user.id_user + " AND id_interest = '" + res_id_cat[0].id_interest + "'";
        database.query(query_delete, function (err, resultF) {
            if (err) throw err;
            if (!resultF) {
                response.send("Pas de centre d'intérêt à supprimer");
            }
            else {
                response.status(200).send("La suppression de ce centre d'intérêt (id : " + resF.insertId + ") est enregistrée.");
            }
        })
    })
});

server.get("/profile/likestatus/:otherid/:oldval", function (request, response) {
    function get_query(request) {
        if (request.params.oldval == "true") {
            return "DELETE FROM Matching WHERE id_user1 = " + request.session.user.id_user + " AND id_user2 = " + request.params.otherid;
        } else {
            return "INSERT INTO Matching (id_user1, id_user2) VALUES (" + request.session.user.id_user + ", " + request.params.otherid + ")";
        }
    }
    database.query(get_query(request), function (err, res) {
        if (err) {
            if (err.code == "'ER_DUP_ENTRY")
                response.send({liked: request.params.oldval})
        } else {
            const newval = request.params.oldval == "true" ? "false" : "true";
            response.send({liked: newval})
        }
    })
});

server.post("/description/modify", function (request, response) {
    const query = "UPDATE User SET description = '" + request.body.description + "' WHERE id_user = " + request.session.user.id_user;
    database.query(query, function (err, res) {
        if (err) throw err;
        response.sendStatus(200)
    })
});

server.get('/search', async function (request, response) {
    async function get_query(req) {
        if (req.query.category == 'person') {
            return "SELECT Column_name as category FROM INFORMATION_SCHEMA.COLUMNS where table_name = 'User' AND Column_name not in ('id_user', 'password')"
        } else if (req.query.category == 'interest') {
            return "SELECT distinct(category) FROM Interest"
        } else return "";
    }
    if (request.query.category) {
        database.query(await get_query(request), async function (err, res_cat) {
            if (err) throw err;
            const age_index = await res_cat.findIndex(elt => elt.category == 'birthdate')

            if (age_index != -1) {
                res_cat[age_index] = { category: 'age' };
            }

            response.status(200).send({
                categories: await res_cat, // liste de RowDataPacket
                id_user: request.session.user.id_user,
                search_results: []
            });
        });
    } else {
        response.render('search.ejs', {
            id_user: request.session.user.id_user,
            categories: [],
            search_results: []
        })
    }
});

server.post('/search', async function (request, response) {
    async function get_query(request) {
        if (request.body.category == 'interest') {
            return `SELECT a.id_user, u.firstname, u.lastname, a.id_interest, i.category, i.name, a.degree 
            FROM Appreciate as a 
            INNER JOIN Interest as i ON i.id_interest = a.id_interest 
            INNER JOIN User as u ON a.id_user = u.id_user 
            WHERE i.category = '` + request.body.name + "' AND i.name LIKE '%" + request.body.input + "%' AND a.id_user <> '" + request.session.user.id_user + "'";
        } else { // request.body.category == 'person'
            if (request.body.name != 'age') {
                return "SELECT id_user, firstname, lastname, " + request.body.name + " FROM User WHERE " + request.body.name + " LIKE '%" + request.body.input + "%' AND id_user <> " + request.session.user.id_user;
            } else {
                function sign_to_symbol(sign) {
                    if (sign == "lt") return "<";
                    else if (sign == "eq") return "=";
                    else return ">";
                }
                return "SELECT id_user, firstname, lastname, birthdate, age(birthdate) FROM User WHERE age(birthdate) " + sign_to_symbol(request.body.sign) + " " + request.body.year + " AND id_user <> " + request.session.user.id_user;
            }
        }
    }
    if (request.body.year) {
        database.query(await get_query(request), async function (err, results) {
            if (err) throw err;
            results.map((elt) => { elt.year = age(elt.birthdate) });
            response.send({
                id_user: request.session.user.id_user,
                query_category: request.body.category,
                query_name: request.body.name,
                query_sign: request.body.sign,
                query_year: request.body.year,
                search_results: await results
            })
        })
    } else {
        database.query(await get_query(request), async function (err, results) {
            if (err) throw err;
            response.send({
                id_user: request.session.user.id_user,
                query_category: request.body.category,
                query_name: request.body.name,
                query_input: request.body.input,
                search_results: await results
            })
        })
    }
});

server.get('/about', function (request, response) {
    if (request.session.user) {
        response.render('about.ejs', { id_user: request.session.user.id_user });
    } else {
        response.render('about.ejs', { id_user: null });
    }
});

server.get('/contact', function (request, response) {
    if (request.session.user) {
        response.render('contact.ejs', { id_user: request.session.user.id_user });
    } else {
        response.render('contact.ejs', { id_user: null });
    }
});

server.get('/logout', function (request, response) {
    request.session.user = null
    response.render('home.ejs', { id_user: null });
});

server.get('message/:id_user', function (request, response) {
    response.render('message.ejs', { id_user: request.session.user.id_user })
})

server.use(function (request, response) {
    response.send('On another page.');
});

// Gestion du shutdown du routeur avec la commande CTRL-C
process.on('SIGINT', function () {
    database.end();
    process.exit();
});