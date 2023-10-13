const express = require("express")
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');
const fs = require('fs')
const os = require('os')
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');//隨機產生密鑰
const configureSocket = require('./WebSocket'); 
const path = require('path');

const bodyParser = require('body-parser');

const app = express()
const server = createServer(app);
configureSocket(server)//配置socket io
app.use(express.static(__dirname + '/'))
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // 设置模板文件的目录
app.use(bodyParser.json());

// 取得ip位置
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    const addresses = [];

    Object.keys(interfaces).forEach((ifname) => {
        interfaces[ifname].forEach((iface) => {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                return;
            }
            addresses.push(iface.address);
        });
    });

    return addresses.join('');
}

app.get('/', (req, res) => {
    res.send(`<a href='/game2.html'>game</a>`)
});

// app.get('/game2.html', (req, res) => {
//     res.sendFile(join(__dirname, 'game2.html'));
// });

app.get('/home.html/:token', (req, res) => {
    const frontendFilePath = path.join(__dirname, 'home.html');
    
    fs.readFile(frontendFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading frontend file');
            return;
        }
        res.send(data)
    });
});



server.listen(3000, () => {
    console.log(`server running at http://${getLocalIpAddress()}:3000`);
});