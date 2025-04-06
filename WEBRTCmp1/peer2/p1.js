const wrtc = require('wrtc');
const WebSocket = require('ws');
const readline = require('readline');

const socket = new WebSocket("ws://localhost:8080");
let myId = null;
const peers = new Map();
const channels = new Map();
let rl = null;
const pendingIceCandidates = new Map(); // Store ICE candidates if connection isn’t ready

function initCLI() {
    if (rl) rl.close();
    rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.on('line', line => {
        channels.forEach((channel, peerId) => {
            if (channel.readyState === "open") {
                channel.send(`[${myId}]: ${line}`);
            }
        });
    });
}

function setupChannel(peerId, dc) {
    channels.set(peerId, dc);
    dc.onopen = () => {
        console.log(`Channel open with ${peerId}`);
        if (!rl) initCLI(); // Reinitialize CLI if it’s not active
    };
    dc.onmessage = (msg) => {
        console.log(`[${peerId}]: ${msg.data}`);
    };
    dc.onclose = () => {
        console.log(`Channel closed with ${peerId}`);
        channels.delete(peerId);
        if (channels.size === 0 && rl) rl.close();
    };
}

function createPeerConnection(peerId) {
    const peer = new wrtc.RTCPeerConnection();
    peers.set(peerId, peer);

    peer.onicecandidate = ({ candidate }) => {
        if (candidate) {
            socket.send(JSON.stringify({ type: "ice", candidate, to: peerId }));
        }
    };

    peer.ondatachannel = (event) => {
        setupChannel(peerId, event.channel);
    };

    // Apply any pending ICE candidates once remote description is set
    peer.onnegotiationneeded = async () => {
        if (peer.remoteDescription && pendingIceCandidates.has(peerId)) {
            const candidates = pendingIceCandidates.get(peerId);
            for (const candidate of candidates) {
                await peer.addIceCandidate(new wrtc.RTCIceCandidate(candidate));
            }
            pendingIceCandidates.delete(peerId);
        }
    };

    return peer;
}

async function createOffer(peerId) {
    if (myId >= peerId) return;

    try {
        const peer = createPeerConnection(peerId);
        const channel = peer.createDataChannel("chat");
        setupChannel(peerId, channel);

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.send(JSON.stringify({ type: "offer", offer, to: peerId }));
    } catch (e) {
        console.error(`Error creating offer for ${peerId}:`, e);
    }
}

socket.onmessage = async (msg) => {
    let data;
    try {
        data = JSON.parse(msg.data);
    } catch (e) {
        console.error("Error parsing message:", e);
        return;
    }

    try {
        if (data.type === "init") {
            myId = data.peerId;
            console.log(`My ID: ${myId}`);
            data.peers.forEach(peerId => createOffer(peerId));
        }

        else if (data.type === "newPeer" && data.peerId !== myId) {
            createOffer(data.peerId);
        }

        else if (data.type === "offer" && data.to === myId) {
            const peer = createPeerConnection(data.from);
            await peer.setRemoteDescription(new wrtc.RTCSessionDescription(data.offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.send(JSON.stringify({ type: "answer", answer, to: data.from }));
        }

        else if (data.type === "answer" && data.to === myId) {
            const peer = peers.get(data.from);
            if (peer) {
                await peer.setRemoteDescription(new wrtc.RTCSessionDescription(data.answer));
            }
        }

        else if (data.type === "ice" && data.to === myId) {
            const peer = peers.get(data.from);
            if (peer) {
                if (peer.remoteDescription) {
                    await peer.addIceCandidate(new wrtc.RTCIceCandidate(data.candidate));
                } else {
                    // Queue ICE candidate if remote description isn’t set yet
                    if (!pendingIceCandidates.has(data.from)) {
                        pendingIceCandidates.set(data.from, []);
                    }
                    pendingIceCandidates.get(data.from).push(data.candidate);
                }
            }
        }

        else if (data.type === "peerDisconnected") {
            const peer = peers.get(data.peerId);
            if (peer) {
                peer.close();
                peers.delete(data.peerId);
                channels.delete(data.peerId);
                pendingIceCandidates.delete(data.peerId);
                console.log(`Peer ${data.peerId} disconnected`);
                if (channels.size === 0 && rl) rl.close();
            }
        }
    } catch (e) {
        console.error(`Error handling message from ${data.from || 'unknown'}:`, e);
    }
};

socket.onopen = () => {
    console.log("Connected to signaling server");
};

socket.onerror = (err) => {
    console.error("WebSocket error:", err);
};

socket.onclose = () => {
    console.log("Disconnected from signaling server");
    if (rl) rl.close();
};