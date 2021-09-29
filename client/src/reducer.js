const initState = {
  joined: false,
  showVideo: false,
  roomId: null,
  userName: null,
  users: [],
  messages: []
}
const rootReducer = (state, action) => {
  switch (action.type) {
    case 'JOINED':
      return {
        ...state,
        joined: true,
        userName: action.payload.userName,
        roomId: action.payload.roomId,
      };

    case 'SET_DATA':
      return {
        ...state,
        users: action.payload.users,
        messages: action.payload.messages,
      };

    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
      };

    case 'NEW_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case 'LOGOUT': 
      return {
        ...initState
      }

    default:
      return state;
  }
};

export {initState, rootReducer}
