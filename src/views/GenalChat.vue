<template>
  <div
    class="chat"
    :style="{
      '--bg-image': `url('${background}')`,
    }"
  >
    <!-- <genal-music></genal-music>   -->
    <div class="chat-part1" v-if="visibleTool">
      <genal-tool @logout="logout"></genal-tool>
    </div>
    <div class="chat-part2">
      <genal-search @addGroup="addGroup" @joinGroup="joinGroup" @addFriend="addFriend" @setActiveRoom="setActiveRoom"> </genal-search>
      <genal-room @setActiveRoom="setActiveRoom"></genal-room>
    </div>
    <div class="chat-part3">
      <a-icon class="chat-team" type="message" @click="toggleDrawer" />
      <div class="chat-tool">
        <a-icon type="menu-fold" @click="toggleTool" v-if="visibleTool" />
        <a-icon type="menu-unfold" @click="toggleTool" v-else />
      </div>
      <genal-message v-if="activeRoom"></genal-message>
    </div>
    <a-drawer placement="left" :closable="false" :visible="visibleDrawer" @close="toggleDrawer" style="height: 100%">
      <div class="chat-drawer">
        <genal-search @addGroup="addGroup" @joinGroup="joinGroup" @addFriend="addFriend" @setActiveRoom="setActiveRoom"> </genal-search>
        <genal-room @setActiveRoom="setActiveRoom"></genal-room>
      </div>
    </a-drawer>
    <!-- 登陆注册模块 -->
    <genal-join @register="handleRegister" @login="handleLogin" :showModal="showModal"></genal-join>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import GenalTool from '@/components/GenalTool.vue';
import GenalJoin from '@/components/GenalJoin.vue';
import GenalRoom from '@/components/GenalRoom.vue';
import * as apis from '@/api/apis';
import GenalMessage from '@/components/GenalMessage.vue';
import GenalSearch from '@/components/GenalSearch.vue';
// import GenalMusic from '@/components/GenalMusic.vue';
import { namespace } from 'vuex-class';
import { processReturn } from '@/utils/common';
const appModule = namespace('app');
const chatModule = namespace('chat');

@Component({
  components: {
    GenalTool,
    GenalJoin,
    GenalRoom,
    GenalMessage,
    GenalSearch,
    // GenalMusic,
  },
})
export default class GenalChat extends Vue {
  @appModule.Getter('user') user: User;
  @appModule.Getter('token') token: string;
  @appModule.Mutation('clear_user') clearUser: Function;
  @appModule.Action('login') login: Function;
  @appModule.Action('register') register: Function;
  @appModule.Action('getUserInfoByToken') getUserInfoByToken: Function;
  @appModule.Getter('background') background: string;

  @chatModule.Getter('socket') socket: any;
  @chatModule.Getter('userGather') userGather: FriendGather;
  @chatModule.Getter('groupGather') groupGather: GroupGather;
  @chatModule.Getter('activeRoom') activeRoom: Friend & Group;
  @chatModule.Mutation('set_active_room') _setActiveRoom: Function;
  @chatModule.Action('registerWS') registerWS: Function;
  @chatModule.Action('createGroup') createGroup: Function;
  @chatModule.Action('JoinGroup') JoinGroup: Function;
  @chatModule.Action('AddFriend') AddFriend: Function;
  @chatModule.Action('getChatDataAfterLogin') getChatDataAfterLogin: Function;

  showModal: boolean = false;
  visibleDrawer: boolean = false;
  visibleTool: boolean = true;

  created() {
    if (!this.user.userid) {
      // 如果没有登陆
      this.showModal = true;
    } else {
      // 如果用户已经是登陆了，则直接创建websocket连接
      this.handleJoin();
    }
  }

  // 登录
  async handleLogin(user: User) {
    let res = await this.login(user);
    if (res) {
      let req: GetUserInfoByTokenReq = {
        accessToken: this.token,
      };
      // 通过token获取用户信息
      this.handleGetUserInfo(req);
      this.getChatDataAfterLogin(req);// 获取历史聊天记录·
    }
  }

  // 注册
  async handleRegister(user: User) {
    let res = await this.register(user);
    if (res) {
      let req: GetUserInfoByTokenReq = {
        accessToken: this.token,
      };
      this.handleGetUserInfo(req);
    }
  }

  async handleGetUserInfo(getUserInfoByTokenReq: GetUserInfoByTokenReq) {
    let res = await this.getUserInfoByToken(getUserInfoByTokenReq);
    if (res) {
      // 如果通过凭证正确获取成功用户信息，则建立websocket连接
      this.handleJoin();
    }
  }

  // 进入系统初始化事件，创建websocket连接
  async handleJoin() {
    this.showModal = false;
    this.registerWS(this.token);
  }
  // 把下面的websocket请求换成http
  // 创建群组
  async addGroup(groupName: string) {
    if (!groupName) {
      return;
    }
    let createGroupReq: CreateGroupReq = {
      accessToken: this.token,
      groupName: groupName,
      notice: '这个群主很懒,还没有设置群公告',
    };
    let data = await this.createGroup(createGroupReq);
    if (data) {
      console.log('创建群聊成功');
    }
  }

  // 加入群组
  async joinGroup(groupId: number) {
    let req = {
      accessToken: this.token,
      groupId: groupId,
    };
    let data = await this.JoinGroup(req);
    if (data) {
      console.log('加入群聊成功');
    }
  }

  // 添加好友
  async addFriend(friendId: number) {
    console.log(this.user);
    let req = {
      accessToken: this.token,
      friendId: friendId,
    };
    let data = await this.AddFriend(req);
    if (data) {
      console.log('添加好友成功');
    }
  }

  // 设置当前聊天窗
  setActiveRoom(room: Friend & Group) {
    this._setActiveRoom(room);
  }

  // 注销
  logout() {
    this.clearUser();
    this.$router.go(0);
  }

  toggleDrawer() {
    this.visibleDrawer = !this.visibleDrawer;
  }

  toggleTool() {
    this.visibleTool = !this.visibleTool;
  }
}
</script>
<style lang="scss" scoped>
.chat {
  font-size: 16px;
  z-index: 999;
  max-width: 1000px;
  min-width: 300px;
  width: 100%;
  height: 80%;
  max-height: 900px;
  min-height: 470px;
  position: relative;
  margin: auto 20px;
  box-shadow: 10px 20px 80px rgba(0, 0, 0, 0.8);
  display: flex;
  border-radius: 5px;
  overflow: hidden;
  .chat-part1 {
    width: 74px;
    height: 100%;
    background-color: rgb(0, 0, 0, 0.7);
  }
  .chat-part2 {
    width: 230px;
    height: 100%;
    background-color: rgb(0, 0, 0, 0.3);
  }
  .chat-part3 {
    flex: 1;
    height: 100%;
    background-color: rgb(0, 0, 0, 0.2);
    overflow-y: hidden;
    position: relative;
    .chat-group {
      height: 53px;
      border-bottom: 1px solid #ccc;
      line-height: 50px;
      font-weight: bold;
    }
  }
  .chat-team {
    display: none;
  }
  .chat-tool {
    display: none;
  }
}
.chat::after {
  content: '';
  background: var(--bg-image) 0 / cover fixed;
  position: absolute;
  object-fit: cover;
  width: 100%;
  height: 100%;
  filter: blur(10px);
  transform: scale(1.08);
  z-index: -1;
}

@media screen and (max-width: 768px) {
  .chat {
    margin: 0;
    height: 100%;
    .chat-part2 {
      display: none;
    }
    .chat-team {
      display: block !important;
      position: absolute;
      font-size: 25px;
      top: 17px;
      left: 60px;
      z-index: 999;
      &:active {
        color: skyblue;
      }
    }
    .chat-tool {
      display: block !important;
      position: absolute;
      font-size: 25px;
      top: 13px;
      left: 20px;
      z-index: 999;
      &:active {
        color: skyblue;
      }
    }
  }
}
</style>
