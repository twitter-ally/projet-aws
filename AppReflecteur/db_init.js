var knex = require('knex')({
   client: 'sqlite3',
   connection: {
       filename: "./db.sqlite3"
   },
   debug: true,
});

async function create_table_users() {
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
    await knex.destroy();
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
    await knex.destroy();
}

create_table_users();
create_table_messages();