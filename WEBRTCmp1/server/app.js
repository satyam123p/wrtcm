const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
let peers = new Map();

wss.on('connection', ws => {
    const peerId = Date.now().toString() + Math.random().toString(36).substring(2, 15);
    peers.set(peerId, ws);
    console.log(`New peer connected: ${peerId}`);

    ws.send(JSON.stringify({ type: "init", peerId, peers: Array.from(peers.keys()).filter(id => id !== peerId) }));

    peers.forEach((peerWs, id) => {
        if (peerWs !== ws && peerWs.readyState === WebSocket.OPEN) {
            peerWs.send(JSON.stringify({ type: "newPeer", peerId }));
        }
    });

    ws.on('message', msg => {
        try {
            const data = JSON.parse(msg);
            data.from = peerId;

            peers.forEach((peerWs, id) => {
                if (peerWs !== ws && peerWs.readyState === WebSocket.OPEN) {
                    peerWs.send(JSON.stringify(data));
                }
            });
        } catch (e) {
            console.error(`Error processing message from ${peerId}:`, e);
        }
    });

    ws.on('close', () => {
        peers.delete(peerId);
        console.log(`Peer disconnected: ${peerId}`);
        peers.forEach((peerWs) => {
            if (peerWs.readyState === WebSocket.OPEN) {
                peerWs.send(JSON.stringify({ type: "peerDisconnected", peerId }));
            }
        });
    });

    ws.on('error', (err) => {
        console.error(`WebSocket error for ${peerId}:`, err);
    });
});

console.log("Signaling server running on ws://localhost:8080");