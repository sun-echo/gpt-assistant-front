<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useStore } from '../../store/index.ts'
import Header from '../Header.vue'
import PageWrapper from '../PageWrapper.vue';
import axios from 'axios';

const activeStyle = ref(0)

const store = useStore()

const inputValue = ref(store.$state.promptText)

const additionalValue = ref<string|null>(null)

const stylizeResult = ref<string|null>(null)

const loadingAdditionalInputData = ref(false)
const loadingStylize = ref(false)

const fileInputElement = ref<HTMLInputElement|null>(null);
const fileInputValue = ref<HTMLInputElement|null>(null);

// const fileName = computed(() => fileInputValue.value?.name);
// const fileExtension = computed(() => fileName.value?.substr(fileName.value?.lastIndexOf(".") + 1));
// const fileMimeType = computed(() => fileInputValue.value?.type);
// const fileSelected = computed(() => !!fileName.value)
// const fileInputClass = computed(() => ({
//   'input-option-button': true,
//   'input-option-button--active': fileSelected.value
// }))

onMounted(() => {
  inputValue
})

const uploadFile = (event: any) => {
  console.log('Debug', event?.target?.files[0])
  fileInputValue.value = event?.target?.files[0];
};

const clickAddMissing = async () => {
  loadingAdditionalInputData.value = true
  const res = await axios.post('http://localhost:3000/prompt-text', {
    text: `На основе этого текста определи его тему и добавь список того, что можно добавить к этой теме или к введённому тексту,
    не дополняя исходный текст, длина ответа не более 500 символов, не дублируй исходный текст: ${inputValue.value}`
  })

  additionalValue.value = res?.data?.content
  loadingAdditionalInputData.value = false
}

const handleClickGenerate = async () => {
  loadingStylize.value = true

  if (activeStyle.value === 0) {
    const res = await axios.post('http://localhost:3000/prompt-text', {
      // text: `Fix mistakes in text: ${inputValue.value}. ${additionalValue.value ? '. ' + additionalValue.value : '' }`
      text: `Не меняя текст, исправь орфографические и пунктуационные ошибки: ${inputValue.value}. ${additionalValue.value ? '. ' + additionalValue.value : '' }`
    })

    stylizeResult.value = res?.data?.content
  }

  loadingStylize.value = false
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

<template>
  <PageWrapper>
    <Header empty back/>
    <el-row class="editor__row" :gutter="20">
      
      <div class="editor__left">
        <el-text
          class="input-title mx-1"
        >
          Соберите и проверьте данные
        </el-text>

        <el-input
          class="prompt-input"
          v-model="inputValue"
          type="textarea"
          size="large"
          :autosize="{ minRows: 8 }"
          placeholder="Вставьте исходный текст"
          maxlength="2000"
        />

        <el-skeleton
          v-if="loadingAdditionalInputData"
          :rows="5"
        />

        <el-input
          v-if="additionalValue"
          class="prompt-input prompt-input--additional"
          v-model="additionalValue"
          type="textarea"
          size="large"
          :autosize="{ minRows: 8 }"
          placeholder="Вставьте исходный текст"
          maxlength="2000"
        />

        <el-text
          class="input-title input-title--add"
        >
          Добавить
        </el-text>
        <div class="button-container">
          <el-button
            tag="div"
            class="input-option-button"
            role="button"
            :disabled="!inputValue || !!additionalValue ||loadingAdditionalInputData"
            @click="clickAddMissing"
          >
            Добавить недостающее на основе текста
          </el-button>

          <el-button
            tag="div"
            class="input-option-button"
            :disabled="!inputValue ||!!additionalValue || loadingAdditionalInputData"
          >
            Проверка текста на достоверность
          </el-button>

          <el-button
            tag="div"
            class="generate-button"
            type="primary"
            :disabled="!inputValue || loadingStylize"
            @click="handleClickGenerate"
          >
            Преобразовать
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
          Выберите стиль:
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
            Автоулучшение
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
            Краткая суть
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
            Добавить подробностей
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
            Статья
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
            Курсовая
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
            Конспект
          </el-button>

          <el-button
            tag="div"
            :class="{
              'stylize-option-button': true,
              'stylize-option-button--active': activeStyle === 6
            }"
            role="button"
            type="primary"
            @click="selectStyle(6)"
          >
            Стихотворение
          </el-button>
        </div>

        <el-text
          class="input-title mx-1"
        >
          Результат
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
.stylize-result {
  
}
.file-input {
  display: none;
}
.prompt-input {
  margin-bottom: 24px;

  &--additional {
    margin-top: 36px;
  }
}
.input-option-button {
  // display: inline-block;
  font-family: RF-Text-Bold;
  padding: 8px 20px;
  margin: 6px;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  background-color: #E4E4E4;
  border: 1px solid #ACACAC;
  border-radius: 12px;

  &--active {
    background-color: #929292;
  }
}

.button-container {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  max-width: 600px;
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
  border-radius: 12px;
  border-width: 0;
  margin: 6px;

  &--active {
    background-color: #BBDBFF;
  }
}

.generate-button {
  position: absolute;
  right: -430px;
  bottom: -100px;
  // display: inline-block;
  width: 244px;
  height: 60px; 
  font-family: RF-Text-Bold;
  padding: 9px 20px;
  font-weight: 700;
  font-size: 14px;
  line-height: 24px;
  border-radius: 12px;
  margin-top: 44px;
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
    border-right: 1px solid #CFCFCF;
  }
}
</style>
