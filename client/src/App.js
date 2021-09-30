import React, { useEffect, useCallback } from 'react';
import { useHttp } from './hooks/useHttp';

import socket from './socket';

import { rootReducer, initState } from './reducer';
import JoinBlock from './components/JoinBlock';
import Chat from './components/Chat';

import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';



function App() {
  const [state, dispatch] = React.useReducer(rootReducer, initState);

  const { request } = useHttp();

  
  
  const onLogin = useCallback( async (obj) => { // automatically login using localstorage
    await request('/rooms', 'POST', obj);
    socket.emit('ROOM:JOIN', obj);
    localStorage.setItem('userData', JSON.stringify({...obj}));
    dispatch({
      type: 'JOINED',
      payload: obj,
    });
    request(`/rooms/${obj.roomId}`).then(data => {
      let modifyData = {...data}
      if (!modifyData.users.includes(obj.userName)) {
        modifyData.users = [...modifyData.users, obj.userName];
      }
      dispatch({
        type: 'SET_DATA',
        payload: modifyData,
      });
    });    
  }, [request]);
  
  
  const onLogout = () => {
    localStorage.removeItem('userData');
    dispatch({type: 'LOGOUT'});
    socket.emit('LOGOUT');
  }
  
  const setUsers = (data) => {
    dispatch({
      type: 'SET_USERS',
      payload: {...data},
    });
  };
  
  const addMessage = (message) => {
    dispatch({
      type: 'NEW_MESSAGE',
      payload: message,
    });
  };
  
  useEffect(() => { 
    socket.on('USER:CONNECT', (id) => {
      dispatch({type: 'SET_SOCKETID', payload: id})
    })
    socket.on('ROOM:SET_USERS', setUsers);
    socket.on('ROOM:NEW_MESSAGE', addMessage);
    return () => {
      socket.off('ROOM:SET_USERS');
      socket.off('ROOM:NEW_MESSAGE');
    };
  }, []);
  
  useEffect(() => { // check is user auth?
    const data = JSON.parse(localStorage.getItem('userData'));
    
    if (data && data.roomId && data.userName) {
      const obj = {
        roomId: data.roomId,
        userName: data.userName
      }
      return onLogin(obj);
    }
  }, [onLogin]);

  return (
    <BrowserRouter>
      <div className="wrapper">
        {!state.joined ? (
          <Switch>
          <Route path="/" exact>
            <JoinBlock onLogin={onLogin} isInvite={false} />
          </Route>
          <Route path="/invite/:roomid">
            <JoinBlock onLogin={onLogin} isInvite={true} />
          </Route>
          <Redirect to="/" />
          </Switch>
        ) : (
          <Switch>
            <Route path="/chat" >
              <Chat {...state} onAddMessage={addMessage} onLogout={onLogout} showVideo={state.showVideo} />
            </Route>
            <Redirect to="/chat" />
          </Switch>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
