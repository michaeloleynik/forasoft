import React, { useEffect, useCallback } from 'react';
import { useHttp } from './hooks/useHttp';

import socket from './socket';

import { rootReducer, initState } from './reducer';
import JoinBlock from './components/JoinBlock';
import Chat from './components/Chat';

import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';


// import './App.css';

function App() {
  const [state, dispatch] = React.useReducer(rootReducer, initState);

  const { request } = useHttp();

  const onLogin = useCallback(async (obj) => {
    localStorage.setItem('userData', JSON.stringify({...obj}));
    dispatch({
      type: 'JOINED',
      payload: obj,
    });
    await request('/rooms', 'POST', obj);
    socket.emit('ROOM:JOIN', obj);
    const data = await request(`/rooms/${obj.roomId}`);
    dispatch({
      type: 'SET_DATA',
      payload: data,
    });
  }, [request]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('userData'));

    if (data && data.roomId && data.userName) {
      const obj = {
        roomId: data.roomId,
        userName: data.userName
      }
      return onLogin(obj);
    }
  }, [onLogin]);

  const onLogout = () => {
    localStorage.removeItem('userData');
    dispatch({type: 'LOGOUT'});
    socket.emit('LOGOUT');
    console.log(state);
  }

  const setUsers = (users) => {
    dispatch({
      type: 'SET_USERS',
      payload: users,
    });
  };

  const addMessage = (message) => {
    dispatch({
      type: 'NEW_MESSAGE',
      payload: message,
    });
  };

  React.useEffect(() => {
    socket.on('ROOM:SET_USERS', setUsers);
    socket.on('ROOM:NEW_MESSAGE', addMessage);
  }, []);


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
