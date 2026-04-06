var knex = require('knex')({
   client: 'sqlite3',
   connection: {
       filename: "./db.sqlite3"
   },
   debug: true,
});

/* async function create_table_users() {
    await knex.raw(`
        DROP TABLE IF EXISTS users;
        `)
    await knex.raw(`
        CREATE TABLE users (
            user VARCHAR(255) PRIMARY KEY,
            pass VARCHAR(255) NOT NULL
        );
        `);

    // ce qui suit peut être supprimé, c'est pour le debug + ajout de lignes
    const info = await knex('users').columnInfo();
    console.log(info);
    await knex.raw(`INSERT INTO users VALUES ('admin', 'admin');`);
    await knex.raw(`INSERT INTO users VALUES ('ilolo', 'abc');`);
    var rows = await knex.raw(`
        SELECT * FROM users;
        `);
    console.log(rows);
}

async function create_table_messages() {
    await knex.raw(`
        DROP TABLE IF EXISTS messages;
        `);
    // AUTOINCREMENT pour SqlLite, AUTO_INCREMENT pour MySQL
    await knex.raw(`
        CREATE TABLE messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            author VARCHAR(255) NOT NULL,
            text VARCHAR(280),
            CONSTRAINT fk FOREIGN KEY (author) REFERENCES users(user)
        );
        `);
    
    // ce qui suit peut être supprimé, c'est pour le debug + ajout de lignes
    const info = await knex('messages').columnInfo();
    console.log(info);
    await knex.raw(`INSERT INTO messages (author, text) VALUES ('admin', 'Bonjour');`);
    await knex.raw(`INSERT INTO messages (author, text) VALUES ('ilolo', 'Heyy');`);
    var rows = await knex.raw(`
        SELECT * FROM messages;
        `);
    console.log(rows);
}
async function create_table_privatemessages(){
    await knex.raw(`
        DROP TABLE IF EXISTS privatemessages;
        `);
    // AUTOINCREMENT pour SqlLite, AUTO_INCREMENT pour MySQL
    await knex.raw(`
        CREATE TABLE privatemessages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            sender VARCHAR(255) NOT NULL,
            receiver VARCHAR(255) NOT NULL,
            text VARCHAR(280),
            CONSTRAINT fk_sender FOREIGN KEY (sender) REFERENCES users(user),
            CONSTRAINT fk_receiver FOREIGN KEY (receiver) REFERENCES users(user)
        );
        `);
    
    // ce qui suit peut être supprimé, c'est pour le debug + ajout de lignes
    const info = await knex('privatemessages').columnInfo();
    console.log(info);
    await knex.raw(`INSERT INTO privatemessages (sender,receiver, text) VALUES ('admin','ilolo', 'Bonjour');`);
    var rows = await knex.raw(`
        SELECT * FROM messages;
        `);
    console.log(rows);
} */
async function initDB() {
    await knex.raw(`
        DROP TABLE IF EXISTS users;
        `)
    await knex.raw(`
        CREATE TABLE users (
            user VARCHAR(255) PRIMARY KEY,
            pass VARCHAR(255) NOT NULL
        );
        `);

    // ce qui suit peut être supprimé, c'est pour le debug + ajout de lignes
    await knex.raw(`INSERT INTO users VALUES ('admin', 'admin');`);
    await knex.raw(`INSERT INTO users VALUES ('ilolo', 'abc');`);
    var rows = await knex.raw(`
        SELECT * FROM users;
        `);
    console.log(rows);
    await knex.raw(`
        DROP TABLE IF EXISTS messages;
        `);
    // AUTOINCREMENT pour SqlLite, AUTO_INCREMENT pour MySQL
    await knex.raw(`
        CREATE TABLE messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            author VARCHAR(255) NOT NULL,
            text VARCHAR(280),
            CONSTRAINT fk FOREIGN KEY (author) REFERENCES users(user)
        );
        `);
    
    // ce qui suit peut être supprimé, c'est pour le debug + ajout de lignes
    await knex.raw(`INSERT INTO messages (author, text) VALUES ('admin', 'Bonjour');`);
    await knex.raw(`INSERT INTO messages (author, text) VALUES ('ilolo', 'Heyy');`);
    var rows = await knex.raw(`
        SELECT * FROM messages;
        `);
    console.log(rows);
    await knex.raw(`
        DROP TABLE IF EXISTS privatemessages;
        `);
    // AUTOINCREMENT pour SqlLite, AUTO_INCREMENT pour MySQL
    await knex.raw(`
        CREATE TABLE privatemessages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            sender VARCHAR(255) NOT NULL,
            receiver VARCHAR(255) NOT NULL,
            text VARCHAR(280),
            CONSTRAINT fk_sender FOREIGN KEY (sender) REFERENCES users(user),
            CONSTRAINT fk_receiver FOREIGN KEY (receiver) REFERENCES users(user)
        );
        `);
    await knex.raw(`INSERT INTO privatemessages (sender,receiver, text) VALUES ('admin','ilolo', 'Bonjour');`);
    var rows = await knex.raw(`
        SELECT * FROM messages;
        `);
    console.log(rows);
    await knex.destroy();


}
initDB(); 