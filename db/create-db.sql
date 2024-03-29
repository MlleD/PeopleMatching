-- Ce fichier permet de créer tables et index --

-- Création des tables, des index --

CREATE TABLE IF NOT EXISTS User
(
    id_user INT AUTO_INCREMENT,
    email VARCHAR(127) NOT NULL,
    password VARCHAR(127) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    birthdate DATE NOT NULL,
    country VARCHAR(255) NOT NULL,
    sex VARCHAR(10) NOT NULL,
    description VARCHAR(1000),

    CONSTRAINT PK_User PRIMARY KEY (id_user),
    -- pas nom/prénom pour prendre en compte les homonymes
    CONSTRAINT U_User UNIQUE (email)
);

-- optimisation pour la connexion/inscription
CREATE INDEX I_User ON User(email);


-- Centres d'intérêt --
CREATE TABLE IF NOT EXISTS Interest
(
    id_interest INT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) DEFAULT 'aucun',
    CONSTRAINT PK_Interest PRIMARY KEY (id_interest),
    CONSTRAINT U_Interest UNIQUE (name, category)
);

-- Appréciation d'un utilisateur avec un centre d'intérêt
-- avec une certaine intensité --
CREATE TABLE IF NOT EXISTS Appreciate
(
    id_user INT NOT NULL,
    id_interest INT NOT NULL,
    degree INT NOT NULL,
    CONSTRAINT FK_Appreciate_Id_User FOREIGN KEY (id_user) REFERENCES User(id_user),
    CONSTRAINT FK_Appreciate_Id_Interest FOREIGN KEY (id_interest) REFERENCES Interest(id_interest),
    CONSTRAINT PK_Appreciate PRIMARY KEY (id_user, id_interest)
);

-- Matching entre deux utilisateurs --
CREATE TABLE IF NOT EXISTS Matching
(
    id_user1 INT NOT NULL,
    id_user2 INT NOT NULL,
    CONSTRAINT FK_Matching_Id_User1 FOREIGN KEY (id_user1) REFERENCES User(id_user),
    CONSTRAINT FK_Matching_Id_User2 FOREIGN KEY (id_user2) REFERENCES User(id_user),
    CONSTRAINT U_Matching UNIQUE (id_user1, id_user2),
    CHECK (id_user1 != id_user2)
);

-- Photos des utilisateurs --
CREATE TABLE IF NOT EXISTS Photo
(
    id_photo INT AUTO_INCREMENT,
    id_user INT NOT NULL,
    date DATETIME DEFAULT NOW(),
    link VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,

    CONSTRAINT FK_Photo_Id_User FOREIGN KEY (id_user) REFERENCES User(id_user),
    CONSTRAINT PK_Photo PRIMARY KEY (id_photo)
);

-- Messages entre contacts --
CREATE TABLE IF NOT EXISTS Message
(
    id_message INT AUTO_INCREMENT,
    id_user_from INT NOT NULL,
    id_user_to INT NOT NULL,
    date DATETIME DEFAULT NOW(),
    text VARCHAR(255) NOT NULL,

    CONSTRAINT FK_Message_Id_User_To FOREIGN KEY (id_user_to) REFERENCES User(id_user),
    CONSTRAINT FK_Message_Id_User_From FOREIGN KEY (id_user_from) REFERENCES User(id_user),
    CONSTRAINT PK_Message PRIMARY KEY (id_message)
);