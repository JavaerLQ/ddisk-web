<template>
  <div class="breadcrumb-wrapper">
    <div class="title">当前位置：</div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
          :to="{ query: { pid: ROOT_PATH, fileType: fileType().current() } }"
      >{{FILE_TYPE_MAP[fileType().current()]}}</el-breadcrumb-item>

      <el-breadcrumb-item
          v-for="(item, index) in breadCrumbList"
          :key="index"
          :to="{ query: { pid: item.id, fileType: FILE_TYPE.ALL } }"
      >{{item.name}}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>

export default {
  name: 'BreadCrumb',
  computed: {
    //  面包屑导航栏数组
    breadCrumbList() {
      return this.$store.getters.getPathTree(this.filePath().current())
    },
  }
}
</script>

<style lang="stylus" scoped>
.breadcrumb-wrapper
  padding 0
  height 30px
  line-height 30px
  display flex

  .title, >>> .el-breadcrumb
    height 30px
    line-height 30px
</style>
