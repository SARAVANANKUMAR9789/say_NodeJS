const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Endpoint to create a text file with current timestamp
app.get('/', (req, res) => {
    const timestamp = new Date().toISOString();
    const filename = timestamp.replace(/:/g, '-') + '.txt';
    const filePath = path.join(__dirname, 'files', filename);

    fs.writeFile(filePath, timestamp,"utf8", (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Failed to create file');
            return;
        }
        console.log('File created:', filename);
        res.send('File created: ' + filename);
    });
});

// Endpoint to retrieve all text files in the folder
app.get('/get', (req, res) => {
    const folderPath = path.join(__dirname, 'files');

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).send('Failed to retrieve files');
            return;
        }
        const textFiles = files.filter(file => file.endsWith('.txt'));
        res.json(textFiles);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
