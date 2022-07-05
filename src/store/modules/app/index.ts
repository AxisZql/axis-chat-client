import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import state, { AppState } from './state';
import { Module } from 'vuex';
import { RootState } from '../../index';

const app: Module<AppState, RootState> = {
  namespaced: true, // namespaced为false的时候，state,mutations,actions全局可以调用，为true，生成作用域，引用时要声明模块名称
  state,
  mutations,
  actions,
  getters,
};

export default app;
