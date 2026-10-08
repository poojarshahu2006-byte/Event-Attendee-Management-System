const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database/events.db", (err) => {
    if (err) {
        console.error("Database error:", err.message);
    } else {
        console.log("SQLite database connected");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        event_date TEXT NOT NULL,
        venue TEXT NOT NULL
    )
`);

db.run(`
    CREATE TABLE IF NOT EXISTS attendees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        ticket_type TEXT NOT NULL,
        event_id INTEGER NOT NULL,
        FOREIGN KEY(event_id) REFERENCES events(id)
    )
`);

module.exports = db;