const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve all static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));


// Serve the JSON file for the RNBO library
app.get('/backend.export.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'backend.export.json'));
});




wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        const stringMessage = message.toString();
        const data = JSON.parse(stringMessage);
        
        if (data.type === 'client2') {
            console.log('Data from client2:', stringMessage);
        } else if (data.type === 'mainClient') {
            console.log('Data from main client:', stringMessage);
        } else {
            console.log('Received:', stringMessage);
        }

        // Broadcast the message to all clients, excluding the sender
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(stringMessage);
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(8080, () => {
    console.log('Server started on http://localhost:8080');
});
