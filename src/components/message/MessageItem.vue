<template>
  <div class="flex-row">
    <el-badge is-dot v-if="!message.isRead">
      <el-avatar v-if="message.fromUser" :src="message.fromUser.headImg"  />
    </el-badge>
    <el-avatar v-else-if="message.fromUser" :src="message.fromUser.headImg"  />
    <div class="flex-1 ml-3">
      <div class="flex-row align-items-center">
        <div class="flex-1">
          <div class="p-1 mb-1"><span class="h5 color-text-title text-bold mr-3">{{message.fromUser.username}}</span><slot name="user-describe"/></div>
          <div class="d-block-md d-none bg-gainsboro p-2" style="border-left: 3px solid #666"><span class="color-text-sub">{{message.additionInfo}}</span></div>
          <CommentContent v-if="message.content != null && message.content !== undefined" :content="message.content" :members="message.members" />
          <div class="mb-1">
            <span class="color-text-sub mr-3">{{message.createdDate}}</span>
            <slot name="actions" />
          </div>
        </div>
        <span class="d-none-md color-text-sub text-ellipsis-3 mr-3" style="max-width: 15%">{{message.additionInfo}}</span>
      </div>
      <slot name="additional" />
      <div class="util-divider-to-right"/>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from "vue-class-component";
import Message from "../../domain/Message";
import CommentContent from "@/components/comment/CommentContent.vue";

@Options({
  components: {CommentContent},
  props: {
    message: Object
  }
})
export default class MessageItem extends Vue{
  message: Message
}
</script>

<style scoped>

</style>
