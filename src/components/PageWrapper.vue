<template>
  <el-container class="container">
    <slot />
  </el-container>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
}
</style>
