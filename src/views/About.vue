<template>
  <div>
    <el-card>
      <h2>关于我</h2>
      <p>一个搬了三四年砖的全栈攻城狮<del class="color-text-sub">(社畜)</del>，<del class="color-text-sub">最近辞职在家写博客(混日子)</del>，目前在贵州一家不知名企业板砖</p>
      <p><b>语言：</b>主打Java，会一点C/C艹，拍黄片<del class="color-text-sub">(PHP)</del>、C#、SQL、JavaScript/TypeScript、Python、CSS/SASS/HTML都半瓶水的样子</p>
      <p><b>框架：</b>必须嘚Spring了,什么Jpa、mybatis啥的通吃<span class="color-text-sub">(比较喜欢Jpa)</span>、前端React和Vue都会(JQuery就不说了吧)、写过微信小程序、写过Android</p>
      <p><b>硬件：</b>自学过51<span class="color-text-sub">(其实就写了几个程序让几个二极管来回闪，后面资料都丢了网上也不好找就落下了)</span>、自学过STM32、玩过Arduino，硬件比较菜，因为没多少时间折腾，但是兴趣浓厚，一直想自制无人机、潜水艇啥的</p>
      <p><b>操作系统：</b>主玩Arch<span class="color-text-sub">(生产、娱乐、休闲)</span>、玩过debian、deepin、mint，<del class="color-text-sub">(啥？windows?)</del></p>
      <p><b>游戏：</b>偶尔会玩LOL<del class="color-text-sub">(白银彩笔)</del>、饥荒三百天<del class="color-text-sub">(有朋友的话)</del>、古墓、求生之路、只狼<del class="color-text-sub">(我是盗版我可耻，等有钱了再弥补，犹豫就会败北)</del></p>
      <p><b>音乐：</b>杰伦、纯音乐、蒸汽波、偶尔听点电音</p>
      <p><b>其他：</b>喜欢钻研、折腾，完美主义，生人放不开熟人收不了，喜欢交朋友</p>
      <p><b>QQ：</b>1229732681</p>
      <p><b>WeChat：</b>bincker1973</p>
      <p><b>Telegram：</b><a class="color-text-link" href="https://t.me/bincker" target="_blank" title="@bincker">@bincker</a></p>
      <p><b>mail：</b>qq mail</p>
      <p>
        <a :href="payImage" target="_blank" title="请我喝一杯Java">
          <el-image :src="begImage" />
        </a>
      </p>
      <h2>关于博客</h2>
      <p>一直想自己编写一个博客，可总是因为自己太完美主义，每次写了一点不满意又重写，这样反反复复了好几次，终于我决定现写完再慢慢优化，于是就有了这个我花了几个月时间编写的小网站。</p>
      <p>我参考过很多人的博客，我个人比较注重功能，外观的话只要不丑就行，所以博客看起来比较平庸。前端的api我都将其与页面分隔开了，想重写前端的朋友可以轻松的魔改。</p>
      <p>因为时间和精力有限，没有写后台管理，但是后期会慢慢加上。</p>
      <p>我会将我的一些稀奇古怪的想法、实战经历、编程技巧记录在这里，和大家一起分享、一起讨论、一起学习。</p>
      <p>这个网站是面向个人的，我会把我自己需要用到的功能陆续实现，这些功能包括：密码管理、常用软件下载（它将自动解析来源并提供最新版本和历史版本）、表情包、统计资讯(例如各种排行)、网盘、图库、备份、RSS。</p>
      <p>这个项目是开源的，我会发布一篇搭建教程让大家都能拥有自己的博客，虽然写的不是很好<del class="color-text-sub">(谦虚)</del>，但是应该能满足大部分人的需求。如果有兴趣的话，可以联系我一起开发这个项目。</p>
      <p>另外，希望小伙伴们发表言论态度友好，遵守法律法规。</p>
      <p><b>后台：</b>SpringBoot、SpringSecurity、SpringDataJpa</p>
      <p><b>前台：</b>Vue2、TypeScript、axios、markdown-it-vue、element-ui</p>
      <p><a href="https://github.com/Bincker1973/binlog" target="_blank" class="color-text-link">后台项目</a></p>
      <p><a href="https://github.com/Bincker1973/binlog-frontend" target="_blank" class="color-text-link">前台项目</a></p>
      <template v-if="$store.state.isLogged">
        <h2>留言板</h2>
        <comment-reply-input v-model="commentContent" btn-title="留言" class="mt-2" placeholder="来都来了，不留下点什么吗？" @submit="leavingMessage">
          <el-checkbox slot="action" title="你将无法删除你的留言" v-model="isAnonymous">匿名</el-checkbox>
        </comment-reply-input>
        <comment-list :load-data="loadLeftMessagePage" ref="commentList" />
      </template>
    </el-card>
  </div>
</template>
<script lang="ts">
import CommentReplyInput from "@/components/comment/CommentReplyInput.vue";
import {Options, Vue} from "vue-class-component";
import CommentList from "@/components/comment/CommentList.vue";
import {Comment} from "@/domain/Comment";
import LeftMessageService from "@/service/LeftMessageService";
import Pageable from "@/domain/Pageable";
import Page from "@/domain/Page";
import {ElMessage} from "element-plus";

@Options({
  components: {CommentList, CommentReplyInput},
})
export default class About extends Vue {
  commentContent: string
  isAnonymous: boolean
  payImage = require("@/assets/pay.webp")
  begImage = require("@/assets/beg.jpg")

  data(): any{
    return {
      commentContent: "",
      isAnonymous: false
    }
  }

  /**
   * 加载留言分页
   */
  async loadLeftMessagePage(pageable: Pageable): Promise<Page<Comment>>{
    return await LeftMessageService.page(pageable);
  }

  /**
   * 进行留言
   */
  async leavingMessage(): Promise<void>{
    if(!this.commentContent.trim()){
      ElMessage.warning("请输入评论内容")
      return;
    }
    const comment = await LeftMessageService.leavingMessage(this.commentContent, this.isAnonymous);
    (this.$refs.commentList as CommentList).addComment(comment)
    this.commentContent = ""
  }
}
</script>
