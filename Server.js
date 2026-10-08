const express = require("express");
const path = require("path");
const db = require("./database/db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// =====================================
// GET EVENTS
// =====================================

app.get("/api/events", (req, res) => {
    const sql = `
        SELECT 
            events.id,
            events.event_name,
            events.event_date,
            events.venue,
            COUNT(attendees.id) AS registered
        FROM events
        LEFT JOIN attendees
        ON events.id = attendees.event_id
        GROUP BY events.id
        ORDER BY events.event_date ASC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                message: "Unable to load events"
            });
        }

        res.json(rows);
    });
});

// =====================================
// ADD EVENT
// =====================================

app.post("/api/events", (req, res) => {

    const {
        event_name,
        event_date,
        venue
    } = req.body;

    if (!event_name || !event_date || !venue) {
        return res.status(400).json({
            message: "Please fill all event fields"
        });
    }

    const sql = `
        INSERT INTO events
        (event_name, event_date, venue)
        VALUES (?, ?, ?)
    `;

    db.run(
        sql,
        [event_name, event_date, venue],
        function(err) {

            if (err) {
                return res.status(500).json({
                    message: "Failed to add event"
                });
            }

            res.json({
                message: "Event added successfully",
                id: this.lastID
            });
        }
    );
});

// =====================================
// UPDATE EVENT
// =====================================

app.put("/api/events/:id", (req, res) => {

    const id = req.params.id;

    const {
        event_name,
        event_date,
        venue
    } = req.body;

    if (!event_name || !event_date || !venue) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    const sql = `
        UPDATE events
        SET event_name = ?,
            event_date = ?,
            venue = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [event_name, event_date, venue, id],
        function(err) {

            if (err) {
                return res.status(500).json({
                    message: "Update failed"
                });
            }

            res.json({
                message: "Event updated successfully"
            });
        }
    );
});

// =====================================
// DELETE EVENT
// =====================================

app.delete("/api/events/:id", (req, res) => {

    const id = req.params.id;

    db.get(
        "SELECT COUNT(*) AS count FROM attendees WHERE event_id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (result.count > 0) {
                return res.status(400).json({
                    message:
                        "Cannot delete event because attendees are registered"
                });
            }

            db.run(
                "DELETE FROM events WHERE id = ?",
                [id],
                function(err) {

                    if (err) {
                        return res.status(500).json({
                            message: "Delete failed"
                        });
                    }

                    res.json({
                        message: "Event deleted successfully"
                    });
                }
            );
        }
    );
});

// =====================================
// GET ATTENDEES
// =====================================

app.get("/api/attendees", (req, res) => {

    const sql = `
        SELECT
            attendees.id,
            attendees.name,
            attendees.email,
            attendees.ticket_type,
            attendees.event_id,
            events.event_name
        FROM attendees
        JOIN events
        ON attendees.event_id = events.id
        ORDER BY attendees.id DESC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                message: "Unable to load attendees"
            });
        }

        res.json(rows);
    });
});

// =====================================
// REGISTER ATTENDEE
// =====================================

app.post("/api/attendees", (req, res) => {

    const {
        name,
        email,
        ticket_type,
        event_id
    } = req.body;

    if (!name || !email || !ticket_type || !event_id) {
        return res.status(400).json({
            message: "Please fill all attendee fields"
        });
    }

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return res.status(400).json({
            message: "Please enter a valid email"
        });
    }

    db.get(
        `
        SELECT id FROM attendees
        WHERE email = ? AND event_id = ?
        `,
        [email, event_id],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (row) {
                return res.status(400).json({
                    message:
                        "This attendee is already registered"
                });
            }

            const sql = `
                INSERT INTO attendees
                (name, email, ticket_type, event_id)
                VALUES (?, ?, ?, ?)
            `;

            db.run(
                sql,
                [name, email, ticket_type, event_id],
                function(err) {

                    if (err) {
                        return res.status(500).json({
                            message: "Registration failed"
                        });
                    }

                    res.json({
                        message:
                            "Attendee registered successfully"
                    });
                }
            );
        }
    );
});

// =====================================
// SEARCH ATTENDEES
// =====================================

app.get("/api/attendees/search", (req, res) => {

    const q = req.query.q || "";
    const keyword = `%${q}%`;

    const sql = `
        SELECT
            attendees.id,
            attendees.name,
            attendees.email,
            attendees.ticket_type,
            events.event_name
        FROM attendees
        JOIN events
        ON attendees.event_id = events.id
        WHERE attendees.name LIKE ?
        OR attendees.email LIKE ?
        OR events.event_name LIKE ?
        ORDER BY attendees.id DESC
    `;

    db.all(
        sql,
        [keyword, keyword, keyword],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    message: "Search failed"
                });
            }

            res.json(rows);
        }
    );
});

// =====================================
// DELETE ATTENDEE
// =====================================

app.delete("/api/attendees/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM attendees WHERE id = ?",
        [id],
        function(err) {

            if (err) {
                return res.status(500).json({
                    message: "Delete failed"
                });
            }

            res.json({
                message: "Attendee deleted successfully"
            });
        }
    );
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});