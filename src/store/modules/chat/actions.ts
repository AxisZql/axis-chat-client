import { ActionTree } from 'vuex';
import { ChatState } from './state';
import { RootState } from '../../index';
import qdWebSocket from '@/utils/ws';
import Rwebsocket from 'reconnecting-websocket';
import fetch from '@/api/fetch';
import Vue from 'vue';
import {
  SET_SOCKET,
  SET_DROPPED,
  SET_ACTIVE_GROUP_USER,
  ADD_GROUP_MESSAGE,
  ADD_FRIEND_MESSAGE,
  SET_FRIEND_MESSAGES,
  SET_GROUP_GATHER,
  SET_FRIEND_GATHER,
  SET_USER_GATHER,
  SET_ACTIVE_ROOM,
  DEL_GROUP,
  DEL_FRIEND,
  ADD_UNREAD_GATHER,
  SET_GROUP_ALL_USER,
  SET_GROUP_ONLINE_USER_COUNT,
  DEAL_FRIEND_OFF,
  DEAL_FRIEND_ON,
  SET_FRIEND_SHOW_MSG,
  SET_GROUP_SHOW_MSG,
} from './mutation-types';
import { DEFAULT_GROUP } from '@/const/index';
import { processReturn } from '@/utils/common';

const actions: ActionTree<ChatState, RootState> = {
  // ===== 简单api调用
  // 登陆后获取所有建立关系的对象的聊天记录,需要提交用户的凭证
  async getChatDataAfterLogin({ commit, dispatch }, payload) {
    console.log(payload);
    let res = await fetch.get(`/user/chat-data`, {
      params: payload,
    });
    let data = processReturn(res);
    if (data) {
      dispatch('handleChatData', data);
    }
  },

  async PushImageMsg({ commit }, payload: FormData) {
    let res = await fetch.post(`/push/img-msg`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    let data = processReturn(res);
    enum MessageType {
      text = 'text',
      image = 'image',
    }
    if (data) {
      if (payload.get('type') === 'friend') {
        let msg: FriendMessage = {
          watermark: Number(payload.get('watermark')),
          avatar: payload.get('avatar') + '',
          content: data,
          fromUsername: payload.get('fromUsername') + '',
          id: 0,
          userid: this.state.app.user.userid,
          snowId: payload.get('watermark') + '',
          messageType: MessageType.image,
          friendName: payload.get('friendName') + '',
          friendId: Number(payload.get('friendId')),
          createAt: new Date().toJSON(),
        }
        commit(ADD_FRIEND_MESSAGE, msg);
        commit(SET_FRIEND_SHOW_MSG, {
          friendId: msg.friendId,
          watermark: msg.watermark,
        });
      } else {
        let msg: GroupMessage = {
          watermark: Number(payload.get('watermark')),
          avatar: payload.get('avatar') + '',
          content: data,
          fromUsername: payload.get('fromUsername') + '',
          id: 0,
          userid: this.state.app.user.userid,
          snowId: payload.get('watermark') + '',
          messageType: MessageType.image,
          groupName: payload.get('groupName') + '',
          groupId: Number(payload.get('groupId')),
          createAt: new Date().toJSON(),
        }
        commit(ADD_GROUP_MESSAGE, msg);
        commit(SET_GROUP_SHOW_MSG, {
          groupId: msg.groupId,
          watermark: msg.watermark,
        });
      }
      return data;
    }
  },

  // 创建群聊
  async createGroup({ commit }, payload) {
    let res = await fetch.post(`/group/create`, {
      ...payload,
    });
    let data = processReturn(res);
    if (data) {
      // 添加群聊信息并显示
      let group: Group = {
        key: 'group_' + data.id,
        id: data.id,
        groupId: data.id,
        userid: data.userid,
        groupName: data.groupName,
        notice: data.notice,
        createAt: data.createAt,
      };
      commit(SET_GROUP_GATHER, group);
      return data;
    }
  },

  // 加入群聊
  async JoinGroup({ commit }, payload: any) {
    let res = await fetch.post(`/group/add-group`, {
      ...payload,
    });
    let data = processReturn(res);
    if (data) {
      return data;
    }
  },

  // 发送私聊消息
  async PushFriendMsg({ commit }, payload: any) {
    let res = await fetch.post(`/push/push-friend`, {
      ...payload,
    });
    let data = processReturn(res);
    enum MessageType {
      text = 'text',
      image = 'image',
    }
    let messageType = MessageType.text;
    if (data) {
      let msg: FriendMessage = {
        watermark: payload.watermark,
        id: 0,
        snowId: payload.watermark,
        userid: this.state.app.user.userid,
        friendId: payload.friendId,
        content: payload.content,
        messageType: messageType,
        createAt: new Date().toJSON(),
        fromUsername: payload.fromUsername,
        friendName: payload.friendName,
        avatar: payload.avatar,
      };
      commit(ADD_FRIEND_MESSAGE, msg);
      commit(SET_FRIEND_SHOW_MSG, {
        friendId: msg.friendId,
        watermark: msg.watermark,
      });
      return data;
    }
  },
  // 发送群聊消息
  async PushGroupMsg({ commit }, payload: any) {
    let res = await fetch.post(`/push/push-group`, {
      ...payload,
    });
    let data = processReturn(res);
    enum MessageType {
      text = 'text',
      image = 'image',
    }
    if (data) {
      let msg: GroupMessage = {
        watermark: payload.watermark,
        id: 0,
        snowId: payload.watermark,
        userid: this.state.app.user.userid,
        groupId: payload.groupId,
        content: payload.content,
        messageType: MessageType.text,
        createAt: new Date().toJSON(),
        fromUsername: payload.fromUsername,
        groupName: payload.groupName,
        avatar: payload.avatar,
      };
      commit(ADD_GROUP_MESSAGE, msg);
      commit(SET_GROUP_SHOW_MSG, {
        groupId: msg.groupId,
        watermark: msg.watermark,
      });
      return data;
    }
  },

  // 添加好友
  async AddFriend({ commit }, payload: any) {
    let res = await fetch.post(`/user/add-friend`, {
      ...payload,
    });
    let data = processReturn(res);
    if (data) {
      return data;
    }
  },

  // 创建websocket连接并，实时接收connect层推送过来的消息
  async registerWS({ commit, dispatch, state, rootState }, payload: string) {
    let socket: Rwebsocket = qdWebSocket.initQDWS(`ws:/192.168.101.42:8100/ws`);
    let authReq = {
      accessToken: payload,
    };
    // websocket事件监听函数
    let listnerFun = {
      websocketOnOpen() {
        console.log(authReq);
        // 发送身份验证请求
        socket.send(JSON.stringify(authReq));
      },
      // 连接建立失败重连
      websocketOnError() {
        console.info('连接失败');
      },
      // 数据接收后执行的操作
      websocketOnMessage(msg: string) {
        try {
          if (msg === 'ok') {
            Vue.prototype.$message.success('成功连接，并通过身份验证');
            dispatch('getChatDataAfterLogin', authReq);
            commit(SET_DROPPED, false);
          } else {
            console.log(msg);
            const info = JSON.parse(msg);
            console.info(`push-msg===`, info);
            if (info.length != 2) {
              console.error('push msg format is err');
              return;
            }
            const ty = info[0];
            let resStr = info[1];
            let res = JSON.parse(resStr);
            let activeRoom = state.activeRoom;
            let user = rootState.app.user;
            switch (ty) {
              case 'groupMsg':
                let gm: GroupMessage = {
                  watermark: res.watermark,
                  id: 0,
                  snowId: res.snowId,
                  userid: res.userid,
                  groupId: res.groupId,
                  fromUsername: res.fromUsername,
                  groupName: res.groupName,
                  content: res.content,
                  messageType: res.messageType,
                  createAt: new Date().toJSON(),
                  avatar: res.avatar,
                };
                console.log(state.groupShowMsg, 'get connect msg');
                if (state.groupShowMsg[gm.groupId] == undefined
                  || state.groupShowMsg[gm.groupId][gm.watermark] == undefined) {
                  console.log(state.groupGather[gm.groupId]);
                  commit(ADD_GROUP_MESSAGE, gm);
                }
                if (activeRoom && activeRoom.groupId !== res.groupId) {
                  commit(ADD_UNREAD_GATHER, 'group_' + res.groupId);
                }
                break;
              case 'groupInfo':
                let userArr = new Array();
                for (let user of res.userArr) {
                  let online = 'off';
                  // 群聊没有人在线时为null
                  if (res.onlineUserIds != null && res.onlineUserIds != undefined) {
                    let ok = res.onlineUserIds.indexOf(user.id);
                    if (ok != -1) {
                      online = 'on';
                    }
                  }
                  let tmp: User = {
                    key: 'user_' + user.id,
                    userid: user.id,
                    id: user.id,
                    username: user.username,
                    password: '',
                    avatar: user.avatar,
                    role: user.role,
                    status: user.status,
                    tag: user.tag,
                    createAt: user.createAt,
                    online: online,
                  };
                  userArr.push(tmp);
                }
                let req: GroupInfoMsg = {
                  groupId: res.groupId,
                  count: res.count,
                  onlineUserIds: res.onlineUserIds,
                  userArr: userArr,
                };
                commit(SET_GROUP_ALL_USER, req);
                break;
              case 'groupCount':
                commit(SET_GROUP_ONLINE_USER_COUNT, {
                  groupId: res.groupId,
                  count: res.count,
                });
                break;
              case 'friendOff':
                commit(DEAL_FRIEND_OFF, res.friendId); //处理用户下线
                break;
              case 'friendOn':
                commit(DEAL_FRIEND_ON, res.friendId); // 处理用上线
                break;
              case 'friendMsg':
                if (res.friendId == user.userid || res.userid == user.userid) {
                  let fm: FriendMessage = {
                    watermark: res.watermark,
                    id: 0,
                    snowId: res.snowId,
                    userid: res.userid,
                    friendId: res.friendId,
                    content: res.content,
                    messageType: res.messageType,
                    createAt: new Date().toJSON(),
                    fromUsername: res.fromUsername,
                    friendName: res.friendName,
                    avatar: res.avatar,
                  };
                  console.log(state.groupShowMsg, 'get connect msg');
                  if (state.friendShowMsg[fm.friendId] == undefined || state.friendShowMsg[fm.friendId][fm.watermark] == undefined) {
                    // 设置聊天消息
                    commit(ADD_FRIEND_MESSAGE, fm);
                  }
                  console.log(activeRoom, 'activeRoom');
                  console.log(state.unReadGather);
                  if (activeRoom && (activeRoom.groupId || (activeRoom.userid !== fm.userid && activeRoom.userid !== fm.friendId))) {
                    console.log("一条未读消息")
                    // 如果不在对应的聊天框，则以未读消息的格式提示
                    if (fm.userid !== user.userid) {
                      commit(ADD_UNREAD_GATHER, 'user_' + fm.userid);
                      console.log(state.unReadGather, 'unreader');
                    } else {
                      commit(ADD_UNREAD_GATHER, 'user_' + fm.friendId);
                      console.log(state.unReadGather, 'unreader');
                    }
                  }
                }
                break;
            }
          }
        } catch (event) {
          console.error(`push msg get error========${event}`);
        }
      },
      // 发送消息
      websocketSend(Data: any) {
        // 数据发送
        console.info(`send msg to server========${Data}`);
        // socket.send(JSON.stringify(Data));
      },
      // 关闭连接
      websocketClose(e: any) {
        // 关闭
        console.log('断开连接', e);
        commit(SET_DROPPED, true);
      },
    };
    qdWebSocket.registerListner(socket, {
      open: listnerFun.websocketOnOpen,
      error: listnerFun.websocketOnError,
      message: listnerFun.websocketOnMessage,
      close: listnerFun.websocketOnMessage,
    });
    commit(SET_SOCKET, socket);
  },

  websocketonopen() {
    console.info('连接成功');
  },

  async handleChatData({ commit, dispatch, state, rootState }, payload) {
    let groupGather = state.groupGather;
    let groupArr = payload.groupData;
    let friendArr = payload.friendData;
    let userArr = payload.userData; // 所有在线用户
    if (groupArr.length) {
      for (let group of groupArr) {
        if (group.messages === null) {
          group.messages = [];
        }
        group.key = 'group_' + group.groupId;
        commit(SET_GROUP_GATHER, group);
      }
    }
    if (friendArr.length) {
      for (let friend of friendArr) {
        if (friend.messages === null) {
          friend.messages = [];
        }
        friend.key = 'user_' + friend.friendId;
        commit(SET_FRIEND_GATHER, friend);
        commit(SET_USER_GATHER, friend); //设置记录全局用户的用户表
      }
    }
    if (userArr.length) {
      for (let user of userArr) {
        commit(SET_USER_GATHER, user);
      }
    }

    /**
     * 由于groupgather和userGather都更新了, 但是activeGather依旧是老对象,
     * 这里需要根据老的activeGather找到最新的gather对象,这样才能使得vue的watch监听新gather
     */

    let activeRoom = state.activeRoom;
    let groupGather2 = state.groupGather;
    let friendGather2 = state.friendGather;
    if (!activeRoom) {
      // 更新完数据没有默认activeRoom设置返回数据的第一个群聊
      return commit(SET_ACTIVE_ROOM, groupGather['group_' + groupArr[0].groupId]);
    }
    commit(SET_ACTIVE_ROOM, groupGather2['group_' + activeRoom.groupId] || friendGather2['user_' + activeRoom.userid]);
  },
};

export default actions;
