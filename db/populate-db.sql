-- Remplissage de la base de données --

-- Donnees factices crées manuellement

-- Table Users -- 
-- Table Interest -- 
-- Table Appreciate -- 
-- Table Matching -- 

INSERT INTO User(email, password, firstname, lastname, birthdate, country, sex)
VALUES 
('atest@gm.fr', 'atest', 'Amelie', 'Dongon', str_to_date('23-05-1990', '%d-%m-%Y'), 'France', 'Feminin'),
('btest@gm.fr', 'btest', 'Berangere', 'Droteur', str_to_date('10-05-1995', '%d-%m-%Y'), 'France', 'Feminin'),
('ctest@gm.fr', 'ctest', 'Cornell', 'Rapack', str_to_date('04-05-1998', '%d-%m-%Y'), 'Belgique', 'Masculin'),
('dtest@gm.fr', 'dtest', 'Dani', 'Craw', str_to_date('20-01-1990', '%d-%m-%Y'), 'Canada', 'Feminin'),
('etest@gm.fr', 'etest', 'Elisa', 'Mercuri', str_to_date('11-08-1990', '%d-%m-%Y'), 'France', 'Feminin');

INSERT INTO Interest(name, category) VALUES
('française', 'cuisine'), ('americaine', 'cuisine'), ('asiatique', 'cuisine'),
('romance', 'cinema'), ('drame', 'cinema'),
('contemporaine', 'danse'), ('hip-hop', 'danse'), ('orientale', 'danse'), 
('classique', 'musique'), ('française', 'musique'), ('rock', 'musique'), ('variété', 'musique'),
('basket-ball', 'sport'), ('football', 'sport'), ('gymnastique', 'sport'), ('natation', 'sport'), ('volley-ball', 'sport');

INSERT INTO Appreciate(id_user, id_interest, degree) VALUES
(1, 1, 5), (1, 3, 4),
(2, 8, 3), (2, 10, 3),
(3, 5, 5), (3, 13, 5), (3, 16, 4), 
(4, 5, 4);

INSERT INTO Matching(id_user1, id_user2) VALUES
(3, 4)