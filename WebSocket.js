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
//配置socket io
function configureSocket(server) {
    const io = new Server(server);

    io.on('connection', (socket) => {
        socket.on('chat message', (msg) => {
            let msgData = {}

            fs.readFile('./data/chartRoom.json', (err, data) => {
                let newData = JSON.parse(data.toString())

                if (msg.message && msg.player) {

                    newData.push(msg)
                    //寫入文件
                    fs.writeFile('./data/chartRoom.json', JSON.stringify(newData), () => {
                        msgData.msg = newData.filter(item => item.token == msg.token)
                        msgData.token = msg.token

                        io.emit("chat message", msgData)
                        console.log("寫入聊天室資訊成功")
                    });

                } else {

                    msgData.msg = newData.filter(item => item.token == msg.token)
                    msgData.token = msg.token

                    io.emit("chat message", msgData)

                }

            })
        });

        socket.on("openNewGame", (initData) => {
            let userInfo = {
                name: initData.name,
                win: 0,
                lose: 0,
                type: "黑子",
                psw: initData.psw
            }
            let newData = []

            fs.readFile('./data/playerInfo.json', (err, data) => {

                newData = JSON.parse(data.toString())

                let selectKey = uuidv4()
                let index = newData.findIndex(item => !item.player2Info)

                if (index > -1) {
                    newData[index].player2Info = userInfo
                    newData[index].player2Info.type = "白子"
                    newData[index].token = selectKey
                    newData[index].psw = initData.psw

                    fs.writeFile('./data/playerInfo.json', JSON.stringify(newData), () => {
                        let responseData = newData.filter(item => item.token == selectKey)
                        responseData[0].url = getLocalIpAddress()
                        console.log('responseData',responseData)
                        io.emit("openNewGame", responseData)
                    });


                    fs.readFile('./data/playStatus.json', (err, statusData) => {
                        let initGame = {
                            player1: [],
                            player2: [],
                            token: selectKey
                        }

                        statusData = JSON.parse(statusData.toString())
                        statusData.push(initGame)

                        fs.writeFile('./data/playStatus.json', JSON.stringify(statusData), () => {
                            console.log('寫入比賽狀況成功')
                        });

                    })

                } else {

                    newData.push({
                        player1Info: userInfo,
                        player2Info: null,
                    })

                    fs.writeFile('./data/playerInfo.json', JSON.stringify(newData), () => {
                        console.log("寫入玩家資訊成功")
                    });
                }
            })
        })

        //更換下棋手
        socket.on("change", (data) => {
            io.emit("change", { color: data.color, token: data.token })
        })

        //更新比賽狀況(已下得棋子)
        socket.on("updateStatus", (data) => {
            let newData = []
            fs.readFile('./data/playStatus.json', (err, statusData) => {
                statusData = JSON.parse(statusData.toString())
                let index = statusData.findIndex(item => item.token == data.token)

                if (data && (data.player1 || data.player2)) {

                    if (index > -1) {
                        statusData[index] = data
                    } else {
                        if (statusData.length > 1) {
                            statusData[statusData.length - 1] = data
                        } else {
                            statusData[0] = data
                        }

                    }

                    fs.writeFile('./data/playStatus.json', JSON.stringify(statusData), () => {
                        console.log("更新遊戲狀態成功")
                    })
                    console.log('send', statusData[index])
                    io.emit('updateStatus', statusData[index])

                } else {
                    newData = statusData.filter(item => item.token == data.token)

                    if (newData.length) {

                        io.emit('updateStatus', { player1: newData[0].player1, player2: newData[0].player2, token: data.token, currentPlayer: newData[0].currentPlayer })
                    }

                }

            })
        })


        //更新使用者資訊
        socket.on("updateUserInfo", (webData) => {
            let newData = []

            fs.readFile('./data/playerInfo.json', (err, data) => {

                data = JSON.parse(data.toString())
                newData = data.filter(item => item.token == webData.token)
                let index = data.findIndex(item => item.token == webData.token)

                //正常更新
                if (webData.player1Info && webData.player2Info) {
                    // data.push(webData)
                    data[index] = webData
                    fs.writeFile('./data/playerInfo.json', JSON.stringify(data), () => {
                        console.log("更新玩家資訊成功")
                        newData = data.filter(item => item.token == webData.token)
                        io.emit('updateUserInfo', newData[newData.length - 1])
                    })

                    //資料量大於1代表不是初始化
                } else if (newData.length > 1) {

                    io.emit('updateUserInfo', newData[newData.length - 1])
                }
                //初始化
                else {
                    io.emit('updateUserInfo', newData[0])
                }

            })
        })
        //同時通知兩邊訊息
        socket.on("broadcast", (data) => {
            io.emit("broadcast", { type: data.type,token:data.token })
        })

        //判斷玩家離開
        socket.on("closeWindow", (webData) => {
        
            console.log('closeWindow',webData.name)
            io.emit("closeWindow", { name: webData.name, token: webData.token })
        })

        socket.on("user-disconnected", (webData) => {
            console.log('backend')
            socket.name = webData.name
            socket.token = webData.token
            setTimeout(() =>{
                console.log('data',webData)
                io.emit("user-disconnected", { token: webData.token })
                console.log('after')
            },3000)
           
        })

        socket.on("disconnect", () => {
            if (socket.name) {
                setTimeout(() => {
                    console.log('disconnect')
                    io.emit("user-disconnected", { name: socket.name, token: socket.token })

                }, 2000)
            }
        })
    });


    function setData(data) {
        let handleData = []
        handleData = JSON.parse(data.toString())
        return handleData
    }
}

module.exports = configureSocket;
