<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginModal from './LoginModal.vue'

const router = useRouter()

defineProps({
  back: {
    type: Boolean,
    default: false,
  }
})

const loginModalOpened = ref(false)

const handleClickLogin = () => loginModalOpened.value = true
const handleClickBack = () => router.back()

</script>

<template>
  <el-header class="header">
    <img v-if="!back" src="Logo.png"/>
    <div v-if="!back" class="login-button" @click="handleClickLogin">
      Login
    </div>
    <el-icon
      v-if="back"
      :size="22"
      class="back-button"
      @click="handleClickBack"
    >
      <Back />
    </el-icon>
  </el-header>

  <LoginModal v-model="loginModalOpened"/>
</template>

<style scoped>
.header {
  display: flex;
  width: 100%;
  height: 60px;
  justify-content: space-between;
  align-items: center;
  padding: 26px 26px;
  border-bottom: 1px solid #CFCFCF;
}
.login-button {
  cursor: pointer;
  font-family: RF-Headline;
  font-size: 20px;
  font-weight: 800;
  margin-right: 40px;
  margin-top: 24px;
}
.back-button {
  cursor: pointer;
}
</style>
