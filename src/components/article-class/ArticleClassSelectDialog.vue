<template>
  <div>
    <el-dialog
        title="选择文章分类"
        :model-value="modelValue"
    >
      <el-button size="small" @click="addArticleClass">添加</el-button>
      <el-tree ref="tree" :props="treeProps" node-key="id" :load="loadNode" @node-click="onSelect" :expand-on-click-node="false" lazy>
        <template v-slot:default="{data}">
        <div class="flex-row justify-content-between align-items-center" style="flex: 1">
          <span class="color-text-title">{{data.title}}</span>
          <span>
            <el-button type="text" class="color-primary" @click="(e)=>addSubArticleClass(e, data)">添加</el-button>
            <el-button type="text" class="color-text-sub" @click="(e)=>editArticleClass(e, data)">修改</el-button>
            <el-button type="text" class="color-warning" @click="(e)=>deleteArticleClass(e, data)">删除</el-button>
          </span>
        </div>
        </template>
      </el-tree>
    </el-dialog>
    <el-dialog
        :title="addOrEdit ? '新增文章分类' : '编辑文章分类'"
        v-model="showArticleClassDialog"
        @close="showArticleClassDialog = false"
    >
      <article-class-form ref="articleClassForm" :value="articleClass" @change="(result)=>this.articleClass = result" />
      <template v-slot:footer>
        <div>
          <el-button size="small" @click="showArticleClassDialog = false">取消</el-button>
          <el-button type="primary" size="small" :loading="formSubmitBtnLoading" @click="onFormSubmitBtnClick">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import {Vue, Options} from "vue-class-component";
import ArticleClass from "@/domain/ArticleClass";
import EmptyData from "@/components/EmptyData.vue";
import ArticleClassForm from "@/components/article-class/ArticleClassForm.vue";
import ArticleClassService from "@/service/ArticleClassService";
import ArticleClassVo from "@/domain/ArticleClassVo";
import CommonUtils from "@/utils/CommonUtils";
import Node from "element-plus/es/components/tree/src/model/node";
import {ElMessageBox} from "element-plus";

declare interface Data{
  showArticleClassDialog: boolean //是否现实分类弹窗
  articleClass: ArticleClass //正在编辑的分类节点
  formSubmitBtnLoading: boolean //提交按钮的加载状态
  treeProps: any //ElTree的节点属性
  addArticleClassParent?: ArticleClassVo //添加的分类的父级节点
  addOrEdit: boolean //添加还是编辑： 添加true  编辑false
}
@Options({
  emits: ['select', 'update:modelValue'],
  components: {ArticleClassForm, EmptyData},
  props: {
    modelValue: Boolean,
  }
})
export default class ArticleClassSelect extends Vue{
  showArticleClassDialog!: boolean
  //新增/编辑对象
  articleClass!: ArticleClass
  formSubmitBtnLoading!: boolean
  treeProps!: any
  addArticleClassParent?: ArticleClassVo
  addOrEdit!: boolean
  treeRootNode?: Node

  data(): Data{
    return {
      showArticleClassDialog: false,
      articleClass: {
        title: ""
      },
      formSubmitBtnLoading: false,
      treeProps: {label: 'title', isLeaf: (data: ArticleClassVo)=>data.childrenNum < 1},
      addArticleClassParent: null,
      addOrEdit: true
    }
  }

  /**
   * 节点选中事件
   */
  private onSelect(data: ArticleClassVo): void{
    this.$emit("select", Object.assign({}, data))
    this.$emit("update:modelValue", false)
  }

  /**
   * 加载数据
   */
  private async loadNode(node: Node, resolve: (_:ArticleClass[])=>void): Promise<void>{
    if(node.level === 0){
      this.treeRootNode = node
    }
    resolve((await ArticleClassService.searchByParent(node.data?.id)))
  }

  /**
   * 添加新的文章分类
   */
  private addArticleClass(): void{
    this.articleClass = {title: "", visible: true}
    this.addArticleClassParent = null
    this.addOrEdit = true
    this.showArticleClassDialog = true
  }

  /**
   * 添加子文章分类
   */
  private addSubArticleClass(e: TouchEvent, data: ArticleClassVo): void{
    e.stopPropagation()
    this.articleClass = {title: "", visible: true}
    this.addArticleClassParent = data
    this.addOrEdit = true
    this.showArticleClassDialog = true
  }

  /**
   * 修改
   */
  private editArticleClass(e: TouchEvent, data: ArticleClassVo): void{
    e.stopPropagation()
    this.articleClass = data
    this.addOrEdit = false
    this.showArticleClassDialog = true
  }

  /**
   * 删除
   */
  private deleteArticleClass(e: TouchEvent, data: ArticleClassVo): void{
    e.stopPropagation()
    ElMessageBox.confirm("是否确定删除?", "提示")
        .then(async ()=>{
          await ArticleClassService.delete(data as ArticleClass)
          this.refreshTree()
        })
        .catch(CommonUtils.emptyFun)
  }

  /**
   * 刷新树节点
   */
  private refreshTree(key?: number){
    const tree = this.$refs.tree as any
    const node = key ? tree.getNode(key) : this.treeRootNode
    if(!node) return;
    node.loaded = false;
    (node as any).loadData.call(node)
  }

  /**
   * 提交按钮点击
   */
  private async onFormSubmitBtnClick(): Promise<void>{
    const form = this.$refs.articleClassForm as ArticleClassForm;
    if(!(await form.validate())) return;
    this.formSubmitBtnLoading = true
    try{
      if(this.addOrEdit){
        if(this.addArticleClassParent){
          this.articleClass.parent = this.addArticleClassParent
        }
        await ArticleClassService.post(this.articleClass)
      }else{
        await ArticleClassService.put(this.articleClass)
      }
      this.refreshTree()
      this.showArticleClassDialog = false
    }finally {
      this.formSubmitBtnLoading = false
    }
  }
}
</script>
<style lang="scss">
</style>
