<template>
  <PageWrapper>
    <Header empty back/>
    <el-row class="editor__row" :gutter="20">
      
        <div class="editor__left">
        <div
          class="prompt-input-wrapper"
          v-for="(promptInput, key) in promptInputData"
        >
          <el-input
            v-if="loadingInputIndex !== key"
            :ref="el => promptInputRefs[key] = el"
            class="prompt-input"
            type="textarea"
            :autosize="{ minRows: 1 }"
            :modelValue="promptInput"
            placeholder="Type or add"
            autofocus
            @input="val => handleInputPrompt(key, val)"
            @focus="handleFocusInput(key)"
            @blur="handleBlurInput(key)"
          />

          <el-skeleton v-else :rows="1" />

          <el-dropdown
            :ref="el => promptTooltipRefs[key] = el"
            trigger="contextmenu"
            placement="bottom-start"
            class="input-tooltip"
            @command="val => handleClickAction(key, val)"
          >
            <div/>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>Generate</el-dropdown-item>
                <el-dropdown-item command="continue">
                  Continue writing
                </el-dropdown-item>
                <el-dropdown-item>
                  Topics that are missing
                </el-dropdown-item>
                <el-dropdown-item>Overall conclusion</el-dropdown-item>
                <el-dropdown-item>Check for authenticity</el-dropdown-item>
                <el-dropdown-item disabled>Import from file</el-dropdown-item>
                <el-dropdown-item>Import text from media</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- <el-tooltip
          v-model:visible="promptTooltipVisible"
          content="Bottom center"
          placement="bottom"
          effect="light"
          trigger="click"
          virtual-triggering
          :virtual-ref="triggerRef"
        /> -->

        <div class="button-container">
          <el-button
            tag="div"
            class="generate-button"
            type="primary"
            :disabled="submitButtonDisabled || loadingInputIndex"
            @click="handleClickGenerate"
          >
            Go
          </el-button>

          <!-- <el-button
            tag="div"
            :class="fileInputClass"
            type="primary"
            @click="handleUploadFile"
          >
            + Добавить текст из медиа
          </el-button> -->
          <input
            type="file"
            ref="fileInputElement"
            class="file-input"
            @change="uploadFile"
          />
        </div>
      </div>
      <div class="editor__right">
        <el-text
          class="input-title mx-1"
        >
          Select style
        </el-text>

        <div class="button-container">
          <el-button
            tag="div"
            :class="{
              'stylize-option-button': true,
              'stylize-option-button--active': activeStyle === 0
            }"
            role="button"
            type="primary"
            @click="selectStyle(0)"
          >
            Groom
          </el-button>

          <el-button
            tag="div"
            :class="{
              'stylize-option-button': true,
              'stylize-option-button--active': activeStyle === 1
            }"
            role="button"
            type="primary"
            @click="selectStyle(1)"
          >
            Shorter
          </el-button>

          <el-button
            tag="div"
            :class="{
              'stylize-option-button': true,
              'stylize-option-button--active': activeStyle === 2
            }"
            role="button"
            type="primary"
            @click="selectStyle(2)"
          >
            Longer
          </el-button>

          <el-button
            tag="div"
            :class="{
              'stylize-option-button': true,
              'stylize-option-button--active': activeStyle === 3
            }"
            role="button"
            type="primary"
            @click="selectStyle(3)"
          >
            Summarization
          </el-button>

          <el-button
            tag="div"
            :class="{
              'stylize-option-button': true,
              'stylize-option-button--active': activeStyle === 4
            }"
            role="button"
            type="primary"
            @click="selectStyle(4)"
          >
            Research
          </el-button>

          <el-button
            tag="div"
            :class="{
              'stylize-option-button': true,
              'stylize-option-button--active': activeStyle === 5
            }"
            role="button"
            type="primary"
            @click="selectStyle(5)"
          >
            Article
          </el-button>
        </div>

        <el-text
          class="input-title mx-1"
        >
          Text will be shown here
        </el-text>

        <el-skeleton
          v-if="loadingStylize"
          :rows="5"
        />

        <el-text
          v-if="!loadingStylize && stylizeResult"
          class="stylize-result mx-1"
        >
          {{ stylizeResult }}
        </el-text>
      </div>
    </el-row>
  </PageWrapper>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  watchEffect,
  computed,
  nextTick
} from 'vue'
import { useStore } from '../../store/index.ts'
import Header from '../Header.vue'
import PageWrapper from '../PageWrapper.vue';
import axios from 'axios';

// @ts-ignore
import type { DropdownInstance } from 'element-plus'

const store = useStore()

const promptInputData = ref([store.$state.promptText])
const promptInputRefs = ref<any>([])
const inputValue = computed(() => promptInputData.value?.join('\n'))
const loadingInputIndex = ref()

const activeStyle = ref(0)
const stylizeResult = ref<string|null>(null)

const loadingStylize = ref(false)

const fileInputElement = ref<HTMLInputElement|null>(null);
const fileInputValue = ref<HTMLInputElement|null>(null);
// const promptInput = ref<HTMLInputElement|null>(null);
const promptTooltipRefs = ref<DropdownInstance[]>([]);

// const fileName = computed(() => fileInputValue.value?.name);
// const fileExtension = computed(() => fileName.value?.substr(fileName.value?.lastIndexOf(".") + 1));
// const fileMimeType = computed(() => fileInputValue.value?.type);
// const fileSelected = computed(() => !!fileName.value)


watchEffect(() => {
  if (promptInputData.value[0]?.length > 0) {
    promptTooltipRefs.value[0]?.handleClose()
  }
  
  promptInputData.value?.forEach((item, index) => {
    if (item.includes('\n')) {
      console.log("Found Enter on", index)
    }
  })
})

// TODO: Починить блюр. При наведении на дропдаун срабатывает

const handleBlurInput = (key: number) => {
//   console.log('Debug')
//   const val = promptInputData.value[key]
//   promptTooltipRefs.value[key]?.handleClose()
//   console.log('Blur', key, val)
//   if (
//     promptInputData.value?.filter(item => item === '').length > 0 &&
//     val === '' &&
//     promptInputData.value?.length > 1
//   ) {
//     if (key === promptInputData.value?.length - 1) {
//       // promptInputData.value = promptInputData.value?.filter(item => item !== '')
//     } else {
//       console.log('Gotcha')
//       promptInputData.value?.splice(key, 1)
//       promptInputData.value?.push('')
//     }
//   }
}

const handleFocusInput = (key: number) => {
  if (promptInputData.value[key] === '') {
    showTooltip(key)
  }
}

const handleInputPrompt = (key: number, value: any) => {
  const isEnter = value === '\n'
  const containsEnter = value.includes('\n')

  if (containsEnter && !promptInputData.value?.includes('')) {
    promptInputData.value.push('')
    nextTick(() => promptInputRefs.value[key+1]?.focus())
  } else {
    if (containsEnter) {
      // On enter in not empty input, when next field is not empty
      if (!!promptInputData.value[key+1] && promptInputData.value[key] !== '') {
        promptInputData.value.pop()
        promptInputData.value.splice(key+1, 0, '');
        nextTick(() => promptInputRefs.value[key+1]?.focus())
      } else {
      // On enter emty field
        nextTick(() => promptInputRefs.value[key+1]?.focus())
      }
    } else {
      promptInputData.value[key] = value
      promptTooltipRefs.value[key]?.handleClose()
    }
  }

  if (promptInputData.value?.filter(item => item === '')?.length > 1) {
    promptInputData.value = promptInputData.value?.filter(item => item !== '')
  }

  if (promptInputData.value?.filter(item => item === '')?.length === 0) {
    promptInputData.value.push('')
  }
}

function showTooltip(key: number) {
  if (!promptTooltipRefs.value[key]) return
  promptTooltipRefs.value[key]?.handleOpen()
}

onMounted(() => {
  showTooltip(0)
})

const submitButtonDisabled = computed(() => !inputValue.value || loadingStylize.value)

const uploadFile = (event: any) => {
  console.log('Debug', event?.target?.files[0])
  fileInputValue.value = event?.target?.files[0];
};

const handleClickAction = async (key: number, comand: string) => {
  console.log('Click', comand)
  if (!inputValue.value) {
    return
  }

  loadingInputIndex.value = key

  if (comand === 'continue') {
    await continueWriting(key)
  }

  loadingInputIndex.value = null
}

const continueWriting = async (key: number) => {
  if (!inputValue.value) {
    return
  }

  const res = await axios.post('http://localhost:3000/prompt-text', {
    text: `Continue the text: ${inputValue.value}`
  })

  promptInputData.value[key] = res?.data?.content

  console.log('Debug handle', promptInputRefs.value[key], key)

  promptInputData.value.push('')
  nextTick(() => promptInputRefs.value[promptInputRefs.value - 1]?.focus())
}

const handleClickGenerate = async () => {
  // if (submitButtonDisabled.value) {
  //   return
  // }
  // loadingStylize.value = true

  // if (activeStyle.value === 0) {
  //   const res = await axios.post('http://localhost:3000/prompt-text', {
  //     // text: `Fix mistakes in text: ${inputValue.value}. ${additionalValue.value ? '. ' + additionalValue.value : '' }`
  //     text: `Не меняя текст, исправь орфографические и пунктуационные ошибки: ${inputValue.value}. ${additionalValue.value ? '. ' + additionalValue.value : '' }`
  //   })

  //   stylizeResult.value = res?.data?.content
  // }

  // loadingStylize.value = false
}

const selectStyle = (index: number) => {
  activeStyle.value = index
}

// const handleUploadFile = async () => {
//   if (!fileName.value) {
//     fileInputElement.value?.click()
//     return
//   }

//   fileInputValue.value = null
  
  // const reader = new FileReader();
  // reader.readAsDataURL(file.value);
  // reader.onload = async () => {
  //   const encodedFile = reader.result.split(",")[1];
  //   const data = {
  //     file: encodedFile,
  //     fileName: fileName.value,
  //     fileExtension: fileExtension.value,
  //     fileMimeType: fileMimeType.value,
  //   };
  //   try {
  //     const endpoint = "https://example.com/upload";
  //     const response = await axios.post(endpoint, data);
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
// };
</script>

<style scoped lang="scss">
h1 {
  font-family: RF-Headline;
  font-size: 48px;
  font-weight: 800;
}

.input-title {
  color: #C5C5C5;
  font-weight: 800;
  font-size: 16px;
  line-height: 134%;
  align-self: start;
  margin-bottom: 12px;
  &--add {
    margin-top: 44px;
    margin-bottom: 34px;
  }
}
.file-input {
  display: none;
}
.prompt-input-wrapper {
  display: flex;
  flex-direction: column;
}
.input-tooltip {
  margin-top: -8px;
  margin-bottom: 8px;
}
.prompt-input {
  font-family: RF-Text;
  font-size: 16px;
  line-height: 150%;
  font-weight: 600;
  caret-color: #295EFF;
  margin-bottom: 12px;
  --el-input-placeholder-color: #B0B0B0;

  &--additional {
    margin-top: 36px;
  }
}
.prompt-input::v-deep textarea {
  padding: 0px;
  color: #404040;
  background-color: transparent;
  border: none;
  outline: none;
  -webkit-box-shadow: none;
  -moz-box-shadow: none;
  box-shadow: none;
  resize: none;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  max-width: 100%;
  margin-bottom: 64px;
}
.stylize-option-button {
  // display: inline-block;
  font-family: RF-Text-Bold;
  padding: 9px 20px;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  background-color: #F0F0F0;
  color: #000000;
  border-radius: 12px 12px 12px 0;
  border-width: 0;
  margin: 6px;

  &--active {
    background-color: #90C5FF;
  }
}

.generate-button {
  position: absolute;
  right: -30px;
  bottom: 56px;
  width: 60px;
  height: 60px; 
  font-family: RF-Text-Bold;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  border-radius: 50%;
  border-width: 0px;
  --el-button-disabled-bg-color: #DCDCDC;
  --el-button-bg-color: #1989FA;
}

.editor {
  &__row {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  &__left, &__right {
    background-color:#F8F8F8;
    height: 100%;
    padding: 48px;
    display: flex;
    flex-direction: column;
  }

  &__left {
    position: relative;
    border-right: 1px solid #CFCFCF;
  }
}
</style>
