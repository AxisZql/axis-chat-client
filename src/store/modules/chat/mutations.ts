import Vue from 'vue';
import {
  SET_SOCKET,
  SET_DROPPED,
  SET_ACTIVE_GROUP_USER,
  ADD_GROUP_MESSAGE,
  SET_GROUP_MESSAGES,
  ADD_FRIEND_MESSAGE,
  SET_FRIEND_MESSAGES,
  SET_ACTIVE_ROOM,
  SET_GROUP_GATHER,
  SET_FRIEND_GATHER,
  SET_USER_GATHER,
  DEL_GROUP,
  DEL_FRIEND,
  ADD_UNREAD_GATHER,
  LOSE_UNREAD_GATHER,
  SET_GROUP_ALL_USER,
  SET_GROUP_ONLINE_USER_COUNT,
  DEAL_FRIEND_OFF,
  DEAL_FRIEND_ON,
  SET_FRIEND_SHOW_MSG,
  SET_GROUP_SHOW_MSG,
} from './mutation-types';
import { ChatState } from './state';
import { MutationTree } from 'vuex';
import { DEFAULT_GROUP } from '@/const';
import { use } from 'vue/types/umd';

const mutations: MutationTree<ChatState> = {
  // 保存socket
  [SET_SOCKET](state, payload: any) {
    state.socket = payload;
  },

  // 设置用户是否处于掉线重连状态
  [SET_DROPPED](state, payload: boolean) {
    state.dropped = payload;
  },

  // 设置好友上线事件-axis
  [DEAL_FRIEND_ON](state, payload: number) {
    let f = state.friendGather['user_' + payload];
    f.online = 'y';
    Vue.set(state.friendGather, 'user_' + payload, f);
  },

  // 设置好友下线事件-axis
  [DEAL_FRIEND_OFF](state, payload: number) {
    let f = state.friendGather['user_' + payload];
    f.online = 'n';
    Vue.set(state.friendGather, 'user_' + payload, f);
  },

  // 设置群聊成员信息和在线人数已经各个成员的在线状态-axis
  [SET_GROUP_ALL_USER](state, payload: GroupInfoMsg) {
    // 记录对应群聊的所有成员
    Vue.set(state.activeGroupUser, 'group_' + payload.groupId, {});
    for (let user of payload.userArr) {
      Vue.set(state.activeGroupUser['group_' + payload.groupId], 'user_' + user.userid, user);
    }
    // 设置在线人数
    Vue.set(state.activeGroupOnlineUserCount, 'group_' + payload.groupId, payload.count);
  },

  // 设置群聊在线人数-axis
  [SET_GROUP_ONLINE_USER_COUNT](state, payload: any) {
    Vue.set(state.activeGroupOnlineUserCount, 'group_' + payload.groupId, payload.count);
  },

  // 新增一条群消息-canUse
  [ADD_GROUP_MESSAGE](state, payload: GroupMessage) {
    if (state.groupGather['group_' + payload.groupId].messages) {
      state.groupGather['group_' + payload.groupId].messages!.push(payload);
    } else {
      // vuex对象数组中对象改变不更新问题
      Vue.set(state.groupGather['group_' + payload.groupId], 'messages', [payload]);
    }
  },

  // 设置群消息
  [SET_GROUP_MESSAGES](state, payload: GroupMessage[]) {
    if (payload && payload.length) {
      Vue.set(state.groupGather['group_' + payload[0].groupId], 'messages', payload);
    }
  },

  // 新增一条私聊消息
  [ADD_FRIEND_MESSAGE](state, payload: FriendMessage) {
    // @ts-ignore
    let userid = this.getters['app/user'].userid;
    if (payload.friendId === userid) {
      if (state.friendGather['user_' + payload.userid].messages) {
        state.friendGather['user_' + payload.userid].messages!.push(payload);
      } else {
        Vue.set(state.friendGather['user_' + payload.userid], 'messages', [payload]);
      }
    } else {
      if (state.friendGather['user_' + payload.friendId].messages) {
        state.friendGather['user_' + payload.friendId].messages!.push(payload);
      } else {
        Vue.set(state.friendGather['user_' + payload.friendId], 'messages', [payload]);
      }
    }
  },

  // 设置私聊记录
  [SET_FRIEND_MESSAGES](state, payload: FriendMessage[]) {
    // @ts-ignore
    let userId = this.getters['app/user'].userId;
    if (payload && payload.length) {
      if (payload[0].friendId === userId) {
        Vue.set(state.friendGather['user_' + payload[0].userid], 'messages', payload);
      } else {
        Vue.set(state.friendGather['user_' + payload[0].friendId], 'messages', payload);
      }
    }
  },

  // 设置当前聊天对象(群或好友)
  [SET_ACTIVE_ROOM](state, payload: Friend & Group) {
    state.activeRoom = payload;
    // 清空未读消息数
    if (payload.groupId) {
      Vue.set(state.unReadGather, 'group_' + payload.groupId, 0);
    } else {
      Vue.set(state.unReadGather, 'user_' + payload.userid, 0);
    }

  },

  // 设置所有的群的群详细信息(头像,群名字等)
  [SET_GROUP_GATHER](state, payload: Group) {
    Vue.set(state.groupGather, 'group_' + payload.groupId, payload);
  },

  // 设置所有的用户的用户详细信息(头像,昵称等)
  [SET_USER_GATHER](state, payload: User) {
    Vue.set(state.userGather, 'user_' + payload.userid, payload);
  },

  // 设置所有的好友的用户详细信息(头像,昵称等)
  [SET_FRIEND_GATHER](state, payload: User) {
    Vue.set(state.friendGather, 'user_' + payload.userid, payload);
  },

  // 退群
  [DEL_GROUP](state, payload: GroupMap) {
    Vue.delete(state.groupGather, 'group_' + payload.groupId);
  },

  // 删好友
  [DEL_FRIEND](state, payload: UserMap) {
    Vue.delete(state.friendGather, 'user_' + payload.friendId);
  },

  // 给某个聊天组添加未读消息
  [ADD_UNREAD_GATHER](state, payload: string) {
    if (!state.unReadGather[payload]) {
      //payload 对应群聊或者私聊用户的前缀+id
      Vue.set(state.unReadGather, payload, 1);
    } else {
      ++state.unReadGather[payload];
    }
  },

  // 给某个聊天组清空未读消息
  [LOSE_UNREAD_GATHER](state, payload: string) {
    Vue.set(state.unReadGather, payload, 0);
  },

  [SET_FRIEND_SHOW_MSG](state, payload: any) {
    if (state.friendShowMsg[payload.friendId] === undefined) {
      Vue.set(state.friendShowMsg, payload.friendId, {});
    }
    Vue.set(state.friendShowMsg[payload.friendId], payload.watermark, true);
  },

  [SET_GROUP_SHOW_MSG](state, payload: any) {
    if (state.groupShowMsg[payload.groupId] === undefined) {
      Vue.set(state.groupShowMsg, payload.groupId, {});
    }
    Vue.set(state.groupShowMsg[payload.groupId], payload.watermark, true);
  }
};

export default mutations;
