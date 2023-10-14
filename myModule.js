const express = require("express")
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');
const fs = require('fs')
const os = require('os')
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');//隨機產生密鑰
const path = require('path');
const bodyParser = require('body-parser');
const app = express()
const server = createServer(app);

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



module.exports = {
    express,
    app,
    server,
    path,
    bodyParser,
    os,
    fs,
    jwt,
    uuidv4,
    Server,
    join,
    getLocalIpAddress
}