<template>
  <div class="avatar" v-if="data.userid">
    <a-popover v-if="data.userid !== user.userid" trigger="click">
      <div slot="content" class="avatar-card">
        <a-avatar :size="60" :src="data.avatar" />
        <div v-if="data.fromUsername !== ''">{{ data.fromUsername }}</div>
        <div v-if="data.username !== ''">{{ data.username }}</div>
        <a-button v-if="user.role === 2 || user.role === 3" style="margin-bottom: 5px" @click="deleteUser(data.userid)" type="primary">
          删除用户
        </a-button>
        <a-button @click="_setActiveRoom(data.userid)" type="primary" v-if="friendGather['user_' + data.userid]">进入私聊</a-button>
        <a-button @click="addFriend(data.userid)" type="primary" v-else>添加好友</a-button>
      </div>
      <a-avatar class="avatar-img" :src="data.avatar" />
    </a-popover>
    <a-avatar v-else class="avatar-img" :src="data.avatar" />
    <div>
      <span v-if="data.fromUsername !== ''" class="avatar-name">{{ data.fromUsername }}</span>
      <span v-if="data.username !== ''" class="avatar-name">{{ data.username }}</span>
      <span class="avatar-time" v-if="showTime">{{ _formatTime(data.createAt) }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as api from '@/api/apis';
import { namespace } from 'vuex-class';
const chatModule = namespace('chat');
const appModule = namespace('app');
import { formatTime } from '@/utils/common';
import { processReturn } from '@/utils/common';

@Component
export default class GenalAvatar extends Vue {
  @Prop() data: FriendMessage & GroupMessage & User; // 用户信息
  @Prop({ default: true }) showTime: boolean; // 是否显示时间

  @appModule.Getter('user') user: User;
  @appModule.Getter('token') token: string;
  @chatModule.Getter('userGather') userGather: FriendGather;
  @chatModule.Getter('friendGather') friendGather: FriendGather;
  @chatModule.Getter('socket') socket: any;
  @chatModule.Mutation('set_active_room') setActiveRoom: Function;

  @chatModule.Action('AddFriend') AddFriend: Function;

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

  _formatTime(time: string) {
    return formatTime(time);
  }

  async deleteUser(userid: number) {
    alert('QAQ,管理员删除用户的功能还没有写~~~');
  }

  _setActiveRoom(userid: number) {
    this.setActiveRoom(this.friendGather['user_' + userid]);
  }
}
</script>
<style lang="scss" scoped>
.avatar {
  display: flex;
  align-items: center;
  height: 37px;
  .avatar-img {
    cursor: pointer;
    width: 35px;
    height: 35px;
  }
  .avatar-name {
    margin-left: 5px;
  }
  .avatar-time {
    font-size: 12px;
    color: rgb(255, 255, 255, 0.75);
    margin-left: 3px;
  }
}
.avatar-card {
  display: flex;
  font-size: 18px;
  flex-direction: column;
  align-items: center;
  > div {
    margin: 4px;
  }
}
</style>
