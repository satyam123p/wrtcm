import React, { useRef, useState, useEffect } from 'react';
import './App.css';

// Constants
const type = {
  ROOM_CREATE: {
    RESPONSE_SUCCESS: "CHECK_ROOM_RESPONSE_SUCCESS",
    RESPONSE_FAILURE: "CHECK_ROOM_RESPONSE_FAILURE",
  },
  ROOM_JOIN: {
    REQUEST: "JOIN_ROOM_REQUEST",
    RESPONSE_SUCCESS: "JOIN_ROOM_RESPONSE_SUCCESS",
    RESPONSE_FAILURE: "JOIN_ROOM_RESPONSE_FAILURE",
    NOTIFY: "JOIN_ROOM_NOTIFY",
  },
  ROOM_EXIT: {
    REQUEST: "EXIT_ROOM_REQUEST",
    NOTIFY: "EXIT_ROOM_NOTIFY",
  },
  WEB_RTC: {
    OFFER: "OFFER",
    ANSWER: "ANSWER",
    ICE_CANDIDATES: "ICE_CANDIDATES",
  },
};

const labels = {
  NORMAL_SERVER_PROCESS: "NORMAL_SERVER_PROCESS",
  WEBRTC_PROCESS: "WEBRTC_PROCESS",
};

const webRTCConfiguratons = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
      ],
    },
  ],
};

// Utility Functions
const addOutgoingMessageToUi = (message, userId) => `${userId}: ${message}`;
const addIncomingMessageToUi = (message, otherUserId) => `${otherUserId}: ${message}`;

const App = () => {
  // State
  const [userId] = useState(Math.round(Math.random() * 1000000).toString());
  const [roomName, setRoomName] = useState('');
  const [otherUserId, setOtherUserId] = useState(null);
  const [channelName, setChannelName] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [iceCandidatesGenerated, setIceCandidatesGenerated] = useState([]);
  const [iceCandidatesReceivedBuffer, setIceCandidatesReceivedBuffer] = useState([]);

  // Refs
  const pc = useRef(null);
  const dataChannel = useRef(null);
  const wsConnection = useRef(null);
  const inputRoomNameElement = useRef(null);

  // WebSocket Setup and Cleanup
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        wsConnection.current = new WebSocket(`ws://localhost:8080/?userId=${userId}`);

        wsConnection.current.onopen = () => {
          console.log('Connected to WebSocket server');
        };

        wsConnection.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Received message:', message);
            switch (message.label) {
              case labels.NORMAL_SERVER_PROCESS:
                normalServerProcessing(message.data);
                break;
              case labels.WEBRTC_PROCESS:
                webRTCServerProcessing(message.data);
                break;
              default:
                console.log('Unknown server processing label:', message.label);
            }
          } catch (error) {
            console.error('Error processing WebSocket message:', error);
            alert('Failed to process server message.');
          }
        };

        wsConnection.current.onclose = () => {
          console.log('Disconnected from WebSocket server');
          alert('Disconnected from server. Retrying...');
          setTimeout(connectWebSocket, 5000);
        };

        wsConnection.current.onerror = (error) => {
          console.error('WebSocket error:', error);
          alert('Failed to connect to WebSocket server. Retrying...');
        };
      } catch (error) {
        console.error('WebSocket setup error:', error);
        alert('Failed to initialize WebSocket connection.');
      }
    };

    connectWebSocket();

    return () => {
      try {
        wsConnection.current?.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
    };
  }, [userId]);

  // Room Management
  const createRoom = () => {
    const name = channelName.trim();
    setChannelName('');
    if (!name) {
      alert('Your room needs a name');
      return;
    }
    try {
      const message = {
        label: labels.NORMAL_SERVER_PROCESS,
        data: {
          type: type.ROOM_CREATE.RESPONSE_SUCCESS,
          roomName: name,
          userId,
        },
      };
      wsConnection.current?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room.');
    }
  };

  const joinRoom = (name, id) => {
    try {
      const message = {
        label: labels.NORMAL_SERVER_PROCESS,
        data: {
          type: type.ROOM_JOIN.REQUEST,
          roomName: name,
          userId: id,
        },
      };
      wsConnection.current?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room.');
    }
  };

  const sendExitRoomRequest = (name, id) => {
    try {
      const message = {
        label: labels.NORMAL_SERVER_PROCESS,
        data: {
          type: type.ROOM_EXIT.RESPONSE,
          roomName: name,
          userId: id,
        },
      };
      wsConnection.current?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending exit room request:', error);
      alert('Failed to exit room.');
    }
  };

  // WebRTC Functions
  const createPeerConnectionObject = () => {
    try {
      pc.current = new RTCPeerConnection(webRTCConfiguratons);

      pc.current.onconnectionstatechange = () => {
        console.log('Connection state:', pc.current?.connectionState);
        if (pc.current?.connectionState === 'connected') {
          alert('WebRTC connection established!');
        } else if (pc.current?.connectionState === 'failed' || pc.current?.connectionState === 'closed') {
          console.log('WebRTC connection failed or closed');
          closePeerConnection();
        }
      };

      pc.current.onsignalingstatechange = () => {
        console.log('Signaling state:', pc.current?.signalingState);
      };

      pc.current.onicecandidate = (e) => {
        try {
          if (e.candidate) {
            console.log('ICE candidate:', e.candidate);
            setIceCandidatesGenerated((prev) => [...prev, e.candidate]);
            sendIceCandidates([e.candidate]);
          } else {
            console.log('No ICE candidate (null candidate)');
          }
        } catch (error) {
          console.error('Error handling ICE candidate:', error);
        }
      };
    } catch (error) {
      console.error('Error creating peer connection:', error);
      alert('Failed to create WebRTC peer connection.');
    }
  };

  const createDataChannel = (isOfferor) => {
    try {
      if (isOfferor) {
        const dataChannelOptions = { ordered: true };
        dataChannel.current = pc.current?.createDataChannel('chat', dataChannelOptions);
        registerDataChannelEventListeners();
      } else {
        pc.current.ondatachannel = (e) => {
          console.log('Data channel received:', e);
          dataChannel.current = e.channel;
          registerDataChannelEventListeners();
        };
      }
    } catch (error) {
      console.error('Error creating data channel:', error);
      alert('Failed to create WebRTC data channel.');
    }
  };

  const registerDataChannelEventListeners = () => {
    try {
      dataChannel.current.onmessage = (e) => {
        try {
          const msg = e.data;
          const formattedMessage = addIncomingMessageToUi(msg, otherUserId);
          setMessages((prev) => [...prev, formattedMessage]);
        } catch (error) {
          console.error('Error processing data channel message:', error);
        }
      };

      dataChannel.current.onopen = () => {
        console.log('Data channel opened');
      };

      dataChannel.current.onclose = () => {
        console.log('Data channel closed');
      };
    } catch (error) {
      console.error('Error registering data channel listeners:', error);
    }
  };

  const startWebRTCProcess = async (uid) => {
    if (!uid) {
      console.log('Cannot start WebRTC: otherUserId is null');
      return;
    }
    try {
      createPeerConnectionObject();
      createDataChannel(true);
      const offer = await pc.current?.createOffer();
      await pc.current?.setLocalDescription(offer);
      sendOffer(pc.current?.localDescription);
    } catch (error) {
      console.error('WebRTC error:', error);
      alert('Failed to initiate WebRTC connection.');
    }
  };

  const sendOffer = (offer) => {
    try {
      if (!otherUserId) {
        console.log('Cannot send offer: otherUserId is null');
        return;
      }
      const message = {
        label: labels.WEBRTC_PROCESS,
        data: { type: type.WEB_RTC.OFFER, offer, otherUserId },
      };
      wsConnection.current?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending offer:', error);
    }
  };

  const sendAnswer = (answer) => {
    try {
      if (!otherUserId) {
        console.log('Cannot send answer: otherUserId is null');
        return;
      }
      const message = {
        label: labels.WEBRTC_PROCESS,
        data: { type: type.WEB_RTC.ANSWER, answer, otherUserId },
      };
      wsConnection.current?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending answer:', error);
    }
  };

  const sendIceCandidates = (candidates) => {
    try {
      if (!otherUserId) {
        console.log('Cannot send ICE candidates: otherUserId is null');
        return;
      }
      const message = {
        label: labels.WEBRTC_PROCESS,
        data: { type: type.WEB_RTC.ICE_CANDIDATES, candidatesArray: candidates, otherUserId },
      };
      wsConnection.current?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending ICE candidates:', error);
    }
  };

  const handleOffer = async (data) => {
    try {
      createPeerConnectionObject();
      createDataChannel(false);
      await pc.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.current?.createAnswer();
      await pc.current?.setLocalDescription(answer);
      sendAnswer(answer);
    } catch (error) {
      console.error('Error handling offer:', error);
      alert('Failed to process WebRTC offer.');
    }
  };

  const handleAnswer = async (data) => {
    try {
      await pc.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
      for (const candidate of iceCandidatesReceivedBuffer) {
        await pc.current?.addIceCandidate(candidate);
      }
      setIceCandidatesReceivedBuffer([]);
    } catch (error) {
      console.error('Error handling answer:', error);
      alert('Failed to process WebRTC answer.');
    }
  };

  const handleIceCandidates = async (data) => {
    try {
      if (pc.current?.remoteDescription) {
        for (const candidate of data.candidatesArray) {
          await pc.current?.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } else {
        setIceCandidatesReceivedBuffer((prev) => [
          ...prev,
          ...data.candidatesArray.map((c) => new RTCIceCandidate(c)),
        ]);
      }
    } catch (error) {
      console.error('Error adding ICE candidates:', error);
    }
  };

  const sendMessageUsingDataChannel = (msg) => {
    try {
      if (dataChannel.current?.readyState === 'open') {
        dataChannel.current.send(msg);
      } else {
        console.log('Data channel not open');
        alert('Data channel is not open');
      }
    } catch (error) {
      console.error('Error sending data channel message:', error);
    }
  };

  const closePeerConnection = () => {
    try {
      if (pc.current) {
        pc.current.close();
        pc.current = null;
        dataChannel.current = null;
        console.log('Peer connection closed');
      }
    } catch (error) {
      console.error('Error closing peer connection:', error);
    }
  };

  // Server Processing
  const normalServerProcessing = (data) => {
    try {
      switch (data.type) {
        case type.ROOM_CREATE.RESPONSE_SUCCESS:
          setRoomName(data.roomName);
          alert('Room created successfully.');
          break;
        case type.ROOM_CREATE.RESPONSE_FAILURE:
          console.log('Create room failed:', data.message);
          alert(data.message || 'Failed to create room.');
          break;
        case type.ROOM_JOIN.RESPONSE_SUCCESS:
          joinSuccessHandler(data);
          break;
        case type.ROOM_JOIN.RESPONSE_FAILURE:
          console.log('Join room failed:', data.message);
          alert(data.message || 'Failed to join room.');
          break;
        case type.ROOM_JOIN.NOTIFY:
          setOtherUserId(data.joinUserId);
          alert(`User ${data.joinUserId} has joined your room`);
          startWebRTCProcess(data.joinUserId);
          break;
        case type.ROOM_EXIT.NOTIFY:
          setOtherUserId(null);
          alert(data.message || 'A user has left your room');
          closePeerConnection();
          exitRoom();
          break;
        default:
          console.log('Unknown data type:', data.type);
      }
    } catch (error) {
      console.error('Error processing normal server message:', error);
    }
  };

  const webRTCServerProcessing = (data) => {
    try {
      switch (data.type) {
        case type.WEB_RTC.OFFER:
          handleOffer(data);
          break;
        case type.WEB_RTC.ANSWER:
          handleAnswer(data);
          break;
        case type.WEB_RTC.ICE_CANDIDATES:
          handleIceCandidates(data);
          break;
        default:
          console.log('Unknown data type:', data.type);
      }
    } catch (error) {
      console.error('Error processing WebRTC message:', error);
    }
  };

  const joinSuccessHandler = (data) => {
    try {
      if (data.creatorId && data.creatorId !== userId) {
        setOtherUserId(data.creatorId);
      }
      setRoomName(data.roomName);
      startWebRTCProcess();
      alert('Joined room successfully');
    } catch (error) {
      console.error('Error handling join success:', error);
    }
  };

  // UI Handlers
  const exitRoom = () => {
    try {
      inputRoomNameElement.current.value = '';
      setRoomName('');
      setOtherUserId(null);
      setChannelName('');
      setMessages([]);
    } catch (error) {
      console.error('Error exiting room:', error);
    }
  };

  const handleCreateRoom = () => {
    createRoom();
  };

  const handleJoinRoom = () => {
    const name = channelName.trim();
    setChannelName('');
    if (!name) {
      alert('You have to join a room with a valid name');
      return;
    }
    joinRoom(name, userId);
  };

  const handleExitRoom = () => {
    if (roomName) {
      sendExitRoomRequest(roomName, userId);
    }
    exitRoom();
    closePeerConnection();
  };

  const handleSendMessage = () => {
    const msg = message.trim();
    setMessage('');
    if (msg) {
      const formattedMessage = addOutgoingMessageToUi(msg, userId);
      setMessages((prev) => [...prev, formattedMessage]);
      sendMessageUsingDataChannel(msg);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>WebRTC Chat Room (User ID: {userId})</h1>

      {/* Channel Name Input */}
      <input
        ref={inputRoomNameElement}
        style={styles.input}
        placeholder="Enter room name"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
      />

      {/* Buttons for Room Actions */}
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleCreateRoom}>
          Create Room
        </button>
        <button style={styles.button} onClick={handleJoinRoom}>
          Join Room
        </button>
      </div>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={handleExitRoom}>
          Exit Room
        </button>
      </div>

      {/* Message Input */}
      <input
        style={styles.input}
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {/* Send Button */}
      <button style={styles.sendButton} onClick={handleSendMessage}>
        Send
      </button>

      {/* Message Container */}
      <div style={styles.messageContainer}>
        {messages.length === 0 ? (
          <p style={styles.noMessages}>No messages yet</p>
        ) : (
          messages.map((msg, index) => (
            <p key={index} style={styles.message}>
              {msg}
            </p>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
  },
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: '40px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    padding: '0 10px',
    marginBottom: '20px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    color: '#fff',
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    margin: '0 5px',
  },
  sendButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    color: '#fff',
    padding: '10px',
    borderRadius: '5px',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  messageContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '5px',
    padding: '10px',
    minHeight: '100px',
    boxSizing: 'border-box',
  },
  message: {
    fontSize: '14px',
    color: '#333',
    marginBottom: '5px',
  },
  noMessages: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center',
  },
};

export default App;