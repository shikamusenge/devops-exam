// server.js
import express from 'express';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize SQLite database
const db = new sqlite3.Database('./family_members.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS families (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_name TEXT NOT NULL,
        sector TEXT NOT NULL DEFAULT 'Kibungo'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        family_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        relationship TEXT NOT NULL,
        FOREIGN KEY(family_id) REFERENCES families(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS performance_duties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER,
        family_id INTEGER,
        duty TEXT NOT NULL,
        status TEXT DEFAULT 'Pending',
        FOREIGN KEY(member_id) REFERENCES members(id),
        FOREIGN KEY(family_id) REFERENCES families(id)
    )`);
});

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'DUHIGURE MU MIRYANGO API is running' });
});

// ========== FAMILY ROUTES ==========

// Get all families
app.get('/families', (req, res) => {
    db.all(`SELECT * FROM families ORDER BY family_name`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get a family by ID
app.get('/families/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM families WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Family not found' });
        res.json(row);
    });
});

// Create a new family
app.post('/families', (req, res) => {
    const { family_name, sector } = req.body;

    if (!family_name) {
        return res.status(400).json({ error: 'Family name is required' });
    }

    const insertFamily = `INSERT INTO families (family_name, sector) VALUES (?, ?)`;
    db.run(insertFamily, [family_name, sector || 'Kibungo'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ 
            message: 'Family created successfully', 
            family_id: this.lastID 
        });
    });
});

// Update a family
app.put('/families/:id', (req, res) => {
    const { id } = req.params;
    const { family_name, sector } = req.body;

    db.run(
        `UPDATE families SET family_name = ?, sector = ? WHERE id = ?`,
        [family_name, sector || 'Kibungo', id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Family not found' });
            res.json({ message: 'Family updated successfully' });
        }
    );
});

// Delete a family (and all related members and duties)
app.delete('/families/:id', (req, res) => {
    const { id } = req.params;

    // First delete all duties related to this family
    db.run(`DELETE FROM performance_duties WHERE family_id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        // Then delete all members of this family
        db.run(`DELETE FROM members WHERE family_id = ?`, [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Finally delete the family
            db.run(`DELETE FROM families WHERE id = ?`, [id], function(err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Family not found' });
                res.json({ message: 'Family and all related data deleted successfully' });
            });
        });
    });
});

// ========== MEMBER ROUTES ==========

// Get all members
app.get('/members', (req, res) => {
    db.all(`SELECT * FROM members ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get members by family
app.get('/members/family/:family_id', (req, res) => {
    const { family_id } = req.params;
    db.all(`SELECT * FROM members WHERE family_id = ? ORDER BY name`, [family_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get a member by ID
app.get('/members/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM members WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Member not found' });
        res.json(row);
    });
});

// Create a new member with optional performance duties
app.post('/members', (req, res) => {
    const { family_id, name, email, phone, relationship, performanceDuties } = req.body;

    if (!family_id || !name || !email || !phone || !relationship) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const insertMember = `INSERT INTO members (family_id, name, email, phone, relationship) VALUES (?, ?, ?, ?, ?)`;
    db.run(insertMember, [family_id, name, email, phone, relationship], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        const memberId = this.lastID;

        if (performanceDuties && performanceDuties.length > 0) {
            const insertDuty = `INSERT INTO performance_duties (member_id, family_id, duty) VALUES (?, ?, ?)`;
            performanceDuties.forEach(duty => {
                db.run(insertDuty, [memberId, family_id, duty]);
            });
        }

        res.status(201).json({ 
            message: 'Member created successfully', 
            member_id: memberId 
        });
    });
});

// Update a member
app.put('/members/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, relationship } = req.body;

    db.run(
        `UPDATE members SET name = ?, email = ?, phone = ?, relationship = ? WHERE id = ?`,
        [name, email, phone, relationship, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Member not found' });
            res.json({ message: 'Member updated successfully' });
        }
    );
});

// Delete a member and their duties
app.delete('/members/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM performance_duties WHERE member_id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        db.run(`DELETE FROM members WHERE id = ?`, [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Member not found' });
            res.json({ message: 'Member and related duties deleted successfully' });
        });
    });
});

// ========== DUTY ROUTES ==========

// Get all duties
app.get('/duties', (req, res) => {
    db.all(`SELECT * FROM performance_duties ORDER BY id DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get all performance duties for a family
app.get('/duties/family/:family_id', (req, res) => {
    const { family_id } = req.params;
    db.all(`SELECT * FROM performance_duties WHERE family_id = ?`, [family_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get duties for a specific member
app.get('/duties/member/:member_id', (req, res) => {
    const { member_id } = req.params;
    db.all(`SELECT * FROM performance_duties WHERE member_id = ?`, [member_id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Get a duty by ID
app.get('/duties/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM performance_duties WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Duty not found' });
        res.json(row);
    });
});

// Create a new duty
app.post('/duties', (req, res) => {
    const { family_id, member_id, duty, status } = req.body;

    if (!family_id || !duty) {
        return res.status(400).json({ error: 'Family ID and duty description are required' });
    }

    const insertDuty = `INSERT INTO performance_duties (family_id, member_id, duty, status) VALUES (?, ?, ?, ?)`;
    db.run(insertDuty, [family_id, member_id || null, duty, status || 'Pending'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ 
            message: 'Duty assigned successfully', 
            duty_id: this.lastID 
        });
    });
});

// Update duty status
app.put('/duties/:id', (req, res) => {
    const { id } = req.params;
    const { duty, status } = req.body;

    db.run(
        `UPDATE performance_duties SET duty = ?, status = ? WHERE id = ?`,
        [duty, status || 'Pending', id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Duty not found' });
            res.json({ message: 'Duty updated successfully' });
        }
    );
});

// Delete a duty
app.delete('/duties/:id', (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM performance_duties WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Duty not found' });
        res.json({ message: 'Duty deleted successfully' });
    });
});

// ========== STATISTICS ROUTES ==========

// Get dashboard statistics
app.get('/stats', (req, res) => {
    const stats = {};

    db.get(`SELECT COUNT(*) as count FROM families`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalFamilies = row.count;

        db.get(`SELECT COUNT(*) as count FROM members`, [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.totalMembers = row.count;

            db.get(`SELECT COUNT(*) as count FROM performance_duties`, [], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.totalDuties = row.count;

                db.get(`SELECT COUNT(*) as count FROM performance_duties WHERE status = 'Pending'`, [], (err, row) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.pendingDuties = row.count;

                    res.json(stats);
                });
            });
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available:`);
    console.log(`  - GET    /families`);
    console.log(`  - POST   /families`);
    console.log(`  - GET    /members`);
    console.log(`  - POST   /members`);
    console.log(`  - GET    /duties`);
    console.log(`  - POST   /duties`);
    console.log(`  - GET    /stats`);
});