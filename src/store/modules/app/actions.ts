import { SET_USER, SET_TOKEN } from './mutation-types';
import { ActionTree } from 'vuex';
import { AppState } from './state';
import { RootState } from '../../index';
import fetch from '@/api/fetch';
import { processReturn } from '@/utils/common';
import { getUsersByName } from '@/api/apis';

const actions: ActionTree<AppState, RootState> = {
  // 新用户注册
  async register({ commit }, payload) {
    let res = await fetch.post('/user/register', {
      ...payload,
    });
    let data = processReturn(res);
    if (data) {
      // commit(SET_USER, data.user);
      commit(SET_TOKEN, data.data);
      return data;
    }
  },
  // 用户登陆
  async login({ commit }, payload) {
    let res = await fetch.post('/user/login', {
      ...payload,
    });
    let data = processReturn(res);
    if (data) {
      // 全局保存用户登陆凭证
      commit(SET_TOKEN, data);
      return data;
    }
  },

  async updateUser({ commit }, user: User) {
    commit(SET_USER, user);
  },

  // 通过token换取用户身份信息
  async getUserInfoByToken({ commit }, payload) {
    let res = await fetch.get('/user/check-auth', {
      params: payload,
    });
    let data = processReturn(res);
    if (data) {
      let user: User = {
        key: 'user_' + data.id,
        userid: data.id,
        id: data.id,
        username: data.username,
        password: '',
        avatar: data.avatar,
        role: data.role,
        tag: data.tag,
        online: 'on',
        createAt: data.createAt,
      };
      // 全局保存用户信息
      commit(SET_USER, user);
      return data;
    }
  },
};

export default actions;
