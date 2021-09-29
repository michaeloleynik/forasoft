import React, { useEffect } from 'react';
import { useParams } from 'react-router';

function JoinBlock({onLogin, isInvite}) {
  const [roomId, setRoomId] = React.useState('');
  const [userName, setUserName] = React.useState('');
  const [isLoading, setLoading] = React.useState(false);

  const invitedRoom = useParams();

  useEffect(() => {
    if (invitedRoom && invitedRoom.roomid && isInvite) {
      setRoomId(invitedRoom.roomid);
    }
    
  }, [invitedRoom, invitedRoom.roomid, isInvite]);


  const onEnter = () => {
    if (!roomId || !userName) {
      return alert('Enter all data!');
    }
    const obj = {
      roomId,
      userName,
    };
    setLoading(true);
    onLogin(obj);
  };

  return (
    <div className="join-block">
      <input
        className="join-block__input"
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      {
        !isInvite &&
        <input
          className="join-block__input"
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
      }
      <button disabled={isLoading} onClick={onEnter} className="join-block__button">
        {isLoading ? 'WAIT...' : 'LOGIN'}
      </button>
    </div>
  );
}

export default JoinBlock;
