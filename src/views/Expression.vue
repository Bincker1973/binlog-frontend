<template>
  <div class="flex-row flex-direction-column-reverse-md">
    <el-card class="expression-list flex-4 mr-2 mr-0-md">
      <div class="flex-row flex-wrap">
        <div v-for="expression of list" :key="expression.id" class="position-relative expression-item text-center d-flex justify-content-center align-items-center">
          <el-image :src="expressionUrl + '/' + expression.title" />
          <div class="expression-info">
            <div class="flex-row align-items-center">
              <span class="flex-1 color-white text-ellipsis text-left mr-2" style="font-size: 1.2em">{{expression.title}}</span>
              <el-button type="text" :class="'py-0' + (expression.isAgreed ? '' : ' color-white')" style="font-size: 1.2em" @click="toggleAgree(expression)">
                <font-awesome-icon :icon="[expression.isAgreed ? 'fas' : 'far', 'thumbs-up']" />
                {{ expression.agreedNum }}
              </el-button>
            </div>
            <ul class="list-style-none text-left text-ellipsis">
              <li class="d-inline mr-2 color-text-link" v-for="tag of expression.tags" :key="tag.id" style="font-size: .8em; cursor: pointer" @click="e=>toggleSelectTag(e, tag)">#{{tag.title}}</li>
            </ul>
            <div class="flex-row align-items-center">
              <el-avatar :src="expression.createdUser.headImg" size="small" />
              <span class="color-white ml-2">{{expression.createdUser.username}}</span>
            </div>
          </div>
        </div>
      </div>
      <el-pagination layout="prev,pager,next" :current-page="pageIndex + 1" :page-size="pageSize" :page-count="pageCount" @current-change="page=>gotoPage(page - 1)" />
    </el-card>
    <div class="flex-1">
      <el-card class="expression-filter mb-1-md position-sticky" style="top: 1em">
        <el-input v-model="keywords" placeholder="关键字" size="small" suffix-icon="el-icon-search" ref="searchInput" clearable @clear="gotoPage" />
        <ul class="list-style-none mt-2">
          <li class="d-inline px-1" v-for="tag of tags" :key="tag.id">
            <el-tag size="small" style="cursor: pointer" :effect="selectedTagIds.has(tag.id) ? 'dark' : 'plain'" @click="e=>toggleSelectTag(e, tag)">{{ tag.title }}({{ tag.expressionNum }})</el-tag>
          </li>
        </ul>
        <el-button type="primary" class="mt-2" style="width: 100%" @click="onUpload" v-if="$store.state.isHappy">上传</el-button>
        <el-dialog v-model="showUploadPanel" @close="showUploadPanel = false" append-to-body>
          <expression-upload-panel @complete="onUploadComplete" />
        </el-dialog>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts">
import {Options, Vue} from "vue-class-component";
import ExpressionTag from "@/domain/ExpressionTag";
import ExpressionService from "@/service/ExpressionService";
import ExpressionVo from "@/domain/ExpressionVo";
import {URL_EXPRESSION} from "@/constants/UrlApiExpression";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faThumbsUp} from "@fortawesome/free-solid-svg-icons";
import {faThumbsUp as faRegularThumbsUp} from "@fortawesome/free-regular-svg-icons";
import ExpressionUploadPanel from "@/components/expression/ExpressionUploadPanel.vue";
import {AppProvider} from "@/App.vue";
library.add(faThumbsUp, faRegularThumbsUp)

@Options({
  components: {ExpressionUploadPanel},
  inject: ['app'],
  created(): void{
    this.gotoPage()
    this.loadData()
  },
  mounted(): void{
    (this.$refs.searchInput.$refs.input as HTMLElement).addEventListener("keydown", this.onSearchInputKeyDown);
  },
  beforeDestroy(): void{
    ((this.$refs.searchInput as any).$refs.input as HTMLElement).removeEventListener("keydown", this.onSearchInputKeyDown);
  }
})
export default class Expression extends Vue{
  list: ExpressionVo[]
  keywords: string
  tags: ExpressionTag[]
  selectedTagIds: Set<number>
  pageIndex: number
  pageCount: number
  pageSize: number
  expressionUrl: string
  showUploadPanel: boolean
  app: AppProvider

  data(): any{
    return {
      list: [],
      keywords: "",
      tags: [],
      selectedTagIds: new Set(),
      pageIndex: 0,
      pageCount: 0,
      pageSize: 20,
      expressionUrl: URL_EXPRESSION,
      showUploadPanel: false
    }
  }

  /**
   * 加载表情分页数据
   */
  async gotoPage(pageNumber = 0): Promise<void>{
    this.pageIndex = pageNumber
    const result = await ExpressionService.getExpressionPage(this.keywords, [...this.selectedTagIds], {page: this.pageIndex, size: this.pageSize})
    this.pageCount = result.totalPages
    this.list = result.content
    scrollTo(0, 0)
  }

  async loadData(): Promise<void>{
    this.tags = await ExpressionService.getAllTags()
  }

  /**
   * 上传成功
   */
  onUploadComplete(result: ExpressionVo[]): void{
    this.list.unshift(...result)
    this.showUploadPanel = false
  }

  /**
   * 点赞
   */
  async toggleAgree(expression: ExpressionVo): Promise<void>{
    const result = await ExpressionService.toggleAgree(expression.id);
    expression.isAgreed = result.value;
    expression.agreedNum += result.value ? 1 : -1
  }

  /**
   * 选择标签
   * @param e
   * @param tag
   */
  toggleSelectTag(e: TouchEvent, tag: ExpressionTag): void{
    if(e.ctrlKey) {
      if (this.selectedTagIds.has(tag.id)) {
        this.selectedTagIds.delete(tag.id)
      } else {
        this.selectedTagIds.add(tag.id)
      }
    }else{
      if(this.selectedTagIds.size === 1 && this.selectedTagIds.has(tag.id)) {
        this.selectedTagIds.clear();
      }else{
        this.selectedTagIds.clear()
        this.selectedTagIds.add(tag.id)
      }
    }
    this.gotoPage()
  }

  onUpload(): void {
    if (!this.$store.state.isLogged) {
      this.app.openLoginDialog();
      return;
    }
    this.showUploadPanel = true
  }

  /**
   * 搜索
   */
  onSearchInputKeyDown(e: KeyboardEvent): void{
    if(e.key !== "Enter")return;
    this.gotoPage()
  }
}
</script>

<style scoped lang="scss">
@import "src/style/var-layout";
.expression-list{
  min-height: $router-view-height;
}
.expression-filter{
}
.expression-item{
  flex: 0 0 25%;
  min-height: 150px;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, .1);
  transition: box-shadow .5s;
  overflow: hidden;
}
.expression-info{
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 5px 5px;
  opacity: 0;
  transform: translateY(15px);
  background-image: linear-gradient(to top, rgba(80, 80, 80, .8), transparent);
  transition: opacity .5s, transform .5s;
}
.expression-item:hover{
  box-shadow: 0 0 12px 0 rgba(0, 0, 0, .1);
}
.expression-item:hover>.expression-info{
  transform: translateY(0px);
  opacity: 1;
}
</style>
