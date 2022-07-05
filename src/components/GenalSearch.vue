<template>
  <div class="search">
    <div class="search-select">
      <a-select
        show-search
        placeholder="搜索聊天组"
        :default-active-first-option="false"
        :show-arrow="false"
        :filter-option="false"
        :not-found-content="null"
        @search="handleSearch"
      >
        <a-select-option v-for="(chat, index) in searchData" :key="index" @click="selectChat(chat)">
          <div v-if="chat.username">{{ chat.username }}</div>
          <div v-if="chat.groupName">{{ chat.groupName }}</div>
        </a-select-option>
      </a-select>

      <a-dropdown class="search-dropdown">
        <a-icon type="plus-circle" class="search-dropdown-button" />
        <a-menu slot="overlay">
          <a-menu-item>
            <div @click="() => (visibleAddGroup = !visibleAddGroup)">创建群</div>
          </a-menu-item>
          <a-menu-item>
            <div @click="() => (visibleJoinGroup = !visibleJoinGroup)">搜索群</div>
          </a-menu-item>
          <a-menu-item>
            <div @click="() => (visibleAddFriend = !visibleAddFriend)">搜索用户</div>
          </a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>

    <a-modal v-model="visibleAddGroup" footer="" title="创建群">
      <div style="display: flex">
        <a-input v-model="groupName" placeholder="请输入群名字"></a-input>
        <a-button @click="addGroup" type="primary">确定</a-button>
      </div>
    </a-modal>
    <a-modal v-model="visibleJoinGroup" footer="" title="搜索群">
      <div style="display: flex" v-if="visibleJoinGroup">
        <a-select
          show-search
          placeholder="请输入群名字"
          style="width: 90%"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :not-found-content="null"
          @search="handleGroupSearch"
          @change="handleGroupChange"
        >
          <a-select-option v-for="(group, index) in groupArr" :key="index" @click="handleGroupSelect(group)">
            <div>{{ group.groupName }}</div>
          </a-select-option>
        </a-select>
        <a-button @click="joinGroup" type="primary">加入群</a-button>
      </div>
    </a-modal>
    <a-modal v-model="visibleAddFriend" footer="" title="搜索用户">
      <div style="display: flex" v-if="visibleAddFriend">
        <a-select
          show-search
          placeholder="请输入用户名"
          style="width: 90%"
          :default-active-first-option="false"
          :show-arrow="false"
          :filter-option="false"
          :not-found-content="null"
          @search="handleUserSearch"
          @change="handleUserChange"
        >
          <a-select-option v-for="(user, index) in userArr" :key="index" @click="handleUserSelect(user)">
            <div>{{ user.username }}</div>
          </a-select-option>
        </a-select>
        <a-button @click="addFriend" type="primary">添加好友</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { isContainStr, processReturn } from '@/utils/common';
import * as apis from '@/api/apis';
import { nameVerify } from '@/utils/common';
const chatModule = namespace('chat');
const appModule = namespace('app');

@Component
export default class GenalSearch extends Vue {
  @appModule.Getter('token') token: string;

  @chatModule.State('activeRoom') activeRoom: Group & Friend;
  @chatModule.Getter('groupGather') groupGather: GroupGather;
  @chatModule.Getter('friendGather') friendGather: FriendGather;

  visibleAddGroup: boolean = false;
  visibleJoinGroup: boolean = false;
  visibleAddFriend: boolean = false;
  groupName: string = '';
  searchData: Array<Group | Friend> = [];
  groupId: number = 0;
  groupArr: Array<Group> = [];
  friendId: number = 0;
  userArr: Array<User> = [];

  created() {
    this.getSearchData();
  }

  @Watch('groupGather')
  changeGroupGather() {
    this.getSearchData();
  }

  @Watch('friendGather')
  changeFriendGather() {
    this.getSearchData();
  }

  getSearchData() {
    this.searchData = [...Object.values(this.groupGather), ...Object.values(this.friendGather)];
  }

  handleSearch(value: string) {
    let mySearchData = [];
    this.searchData = [...Object.values(this.groupGather), ...Object.values(this.friendGather)];
    for (let chat of this.searchData) {
      // @ts-ignore
      if (chat.username) {
        // @ts-ignore
        if (isContainStr(value, chat.username)) {
          mySearchData.push(chat);
        }
        // @ts-ignore
      } else if (isContainStr(value, chat.groupName)) {
        mySearchData.push(chat);
      }
    }
    this.searchData = mySearchData;
  }

  async handleGroupSearch(value: string) {
    if (!value) {
      return;
    }
    let req: SearchGroupReq = {
      groupName: value,
      accessToken: this.token,
    };
    let res = await apis.getGroupsByName(req);
    let data = processReturn(res);
    this.groupArr = data.groupList;
    for (let i = 0; i < this.groupArr.length; i++) {
      this.groupArr[i].groupId = this.groupArr[0].id;
    }
  }

  handleGroupSelect(group: Group) {
    this.groupId = group.groupId;
  }

  handleGroupChange() {
    this.groupArr = [];
  }

  async handleUserSearch(value: string) {
    if (!value) {
      return;
    }
    let searchUserReq: SearchUserReq = {
      accessToken: this.token,
      username: value,
    };
    let res = await apis.getUsersByName(searchUserReq);
    let data = processReturn(res);
    this.userArr = data.userList;
    for (let i = 0; i < this.userArr.length; i++) {
      this.userArr[i].userid = this.userArr[0].id;
    }
  }

  handleUserSelect(friend: Friend) {
    this.friendId = friend.userid;
  }

  handleUserChange() {
    this.userArr = [];
  }

  selectChat(activeRoom: User | Group | Friend) {
    this.$emit('setActiveRoom', activeRoom);
  }

  // 创建群聊
  addGroup() {
    this.visibleAddGroup = false;
    if (!nameVerify(this.groupName)) {
      this.visibleAddGroup = true;
      return;
    }
    // this.$emit是调用父组件的事件
    this.$emit('addGroup', this.groupName);
    this.groupName = '';
  }

  joinGroup() {
    this.visibleJoinGroup = false;
    this.$emit('joinGroup', this.groupId);
    this.groupId = 0;
  }

  addFriend() {
    this.visibleAddFriend = false;
    this.$emit('addFriend', this.friendId);
    this.friendId = 0;
  }
}
</script>
<style lang="scss" scoped>
.search {
  position: relative;
  height: 60px;
  padding: 10px;
  display: flex;
  align-items: center;
  .search-select {
    width: 100%;
    .ant-select {
      width: 100%;
    }
  }
  .search-dropdown {
    position: absolute;
    right: 10px;
    top: 13px;
    width: 40px;
    height: 34px;
    font-size: 20px;
    cursor: pointer;
    line-height: 40px;
    color: gray;
    transition: 0.2s all linear;
    border-radius: 4px;
    &:hover {
      background-color: skyblue;
    }
  }
}
</style>
