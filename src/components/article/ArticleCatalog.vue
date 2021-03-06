<template>
  <div class="catalog-container">
    <div class="catalog-header">
      <h2>目录</h2>
      <div>
        <div class="catalog-progress-container">
          <span class="color-text-sub">你已经阅读了：{{progress}}</span>
          <div class="catalog-progress">
            <div class="catalog-progress-bar" :style="'width:' + progress"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="catalog-section-container">
      <el-tree
          ref="tree"
          node-key="id"
          :data="sections"
          default-expand-all
          :current-node-key="currentSectionId"
          :highlight-current="true"
          :expand-on-click-node="false"
          auto-expand-parent
          :default-expanded-keys="expandedKeys"
          @node-click="sectionClickEventListener"
      >
        <template v-slot:default="{node}">
        <span
            :id="'section-' + node.data.id"
            :class="node.data.id === currentSectionId ? 'catalog-section-selected' : ''"
        >
          {{ node.label }}
        </span>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script lang="ts">
import ElementPosition from "@/domain/ElementPosition";
import {Options, Vue} from "vue-class-component";
import Throttle from "@/decorators/Throttle";
import ElementUtils from "@/utils/ElementUtils";

interface Section{
  label: string
  nodeName: string
  id: string
  element: Element
  parent?: Section
  children: Section[]
}

let targetElement: Element
let targetElementOffset: ElementPosition
let headers: HTMLElement[]
@Options({
  props: {
    element: [String, Element]
  }
})
export default class ArticleCatalog extends Vue{
  sections!: Section[]
  progress!: string
  currentSectionId!: string|null
  expandedKeys!: string[]
  element!: string | Element

  data(): any{
    return {
      sections: [],
      progress: "00.0%",
      currentSectionId: null,
      expandedKeys: []
    }
  }

  mounted() :void{
    if(typeof this.element === "string"){
      if(document) targetElement = document.querySelector("#" + this.element)
    }else{
      targetElement = this.element
    }
    if(targetElement instanceof Element){
      this.refresh()
    }
    if(document) document.addEventListener("scroll", this.targetScrollEventListener)
  }

  beforeDestroy() : void{
    if(document) document.removeEventListener("scroll", this.targetScrollEventListener)
  }

    //章节点击事件
  sectionClickEventListener(section: Section): void{
    if(!document) return;
    const scrollingElement = document.scrollingElement
    let sectionTop = ElementUtils.getElementPosition(section.element as HTMLElement).offsetTop + (this.$el as HTMLElement).offsetTop
    scrollingElement.scroll(0, sectionTop + 1)
  }

  //文章滚动事件
  @Throttle()
  targetScrollEventListener(): void{
    if(!targetElement || !targetElementOffset) return;
    //滚动框架元素，一般是html
    const scrollingElement = document ? document.scrollingElement : null
    //当前进度(窗口中间), 相对当前元素
    let progress = scrollingElement.scrollTop - targetElementOffset.offsetTop + window.innerHeight/2
    if(progress < 0) progress = 0
    let totalProgress = scrollingElement.scrollHeight - scrollingElement.clientHeight - targetElementOffset.offsetTop
    if(progress > totalProgress) progress = totalProgress
    //计算阅读进度
    this.progress = parseInt((progress / totalProgress * 1000).toString()) / 10 + "%"
    //查找当前阅读章节
    let top = 0
    let currentElement: Element|null = null
    for (let header of headers) {
      top = ElementUtils.getElementPosition(header).offsetTop
      if(top < scrollingElement.scrollTop){
        currentElement = header
      }else{
        break
      }
    }

    this.currentSectionId = decodeURIComponent(currentElement?.id || "")

    if(this.currentSectionId) {
      //  自动滚动目录
      const catalogScrollElement = (this.$el as HTMLElement).querySelector(".catalog-section-container") as HTMLElement
      const catalogOffsetElement = (this.$el as HTMLElement).offsetParent as HTMLElement
      const currentSectionElement = this.$el.querySelector("#section-" + this.currentSectionId) as HTMLElement
      const currentSectionTop = ElementUtils.getElementPosition(currentSectionElement, catalogOffsetElement).offsetTop
      const catalogScrollElementHalfHeight = catalogScrollElement.clientHeight / 2;
      if (
          currentSectionTop > catalogScrollElementHalfHeight && currentSectionTop < catalogScrollElement.scrollTop + catalogScrollElementHalfHeight
          ||
          currentSectionTop < catalogScrollElement.scrollHeight + catalogScrollElement.clientHeight - catalogScrollElementHalfHeight && currentSectionTop - catalogScrollElement.scrollTop > catalogScrollElementHalfHeight
      ){
        catalogScrollElement.scroll(0,currentSectionTop - catalogScrollElementHalfHeight - catalogScrollElement.offsetTop)
      }

      //自动展开目录
      const currentSection = getSectionFromHeader(currentElement as HTMLElement)
      this.expandedKeys = [currentSection.id]
    }
  }

  refresh() :boolean{
    if(!document) return;
    if(!targetElement){
      if(typeof this.element === "string"){
        targetElement = document.querySelector("#" + this.element)
      }else{
        targetElement = this.element
      }
      if(!targetElement) return false;
    }
    //取出所有标题
    headers = Array.from(targetElement.querySelectorAll("h1,h2,h3,h4,h5,h6"))

    //章节的栈，用于组装节点关系
    const sectionStack: Section[] = [];

    //遍历变量
    let header: Element
    const tmpHeaders = headers.concat()
    //开始遍历
    while ((header = tmpHeaders.shift())){
      // if((header as HTMLElement).innerText === "expect_user"){
      //   debugger;
      // }
      //父节点
      let prevSection :Section|null
      //当前节点
      const section:Section = {
        label: header.textContent,
        nodeName: header.nodeName,
        id: decodeURIComponent(header.id),
        element: header,
        children: []
      }
      saveSectionToHeader(header as HTMLElement, section)
      //如果有节点
      if(sectionStack.length){
        prevSection = sectionStack[sectionStack.length - 1]
        const prevChildSection = prevSection.children[prevSection.children.length - 1]
        //这里对比节点大小是取H1,H2,H3,H4..后面的数字进行对比，数字越小的越大
        //如果上一个节点存在子节点 且 如果比上一个节点的最后一个子节点小，那么把上一个节点的最后一个子节点入栈，把当前节点放入这个节点的子节点
        if(prevSection.children.length && header.nodeName[1] > prevChildSection.nodeName[1]){
          sectionStack.push(prevChildSection)
          section.parent = prevChildSection
          prevChildSection.children.push(section)
        }
        //否则如果上一个子节点大于当前节点，那么当前节点加入上一个节点的子节点
        else if(prevSection.nodeName[1] < header.nodeName[1]){
          section.parent = prevSection
          prevSection.children.push(section)
        }
        //否则如果上一个节点大小等于当前节点，那么当前节点入栈
        else if(prevSection.nodeName === header.nodeName){
          section.parent = prevSection.parent
          if(section.parent) section.parent.children.push(section)
          sectionStack.push(section)
        }
        //否则（即上一个节点小于当前节点）,将所有小于当前的节点出栈（即非兄弟节点），当前节点入栈
        else{
          do{
            sectionStack.pop()
          }while (sectionStack.length && sectionStack[sectionStack.length - 1].parent != null && sectionStack[sectionStack.length - 1].nodeName[1] > header.nodeName[1])
          if(sectionStack.length){
            const parentSection = sectionStack[sectionStack.length - 1].parent
            if(parentSection) {
              section.parent = parentSection
              parentSection.children.push(section)
            }
          }
          sectionStack.push(section)
        }
      }else{
        sectionStack.push(section)
      }
    }
    // 遍历结束
    this.sections = sectionStack.filter(i=>!i.parent)
    // 计算文章位置
    targetElementOffset = ElementUtils.getElementPosition(targetElement as HTMLElement)
    return true;
  }
}

interface SectionStoreHTMLElement extends HTMLElement{
  $section: Section
}
//如何存储section到header节点中
function saveSectionToHeader(header: HTMLElement, section: Section): void{
  if((header as SectionStoreHTMLElement).$section){
    (header as SectionStoreHTMLElement).$section = section
  }else{
    Object.defineProperty(header, "$section", {value: section, writable: true})
  }
}
//如何获取section
function getSectionFromHeader(header: HTMLElement): Section{
  return (header as SectionStoreHTMLElement).$section
}
</script>

<style scoped lang="scss">
.catalog-container{
  border-radius: 3px;
  background-color: white;
}
.catalog-header{
  padding: 5px 1em 1em;
}
.catalog-section-selected{
  color: #0099ff
}
.catalog-progress{
  background-color: #e4e6e8;
}
.catalog-progress-bar{
  display: block;
  background-color: #0099ff;
  border-radius: 2px;
  height: 2px;
}
.catalog-section-container{
  overflow-y: auto;
  max-height: calc(100vh - 2.5em - 100px);
}
</style>
