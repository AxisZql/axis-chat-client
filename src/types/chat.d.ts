// 所有群的群信息
interface GroupGather {
  [groupId: string]: Group; //key-->group_+id
}

// 创建群聊请求
interface CreateGroupReq {
  accessToken: string;
  groupName: string;
  notice: string;
}

// 群组
interface Group {
  key: string; //因为防止friend重复和group的id---> group_+id
  groupId: number;
  id: number;
  userid: number; // 群主id
  groupName: string;
  notice: string;
  messages?: GroupMessage[];
  createAt: string;
}

// 当前用户发送的群聊消息已经显示记录
interface GroupMsgMap {
  [groupId: number]: {
    [watermark: number]: boolean;
  };
}

// 群与用户关联表
interface GroupMap {
  groupId: number;
  userId: number;
}

// 群消息
interface GroupMessage {
  watermark: number;
  id: number;
  snowId: string;
  userid: number;
  groupId: number;
  fromUsername: string;
  groupName: string;
  content: string;
  messageType: MessageType;
  createAt: string;
  avatar: string; //每条消息存发送者头像，减少头像请求IO
}

// 所有好友的好友信息
interface FriendGather {
  [userid: string]: Friend; //key=='user_+id'
}

// 好友
interface Friend {
  key: string;
  userid: number;
  username: string;
  avatar: string;
  role?: number;
  status: number;
  online: string; //对应用户的在线状态y或n
  tag?: string;
  messages?: FriendMessage[];
  createAt: string;
}

// 当前用户发送的私聊消息已经显示记录
interface FriendMsgMap {
  [friendId: number]: {
    [watermark: number]: boolean;
  };
}

// 用户与好友关联表
interface UserMap {
  friendId: number;
  userId: number;
}

// 好友消息
interface FriendMessage {
  watermark: number;
  id: number;
  snowId: string;
  userid: number;
  friendId: number;
  content: string;
  messageType: MessageType;
  createAt: string;
  fromUsername: string;
  friendName: string;
  avatar: string; //每条消息存发送者头像，减少头像请求IO
}

interface SendMessage {
  watermark: number; //消息水印（用来记录唯一成功被投递的消息）
  type: string;
  fromId?: number;
  content: any;
  avatar: string;
  accessToken: string;
  width?: number;
  height?: number;
  messageType: MessageType[0] | MessageType[1];
  fromUsername: string;
  friendName?: string;
  friendId?: number;
  groupName?: string;
  groupId?: number;
}

// 消息类型
declare enum MessageType {
  text = 'text',
  image = 'image',
}

// 图片尺寸
interface ImageSize {
  width: number;
  height: number;
}

// 服务端返回值格式
interface ServerRes {
  code: number;
  msg: string;
  data: any;
}

// 所有群的在线用户合集
interface ActiveGroupUser {
  [key: string]: {
    //groupId->userid->user
    [key: string]: User; //群聊所有成员信息
  };
}

interface GroupOnlineUserCount {
  [key: string]: number; //groupId
}

// 未读消息对象
interface UnReadGather {
  [key: string]: number;
}

// 获取群分页消息参数
interface PagingParams {
  groupId?: number;
  friendId?: number;
  current: number;
  pageSize: number;
  accessToken: string;
}

// 群分页消息返回值
interface PagingResponse {
  messageArr: GroupMessage[];
  userArr: User[];
}

// groupInfo消息推送
interface GroupInfoMsg {
  groupId: number;
  count: number;
  userArr: User[];
  onlineUserIds: number[];
}

// 搜索群聊
interface SearchGroupReq {
  groupName: string;
  accessToken: string;
}
