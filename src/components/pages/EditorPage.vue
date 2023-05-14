<template>
  <PageWrapper>
    <Header empty back/>
    <el-row class="editor__row" :gutter="20">
      
        <div class="editor__left">
        <div
          class="prompt-input-wrapper"
          v-for="(promptInput, key) in inputData"
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
            trigger="click"
            placement="bottom-start"
            class="input-tooltip"
            @command="val => handleClickAction(key, val)"
            @visible-change="val => handleChangeVisibleTooltip(key, val)"
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
  computed,
  nextTick
} from 'vue'
import isEmpty from 'lodash/isEmpty'
import { useStore } from '../../store/index.ts'
import Header from '../Header.vue'
import PageWrapper from '../PageWrapper.vue';
import axios from 'axios';

// @ts-ignore
import type { DropdownInstance } from 'element-plus'

const store = useStore()

const inputData = ref([store.$state.promptText])
const promptValue = computed(() => inputData.value?.join('\n'))

const loadingInputIndex = ref()
const activeInputIndex = ref<number|null>(0)

const promptInputRefs = ref<any>([])
const promptTooltipRefs = ref<DropdownInstance[]>([]);

const activeStyle = ref(0)
const stylizeResult = ref<string|null>(null)
const loadingStylize = ref(false)

const fileInputElement = ref<HTMLInputElement|null>(null);
const fileInputValue = ref<HTMLInputElement|null>(null);
// const promptInput = ref<HTMLInputElement|null>(null);

// const fileName = computed(() => fileInputValue.value?.name);
// const fileExtension = computed(() => fileName.value?.substr(fileName.value?.lastIndexOf(".") + 1));
// const fileMimeType = computed(() => fileInputValue.value?.type);
// const fileSelected = computed(() => !!fileName.value)

const handleBlurInput = (key: number) => {
  const value = inputData.value[key]

  if (activeInputIndex.value !== key) {
    hideTooltip(key)
  }

  const emptyInputs = inputData.value?.filter(item => item === '')

  if (
    !isEmpty(emptyInputs) &&
    isEmpty(value) &&
    inputData.value?.length > 1 &&
    key !== inputData.value?.length - 1
  ) {
    hideTooltip(key)
    inputData.value?.splice(key, 1)
    inputData.value?.push('')
  }

  activeInputIndex.value = null
}

const handleFocusInput = (key: number) => {
  if (
    isEmpty(inputData.value[key]) &&
    activeInputIndex.value !== key
  ) {
    showTooltip(key)
  }

  activeInputIndex.value = key
}

const handleInputPrompt = (key: number, value: any) => {
  const containsLinebreak = value.includes('\n')
  const linebreakPosition = value?.indexOf('\n')
  const needToSplit = linebreakPosition !== value?.length - 1

  if (containsLinebreak) {
    if (!inputData.value?.includes('')) {
      inputData.value.push('')
      nextTick(() => promptInputRefs.value[key + 1]?.focus())
    } else if (needToSplit) {
      const splittedValue = value?.split('\n')?.filter((item: string) => !isEmpty(item))
      inputData.value.pop()
      inputData.value.splice(key, 1, ...splittedValue);

      if (activeInputIndex.value !== null) {
        hideTooltip(activeInputIndex.value)
        handleFocusInput(inputData.value?.length - 1)
      }   
    } else {
      // Handling onEnter in not empty input, when next field is not empty
      if (!!inputData.value[key + 1] && !isEmpty(inputData.value[key])) {
        inputData.value.pop()
        inputData.value.splice(key + 1, 0, '');
      }
      nextTick(() => promptInputRefs.value[key+1]?.focus())
    }
  } else {
    inputData.value[key] = value
    hideTooltip(key)
  }

  if (containsLinebreak && !inputData.value?.includes('')) {
    inputData.value.push('')
    nextTick(() => promptInputRefs.value[key + 1]?.focus())
  } else {
    if (containsLinebreak) {
      if (
        !!inputData.value[key + 1] &&
        !isEmpty(inputData.value[key])
      ) {
        inputData.value.pop()
        inputData.value.splice(key + 1, 0, '');
        nextTick(() => promptInputRefs.value[key+1]?.focus())
      } else {
        nextTick(() => promptInputRefs.value[key+1]?.focus())
      }
    } else {
      inputData.value[key] = value
      hideTooltip(key)
    }
  }

  const moreThanOneInputEmpty = inputData.value?.filter(item => isEmpty(item))?.length > 1
  const noEmptyInputs = isEmpty(inputData.value?.filter(item => isEmpty(item)))

  if (moreThanOneInputEmpty) {
    const filteredValue = inputData.value?.filter(item => !isEmpty(item))
    inputData.value = [...filteredValue, '']
  }

  if (noEmptyInputs) {
    inputData.value.push('')
  }
}

function showTooltip(key: number) {
  if (!promptTooltipRefs.value[key]) {
    return
  }
  promptTooltipRefs.value[key]?.handleOpen()
}

const handleChangeVisibleTooltip = (_key: number, value: boolean) => {
  if (value) {
    return
  }

  const emptyIndex = inputData.value?.indexOf('')
  if (emptyIndex > 0 && emptyIndex !== inputData.value?.length - 1) {
    inputData.value?.splice(emptyIndex, 1)
    inputData.value?.push('')
  }
}

function hideTooltip(key: number) {
  if (!promptTooltipRefs.value[key]) {
    return
  }
  promptTooltipRefs.value[key]?.handleClose()
}

onMounted(() => {
  showTooltip(0)
})

const submitButtonDisabled = computed(() => !promptValue.value || loadingStylize.value)

const uploadFile = (event: any) => {
  fileInputValue.value = event?.target?.files[0];
};

const handleClickAction = async (key: number, comand: string) => {
  if (!promptValue.value) {
    return
  }

  loadingInputIndex.value = key

  if (comand === 'continue') {
    await continueWriting(key)
  }

  loadingInputIndex.value = null
}

const continueWriting = async (key: number) => {
  if (!promptValue.value) {
    return
  }

  const res = await axios.post('http://localhost:3000/prompt-text', {
    text: `Continue the text: ${promptValue.value}`
  })

  inputData.value[key] = res?.data?.content

  inputData.value.push('')
  nextTick(() => promptInputRefs.value[promptInputRefs.value - 1]?.focus())
}

const handleClickGenerate = async () => {
  // if (submitButtonDisabled.value) {
  //   return
  // }
  // loadingStylize.value = true

  // if (activeStyle.value === 0) {
  //   const res = await axios.post('http://localhost:3000/prompt-text', {
  //     // text: `Fix mistakes in text: ${promptValue.value}. ${additionalValue.value ? '. ' + additionalValue.value : '' }`
  //     text: `Не меняя текст, исправь орфографические и пунктуационные ошибки: ${promptValue.value}. ${additionalValue.value ? '. ' + additionalValue.value : '' }`
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
