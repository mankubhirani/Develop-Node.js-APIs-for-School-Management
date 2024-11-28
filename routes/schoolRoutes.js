const express = require('express');
const router = express.Router();
const db = require('../db');

// Add School API
router.post('/addSchool', async (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const query = `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`;
        await db.execute(query, [name, address, latitude, longitude]);
        res.status(201).json({ message: 'School added successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Database error.', error });
    }
});

// List Schools API
router.get('/listSchools', async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'User coordinates are required.' });
    }

    try {
        const query = `SELECT id, name, address, latitude, longitude FROM schools`;
        const [schools] = await db.execute(query);

        const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371;
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLon = (lon2 - lon1) * (Math.PI / 180);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const sortedSchools = schools.map(school => ({
            ...school,
            distance: calculateDistance(latitude, longitude, school.latitude, school.longitude),
        })).sort((a, b) => a.distance - b.distance);

        res.json(sortedSchools);
    } catch (error) {
        res.status(500).json({ message: 'Database error.', error });
    }
});

module.exports = router; // Ensure you export the router
