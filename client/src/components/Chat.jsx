import React, { useRef } from 'react';
import socket from '../socket';

import { format, parseISO } from 'date-fns';

function Chat({ users, messages, userName, roomId, onAddMessage, onLogout, onStartVideo, showVideo }) {
  const [messageValue, setMessageValue] = React.useState('');
  const messagesRef = React.useRef(null);

  const videoRef = useRef(null);

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {width: '300px'}, audio: true })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        // video.muted = true;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  };


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
            <button onClick={getVideo} type="button" className="chat__btn chat__start-video-button">
              START VIDEO
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
        <video ref={videoRef}/>
      </div>            
    </div>
  );
}

export default Chat;
