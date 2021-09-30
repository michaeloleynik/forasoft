import React, { useRef, useState, useEffect } from 'react';
import socket from '../socket';
import Peer from "simple-peer";

import { format, parseISO } from 'date-fns';

import { Video } from './Video';

function Chat({ peers, users, messages, userName, userSocketId, roomId, onAddMessage, onLogout }) {
  

  const [messageValue, setMessageValue] = useState('');
  const [isVideo, setIsVideo] = useState(false);
  const [allPeers, setAllPeers] = useState([]);
  const messagesRef = useRef(null);

  const videoRef = useRef(null);
  const peersRef = useRef([]);

  useEffect(() => {
    socket.on("USER:STARTED_VIDEO", ({signal, callerID}) => {
      const peer = new Peer({
        initiator: false,
        trickle: false,
      })
      peer.signal(signal);
      
      peersRef.current.push({
        peerID: callerID,
        peer,
      });


      setAllPeers(peers => [...peers, peer]);
  });
  });

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        const otherUsers = peers.filter(id => id !== userSocketId);
        otherUsers.forEach(user => {
          const peer = createPeer(user, userSocketId, stream);

          setAllPeers(peers => [...peers, peer]);
        })
        setIsVideo(true);
      })
      .catch(err => {
        console.error("error:", err);
      });
  };

  const stopVideo = () => {
    let video = videoRef.current;
    const stream = video.srcObject;
    const tracks = stream.getTracks();
  
    for (let i = 0; i < tracks.length; i++) {
      let track = tracks[i];
      track.stop();
    }
  
    video.srcObject = null;
    setIsVideo(false);
  }

  function createPeer(userToSignal, callerID, stream) { // create connection with other users
    const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
    });

    peer.on("signal", signal => {
      socket.emit("ROOM:SEND_SIGNAL", { userToSignal, callerID, signal });
    })

    return peer;
}

  const onSendMessage = () => {
    let createdTime = new Date().toISOString();

    socket.emit('ROOM:NEW_MESSAGE', {
      userName,
      roomId,
      text: messageValue,
      createdTime
    });
    onAddMessage({ userName, text: messageValue, createdTime });
    setMessageValue('');
  };


  React.useEffect(() => {
    messagesRef.current.scrollTo(0, 99999);
  }, [messages]);

  return (
    <div className="chat">
      <div className="chat-users">
        ROOM: <b>{roomId}</b>
        <hr />
        <b>ONLINE ({users.length}):</b>
        <ul>
          {users.map(user => (
            <li key={user + Math.round(Math.random() * 10000)}>{user}</li>
          ))}
        </ul>
      </div>
      <div className="chat-messages">
        <div ref={messagesRef} className="messages">
          {messages.map((message) => (
            <div key={message.text + Math.round(Math.random() * 10000)} className="message">
              <div>
                <p>{message.text}</p>
                <span className="message-time">{format(parseISO(message.createdTime), 'dd.MM.yyyy HH:mm')}</span>
              </div>
              <span>{message.userName}</span>
            </div>
          ))}
        </div>
        <form>
          <textarea
            cols="20"
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
            className="form-control"
            rows="4"></textarea>
          <div className="chat__btns-row">
            <button onClick={onSendMessage} disabled={!messageValue} type="button" className="chat__btn chat__send-button">
              SEND
            </button>
            <button onClick={() => {!isVideo ? getVideo() : stopVideo()}} type="button" className="chat__btn chat__start-video-button">
              {!isVideo ? 'START VIDEO' : 'STOP VIDEO'}
            </button>
            <button onClick={() => {navigator.clipboard.writeText(`http://localhost:3000/invite/${roomId}`)}} type="button" className="chat__btn chat__share-button">
              SHARE CHAT
            </button>
            <button onClick={onLogout} type="button" className="chat__btn chat__exit-button">
              LOGOUT
            </button>
          </div>
        </form>
      </div>
      <div className="video-grid">
        <video style={{width: '300px', height: '225px'}} muted autoPlay playsInline ref={videoRef}/>
        {allPeers.map((peer, idx) => (
          <Video key={idx} peer={peer} />
        ))}
      </div>            
    </div>
  );
}

export default Chat;
