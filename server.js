const express = require('express');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = require('http').createServer(app);
const WebSocket = require('ws');

app.use(express.json());

const wss =  new WebSocket.Server({ server: server });

// wss.on('connection', function connection(ws) {
//     ws.on('message', function message(data, isBinary) {
//         wss.clients.forEach(function each(client) {
//             if (client !== ws && client.readyState === WebSocket.OPEN) {
//                 console.log('client connected', data);
//                 client.send(data, {binary: isBinary});
//             }
//         })
//     })
// })

let i = 0;


wss.on('connection', function connection(ws) {
    i++;
    let message = '';
    ws.on('message', function incoming(message) {
        console.log(`server received: ${message}`);
        message = message;
    });
    ws.send(JSON.stringify(`Received your message: ${message} from connection ${i}`));
});

app.get('/', (req, res) => {
    
})
app.get('/Currencies', (req, res) => {
    
})
app.get('/ETH-USD', (req, res) => {
    
})

app.get('/Account', (req, res) => {
    
})

server.listen(PORT, () => {
    console.log(`APP IS LISTENING ON PORT ${PORT}`);
})