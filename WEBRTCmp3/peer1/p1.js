const wrtc = require('wrtc');
const WebSocket = require('ws');
const { sendVideoFrames } = require('./videoStream');

const socket = new WebSocket('ws://localhost:8080');
let myId = null;
const peers = new Map();
let localStream = null;

function initializeLocalStream() {
    localStream = new wrtc.MediaStream();
    const videoSource = new wrtc.nonstandard.RTCVideoSource();
    const videoTrack = videoSource.createTrack();
    localStream.addTrack(videoTrack);
    console.log('Peer 1 initialized local stream for demo1.webm');
}

function createPeerConnection(peerId) {
    const peer = new wrtc.RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    peers.set(peerId, peer);

    peer.onicecandidate = ({ candidate }) => {
        if (candidate) {
            socket.send(JSON.stringify({ type: 'ice', candidate, to: peerId }));
            console.log(`Peer 1 sent ICE candidate to ${peerId}`);
        }
    };

    peer.ontrack = (event) => {
        console.log(`Peer 1 received video frames from ${peerId} (demo.webm)`);
        const remoteStream = event.streams[0];
        console.log(`Peer 1 stream from ${peerId} has ${remoteStream.getTracks().length} tracks`);
    };

    peer.onconnectionstatechange = () => {
        if (peer.connectionState === 'connected') {
            console.log(`Peer 1 WebRTC connection established with ${peerId}`);
            sendVideoFrames('demo.webm', peer);
        }
    };

    if (localStream) {
        localStream.getTracks().forEach(track => {
            peer.addTrack(track, localStream);
            console.log(`Peer 1 added ${track.kind} track to connection with ${peerId}`);
        });
    }

    return peer;
}

async function createOffer(peerId) {
    try {
        const peer = createPeerConnection(peerId);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.send(JSON.stringify({ type: 'offer', offer, to: peerId }));
        console.log(`Peer 1 sent offer to ${peerId}`);
    } catch (e) {
        console.error(`Peer 1 error creating offer for ${peerId}:`, e);
    }
}

socket.on('message', async (msg) => {
    let data;
    try {
        data = JSON.parse(msg.toString());
    } catch (e) {
        console.error('Peer 1 error parsing message:', e);
        return;
    }

    try {
        if (data.type === 'init') {
            myId = data.peerId;
            console.log(`Peer 1 ID: ${myId}`);
            initializeLocalStream();
            data.peers.forEach(peerId => {
                if (myId < peerId) createOffer(peerId);
            });
        } else if (data.type === 'newPeer' && data.peerId !== myId) {
            if (myId < data.peerId && !peers.has(data.peerId)) {
                createOffer(data.peerId); // Fixed: Use data.peerId instead of undefined peerId
            }
        } else if (data.type === 'offer' && data.to === myId) {
            const peer = createPeerConnection(data.from);
            await peer.setRemoteDescription(new wrtc.RTCSessionDescription(data.offer));
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socket.send(JSON.stringify({ type: 'answer', answer, to: data.from }));
            console.log(`Peer 1 sent answer to ${data.from}`);
        } else if (data.type === 'answer' && data.to === myId) {
            const peer = peers.get(data.from);
            if (peer) await peer.setRemoteDescription(new wrtc.RTCSessionDescription(data.answer));
        } else if (data.type === 'ice' && data.to === myId) {
            const peer = peers.get(data.from);
            if (peer) await peer.addIceCandidate(new wrtc.RTCIceCandidate(data.candidate));
        } else if (data.type === 'peerDisconnected') {
            const peer = peers.get(data.peerId);
            if (peer) {
                peer.close();
                peers.delete(data.peerId);
                console.log(`Peer 1: Peer ${data.peerId} disconnected`);
            }
        }
    } catch (e) {
        console.error(`Peer 1 error handling message from ${data.from || 'unknown'}:`, e);
    }
});

socket.on('open', () => console.log('Peer 1 connected to signaling server'));
socket.on('error', (err) => console.error('Peer 1 WebSocket error:', err));
socket.on('close', () => {
    console.log('Peer 1 disconnected from signaling server');
    peers.forEach(peer => peer.close());
    peers.clear();
});