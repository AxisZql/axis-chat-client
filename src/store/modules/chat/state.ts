import { Socket } from 'socket.io-client';

export interface ChatState {
  socket: any;
  dropped: boolean; // 是否离线
  activeGroupUser: ActiveGroupUser; // 记录对应群聊所有用户的信息
  activeGroupOnlineUserCount: GroupOnlineUserCount; // 记录对应群聊的在线人数信息
  activeRoom: (Group & Friend) | null; // 记录当前处于的房间
  groupGather: GroupGather; // 记录所有群聊信息
  userGather: FriendGather; // 记录所有用户信息
  friendGather: FriendGather; // 记录所有好友信息
  groupShowMsg: GroupMsgMap; //已经显示当前用户发送群聊的消息记录
  friendShowMsg: FriendMsgMap;
  unReadGather: UnReadGather;//记录用户未读消息
}

const chatState: ChatState = {
  // @ts-ignore
  socket: null,
  dropped: false,
  activeGroupUser: {},
  activeGroupOnlineUserCount: {},
  activeRoom: null,
  groupGather: {},
  userGather: {},
  friendGather: {},
  groupShowMsg: {},
  friendShowMsg: {},
  unReadGather: {},
};

export default chatState;
