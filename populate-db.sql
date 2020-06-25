-- Création des tables --

CREATE TABLE IF NOT EXISTS Users
(
    id_user INT NOT NULL UNIQUE AUTO_INCREMENT,
    email VARCHAR(127) NOT NULL,
    password VARCHAR(127) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255)NOT NULL,
    birthdate DATE,
    country VARCHAR(255),

    CONSTRAINT PK_User PRIMARY KEY (id_user),
    -- pas nom/prénom pour prendre en compte les homonymes
    CONSTRAINT U_User UNIQUE (email)
)

CREATE TABLE IF NOT EXISTS Interest
(
    id_interest INT NOT NULL UNIQUE AUTO_INCREMENT,
    name VARCHAR(255),
    category VARCHAR(255),
    CONSTRAINT PK_Interest PRIMARY KEY (id_interest),
    CONSTRAINT U_Interest UNIQUE (name, category)
)

CREATE TABLE IF NOT EXISTS Appreciate
(
    id_user INT,
    id_interest INT,
    degree INT,
    CONSTRAINT FK_Appreciate_Id_User FOREIGN KEY (id_user) REFERENCES Login(id_user),
    CONSTRAINT FK_Appreciate_Id_Interest FOREIGN KEY (id_interest) REFERENCES Interest(id_interest),
    CONSTRAINT U_Appreciate UNIQUE (id_user, id_interest)
)

CREATE TABLE IF NOT EXISTS Matching
(
    id_user1 INT
    id_user2 INT,
    CONSTRAINT FK_Matching_Id_User1 FOREIGN KEY (id_user1) REFERENCES Login(id_user),
    CONSTRAINT FK_Matching_Id_User2 FOREIGN KEY (id_user2) REFERENCES Login(id_user),
    CONSTRAINT U_Matching UNIQUE (id_user1, id_user2),
    CHECK (id_user1 < id_user2)
)
