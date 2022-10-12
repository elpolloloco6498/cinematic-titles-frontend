const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const path = require('path');

const directoryFonts = path.join(__dirname, 'public/fonts');
const directoryMaterials = path.join(__dirname, 'public/materials');

//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get('/get_fonts', (req, res) => {
    fs.readdir(directoryFonts, (err, files)=> {
        if (err) {
            console.log('unable to load directory');
        }
        res.json({"fonts": files});
    })
});

app.get('/get_materials', (req, res) => {
    fs.readdir(directoryMaterials, (err, files)=> {
        if (err) {
            console.log('unable to load directory');
        }
        res.json({"materials": files});
    })
});

app.listen(port, ()=> {
    console.log(`Listening on port ${port}`)
});