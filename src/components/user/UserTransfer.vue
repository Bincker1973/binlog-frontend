<template>
  <div class="user-transfer flex-row justify-content-center">
    <el-transfer :data="userList" v-model="selectedUserIds" :props="{key: 'id', label: 'username'}" :titles="['用户列表', '已选']" >
      <template #default="{option}">
        <span class="d-inline-block" style="line-height: 40px">
          <el-avatar :src="option.headImg" style="vertical-align: bottom" class="mr-2" />
          <span>{{option.username}}</span>
        </span>
      </template>
    </el-transfer>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from "vue-class-component";
import UserInfo from "@/domain/UserInfo";
import UserService from "@/service/UserService";

@Options({
  props: {
    value: {
      type: Array
    }
  },
  model: {
    prop: "value",
    event: "change"
  },
  data(): any{
    return {
      userList: [],
      selectedUserIds: []
    }
  },
  async mounted(): Promise<void>{
    await this.loadUserList()
  },
  watch: {
    value(value: number[]): void{
      this.selectedUserIds = value
    },
    selectedUserIds(value: number[]): void{
      this.$emit("change", value)
    }
  }
})
export default class UserTransfer extends Vue{
  userList: UserInfo[]
  selectedUserIds: number[]

  private async loadUserList(): Promise<void>{
    this.userList = await UserService.getAllUserList()
  }

  /**
   * 获取已选中的用户信息列表
   */
  getSelectedUserList(): UserInfo[]{
    return this.userList.filter(u=>this.selectedUserIds.find(id=>id === u.id))
  }
}
</script>

<style lang="scss">
.user-transfer .el-transfer-panel__item .el-checkbox__input{
  top: 15px;
}
.user-transfer .el-transfer-panel__item{
  height: auto;
}
</style>
