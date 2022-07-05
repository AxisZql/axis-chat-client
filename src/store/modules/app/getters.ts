import { GetterTree } from 'vuex';
import { AppState } from './state';
import { RootState } from '../../index';
import cookie from 'js-cookie';
const getters: GetterTree<AppState, RootState> = {
  user(state) {
    state.user;
    // TODO: user 的密码信息保存在名称为user的cookie中不安全，容易造成存储型xss漏洞
    let user = cookie.get('user');
    if (!user) {
      return {};
    }
    state.user = JSON.parse(user);
    return state.user;
  },
  token(state) {
    let token = cookie.get('token');
    if (!token) {
      return '';
    }
    return token;
  },
  mobile(state) {
    return state.mobile;
  },
  background(state) {
    state.background;
    return localStorage.getItem('background');
  },
};

export default getters;
