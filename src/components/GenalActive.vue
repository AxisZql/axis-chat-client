<template>
  <div class="active">
    <div v-if="type === 'group'">
      <a-icon type="team" @click="toggleGroupUser" class="active-button" :class="{ heightLight: showGroupUser }" />
      <a-drawer
        placement="right"
        :closable="false"
        :visible="showGroupUser"
        :get-container="getElement"
        @close="toggleGroupUser"
        :wrap-style="{ position: 'absolute' }"
      >
        <div class="active-content" v-if="activeGroupUser['group_' + activeRoom.groupId]">
          <div class="actiev-content-title">群聊管理</div>
          <div class="active-content-sum">在线人数: {{ activeNum }}</div>
          <div class="active-content-users">
            <div class="active-content-user" v-for="data in activeGroupUser['group_' + activeRoom.groupId]" :key="data.userid">
              <genal-avatar :data="data" :showTime="false"></genal-avatar>
              {{ data.username }}
            </div>
          </div>
          <a-button type="danger" class="active-content-out" @click="exitGroup">退出</a-button>
        </div>
      </a-drawer>
    </div>
    <div v-else>
      <a-popconfirm title="确定要删除该好友吗？" placement="bottomRight" ok-text="Yes" cancel-text="No" @confirm="exitFriend">
        <a-icon type="user-delete" class="active-button" />
      </a-popconfirm>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import GenalAvatar from './GenalAvatar.vue';
import { namespace } from 'vuex-class';
const chatModule = namespace('chat');
const appModule = namespace('app');

@Component({
  components: {
    GenalAvatar,
  },
})
export default class GenalActive extends Vue {
  @Prop({ default: 'group' }) type: string;

  @appModule.Getter('user') user: User;

  @chatModule.State('activeRoom') activeRoom: Group & Friend;
  @chatModule.State('socket') socket: any;
  @chatModule.Getter('activeGroupUser') activeGroupUser: ActiveGroupUser;
  @chatModule.Getter('activeGroupOnlineUserCount') activeGroupOnlineUserCount: GroupOnlineUserCount;

  showGroupUser: boolean = false;

  @Watch('type')
  changeType() {
    if (this.type === 'friend') {
      this.showGroupUser = false;
    }
  }

  // 读取群聊在线人数
  get activeNum() {
    return this.activeGroupOnlineUserCount['group_' + this.activeRoom.groupId];
  }

  toggleGroupUser() {
    this.showGroupUser = !this.showGroupUser;
  }

  getElement() {
    return document.getElementsByClassName('message')[0];
  }

  exitGroup() {
    alert('QAQ,推出群聊的功能还有些~~~');
  }

  exitFriend() {
    alert('QAQ,删除好友的功能也还没有写~~~');
  }
}
</script>
<style lang="scss" scoped>
.active {
  position: absolute;
  width: 170px;
  right: 0;
  z-index: 100;
  border-radius: 0 0 5px 5px;
  .active-button {
    position: absolute;
    z-index: 999;
    top: -43px;
    right: 20px;
    font-size: 25px;
    cursor: pointer;
    &:active {
      color: skyblue;
    }
  }
  .active-button.heightLight {
    color: skyblue;
  }
}
::-webkit-scrollbar {
  display: none !important;
}
</style>
