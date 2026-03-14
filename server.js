const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'donations.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve index.html and assets

// Load donations from file or return empty array
const loadDonations = () => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error reading donations:', err);
    }
    return [];
};

// Save donations to file
const saveDonations = (donations) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(donations, null, 2), 'utf8');
    } catch (err) {
        console.error('Error saving donations:', err);
    }
};

// Get all donations
app.get('/api/donations', (req, res) => {
    const donations = loadDonations();
    res.json(donations);
});

// Add a new donation
app.post('/api/donations', (req, res) => {
    const { name, amount, date } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    const donations = loadDonations();
    const newDonation = {
        name: name || 'Anonymous Angel',
        amount: parseInt(amount),
        date: date || new Date().toISOString()
    };
    
    donations.push(newDonation);
    saveDonations(donations);
    
    res.status(201).json(newDonation);
});

// Reset all donations
app.post('/api/donations/reset', (req, res) => {
    saveDonations([]);
    res.json({ message: 'Donations reset successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
