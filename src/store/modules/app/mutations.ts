import { SET_USER, CLEAR_USER, SET_TOKEN, SET_MOBILE, SET_BACKGROUND } from './mutation-types';
import { AppState } from './state';
import cookie from 'js-cookie';
import { MutationTree } from 'vuex';

const mutations: MutationTree<AppState> = {
  [SET_USER](state, payload: User) {
    state.user = payload;
    // 数据持久化
    cookie.set('user', payload, { expires: 3650 });
  },

  [CLEAR_USER](state) {
    state.user = {
      key: '',
      userid: 0,
      id: 0,
      username: '',
      password: '',
      avatar: '',
      createAt: '',
      online: 'n',
    };
    cookie.set('user', '');
    cookie.set('token', '');
  },

  [SET_TOKEN](state, payload) {
    state.token = payload;
    cookie.set('token', payload, { expires: 86400 });
  },

  [SET_MOBILE](state, payload: boolean) {
    state.mobile = payload;
  },

  [SET_BACKGROUND](state, payload: string) {
    state.background = payload;
    localStorage.setItem('background', payload);
  },
};

export default mutations;
