<script lang="ts" setup>
import { ref, watchEffect } from 'vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  }
})

const modalVisible = ref(props.modelValue)

const username = ref('')
const password = ref('')

watchEffect(() => modalVisible.value = props.modelValue)

const handleClose = () => {
  emit('update:modelValue')
}
</script>


<template>
  <el-dialog
    v-model="modalVisible"
    title="Login"
    width="30%"
    :before-close="handleClose"
  >
    
    <el-input
      v-model="username"
      placeholder="Enter username"
    />

    <el-input
      v-model="password"
      class="password-input"
      type="password"
      show-password
      placeholder="Enter password"
    />

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleClose">
          Confirm
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer button:first-child {
  margin-right: 10px;
}
.password-input {
  margin-top: 20px;
}
</style>
