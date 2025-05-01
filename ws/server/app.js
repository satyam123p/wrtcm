// use Node's HTTP module to set up a http server
const http = require("http");

// use Node's websocket module to spin up a websocket server
const WebSocketServer = require("websocket").server;

// all node servers require a web server object at some point
// let's do this now
const httpServer = http.createServer((req, res) => {
    // for a request to ws:// no code inside of here will execute. Instead, the request will be passed onto the websocket server (see below)
    res.writeHead(200, {
        "access-control-allow-origin": "*"
    })
    // for all http requsts to our server, send back a simple msg
    res.end(`I don't want your http rubbish 🚮`);
});

// spin up the http server on any port you like, such as 8080
httpServer.listen(8080, () => {
    console.log("The http server is listening on port 8080")
})

// define our websocket server object
let websocket = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false
});

// in real life, you can define a function to check origin and also implement authentication. For a simple example, I'm just creating a function that checks the origin. I always return true for testing purposes
function isOriginAllowed(origin) {
    // insert logic here to determine whether the specified origin is allowed
    return true;
}

// The Websocket node module will fire the "request" event whenever a websocket connection request is received
websocket.on('request', (req) => {
    // first check if origin is allowed - execute our function defined above
    if(!isOriginAllowed(req.origin)) {
        // if our funciton returns false, reject the ws connection request
        req.reject(403, "Sorry, you are not allowed here");
        console.log("Client's request rejected from origin: " + req.origin)
    }

    // establish & accept our websocket connection
    // insert this connection into an object
    let connection = req.accept(); // the accept() method will return the required WebSocket protocol response headers from the server

    // send message immediately to client, letting them know they are connected
    connection.send(`Connection established 🚀`);
    console.log("Connection established and accepted");

    // *** METHOD EVENT
    connection.on("message", (message) => {
        setTimeout(() => {
            connection.send(`Thanks for your message saying: ${message.utf8Data}, but I don't want to talk to you ... bye bye`);
        }, 1000);
        setTimeout(() => {
            connection.close(1001, "server shut you down");
        }, 5000);
    });

    // *** CLOSE EVENT
    connection.on("close", (code, reason) => {
        console.log(`Peer connection ${connection.remoteAddress} disconnected. The reason is: ${reason} and the closure code is: ${code}`)
    })
    
});