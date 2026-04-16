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
}

async function create_table_messages() {
    await knex.raw(`
        DROP TABLE IF EXISTS messages;
        `);
    await knex.raw(`
        CREATE TABLE messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            author VARCHAR(255) NOT NULL,
            text VARCHAR(280),
            CONSTRAINT fk FOREIGN KEY (author) REFERENCES users(user)
        );
        `);
}
async function create_table_privatemessages(){
    await knex.raw(`
        DROP TABLE IF EXISTS privatemessages;
        `);
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
}

async function initDB() {
    await create_table_users();
    await create_table_messages();
    await create_table_privatemessages();
    await knex.destroy();
}

initDB();