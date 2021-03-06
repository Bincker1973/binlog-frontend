<template>
  <div id="nav">
    <router-link to="/" class="d-flex align-items-center">
      <img :src="logo" alt="logo" height="50" />
      <h1 id="nav-title">{{ profile?.name || "Blog" }}</h1>
    </router-link>
    <div class="mx-1">
      <slot/>
    </div>
    <el-menu id="nav-menu" mode="horizontal" router :default-active="currentPath" @select="onSelectMenu" menu-trigger="click">
      <template v-for="item in menuList">
        <template v-if="item.visible">
          <el-menu-item v-if="!item.children || !item.children.length" :key="item.title" :index="item.route">
            <el-badge v-if="item.title === '消息' && unreadMessageCount && currentPath !== '/message'" :value="unreadMessageCount" style="line-height: initial">{{item.title}}</el-badge>
            <span v-else>{{item.title}}</span>
          </el-menu-item>
          <el-sub-menu v-else :key="item.route" index="0">
            <template #title>{{item.title}}</template>
            <el-menu-item v-for="submenu in item.children" :key="submenu.title" :index="item.route">{{submenu.title}}</el-menu-item>
          </el-sub-menu>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script lang="ts">
import {library} from "@fortawesome/fontawesome-svg-core";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import {Options, Vue} from "vue-class-component";
import UserInfo from "@/domain/UserInfo";
import MessageService from "@/service/MessageService";
library.add(faBars)

declare interface Menu{
  title: string,
  route: string,
  children?: Menu[],
  visible: boolean
}

@Options({
  props: ['profile'],
  mounted(): void{
    this.unWatchUserInfo = this.$store.watch(s=>s.userInfo, this.onUserInfoChange)
    if(this.$store.state.isLogged){
      const userInfo = this.$store.state.userInfo
      if(userInfo.isBlogger || userInfo.isAdmin){
        this.netDiskFileMenu.visible = true
      }
      if(userInfo.isAdmin){
        this.adminMenu.visible = true
      }
      this.messageMenu.visible = true
      this.refreshUnreadMessageCount()
    }
  },
  computed: {
    currentPath(){
      return this.$route.path;
    }
  },

  beforeDestroy(): void{
    this.unWatchUserInfo()
  }
})
export default class NavMenu extends Vue{
  menuList: Menu[]
  logo: any
  unreadMessageCount: number
  netDiskFileMenu: Menu
  messageMenu: Menu
  adminMenu: Menu
  passwordMenu: Menu

  data(): any{
    this.netDiskFileMenu = {
      title: "网盘",
      route: "/net-disk-file/",
      visible: false
    };
    this.messageMenu = {
      title: "消息",
      route: "/message",
      visible: false
    };
    this.adminMenu = {
      title: "管理",
      route: "/admin/overview",
      visible: false
    };
    this.passwordMenu = {
      title: "密码",
      route: "/password",
      visible: false
    };
    return {
      logo: require("@/assets/logo.png"),
      unreadMessageCount: 0,
      menuList: [
        {
          title: "首页",
          route: "/",
          visible: true
        },
        {
          title: "归档",
          route: "/archives",
          visible: true
        },
        this.messageMenu,
        this.adminMenu,
        this.netDiskFileMenu,
        this.passwordMenu,
        {
          title: "表情",
          route: "/expression",
          visible: true
        },
        {
          title: "关于",
          route: "/about",
          visible: true
        }
      ]
    }
  }

  onUserInfoChange(userInfo: UserInfo): void{
    if(userInfo){
      this.netDiskFileMenu.visible = userInfo.isBlogger || userInfo.isAdmin
      this.adminMenu.visible = userInfo.isAdmin
      this.messageMenu.visible = true
      this.passwordMenu.visible = true
    }else{
      this.netDiskFileMenu.visible = false
      this.adminMenu.visible = false
      this.messageMenu.visible = false
      this.passwordMenu.visible = false
    }
    this.menuList = this.menuList.concat();
  }

  /**
   * 刷新未读消息
   */
  async refreshUnreadMessageCount(): Promise<void>{
    const value = await MessageService.unreadCount();
    let total = 0;
    for (let k in value) total += value[k];
    this.unreadMessageCount = total;
  }

  /**
   * 切换菜单事件
   * @param index 下标
   */
  async onSelectMenu(index: number): Promise<void>{
    if(this.menuList[index] !== this.messageMenu && this.$store.state.isLogged){
      await this.refreshUnreadMessageCount();
    }
  }
}
</script>
<style scoped lang="scss">
@import "src/style/mixin-common";
@import "src/style/var-device-width";
@import "src/style/var-layout";

$nav-padding-horizontal: 1em;
#nav{
  height: $nav-height;
  border-bottom: solid 1px #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: $nav-padding-horizontal;
  padding-right: $nav-padding-horizontal;
  @include background-nav;
}
#nav-menu{
  flex-grow: 1;
  overflow: hidden;
  justify-content: end;
  border-bottom: none;
}

@media (max-width: $device-width-md) {
  #nav-title{
    font-size: 1.5em;
    word-break: keep-all;
  }
}
</style>
