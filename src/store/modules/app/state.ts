export interface AppState {
  user: User;
  token: string;
  mobile: boolean;
  background: string;
}

const appState: AppState = {
  user: {
    key: '',
    userid: 0,
    id: 0,
    username: '',
    password: '',
    avatar: '',
    createAt: '',
    online: 'n',
  },
  token: '',
  mobile: false,
  background: '',
};

export default appState;
