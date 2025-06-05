const WebSocket = require('ws'); // import a websocket library
const webSocketServer = new WebSocket.Server({port: 8080}); // create a websocket server instance

let players = []; // hold all connected users

// info message
console.info("Server started\n--------------\n")

// Check when WS is connected
webSocketServer.on('connection', webSocket => {
    // check if there are more then 2 users
    if (players.length >= 2) {
        console.log("More then 2 users not allowed!")

        webSocket.close(); // povolíme max 2 hráče
        return;
    }

    // add user to the list
    console.log(`Used ${players.length + 1} connected`)
    players.push(webSocket);

    // when user connected send a start message
    if (players.length === 2) {
        console.log("\nBoth users connected\nGame starting\n--------------------")
        // Prvnímu hráči pošli, že bude X
        players[0].send('start:X');
        // Druhému hráči pošli, že bude O
        players[1].send('start:O');
    }

    // Check every WS message
    webSocket.on('message', message => {
        console.log(`WS message: ${message}`)

        // sent to all users
        players.forEach((client) => {
            if (client !== webSocket && client.readyState === WebSocket.OPEN) {
                client.send(message.toString()) // musíme změnit na string, jinak dostáváme HEX!
            }
        });
    });

    // Check when WS is closed (user disconnected)
    webSocket.on('close', () => {
        console.log("Used disconnected")

        // Vyprázdní hráče po odpojení
        players = players.filter(client => client !== webSocket);
    });
});