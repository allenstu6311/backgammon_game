const {  
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
 } = require('./myModule');

const configureSocket = require('./WebSocket');
configureSocket(server)//配置socket io
app.use(express.static(__dirname + '/'))
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // 设置模板文件的目录
app.use(bodyParser.json());



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
    // console.log(`server running at http://${getLocalIpAddress()}:3000`);
    console.log(`server running at http://localhost:3000`)
});