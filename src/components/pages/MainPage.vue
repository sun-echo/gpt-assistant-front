<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '../../store/index.ts'
import Header from '../Header.vue';
import PageWrapper from '../PageWrapper.vue';
// import axios from 'axios';

const router = useRouter()
const store = useStore()

const promptText = ref('')
const features = [
  {
    imageSrc: 'promo-sort.png',
    text: 'Сортирует материал в удобный читаемый вид'
  },
  {
    imageSrc: 'promo-lang.png',
    text: 'С любого языка мира'
  },
  {
    imageSrc: 'promo-sort.png',
    text: 'Сортирует материал в удобный читаемый вид'
  },
  {
    imageSrc: 'promo-lang.png',
    text: 'С любого языка мира'
  },
  {
    imageSrc: 'promo-sort.png',
    text: 'Сортирует материал в удобный читаемый вид'
  },
]

// onMounted(() {
//   const res = axios.post('http://localhost:3000/prompt-text', {
//     text: 
//   })
// })

// const handleSubmit = async () => {
//   console.log('Text', promptText.value)
//   const res = await axios.post('http://localhost:3000/prompt-text', {
//     text: promptText.value
//   })
//   console.log(res?.data?.content)
// }

const handleSubmit = () => {
  store.$state.promptText = promptText.value

  router.push({ name: 'EditorPage' })

  console.log('Push')
}
</script>

<template>
  <PageWrapper>
    <Header />
    <el-main>
      <div class="content-wrapper">
        <h1>
          Unlimited clear information<br/>from any source
        </h1>

        <div class="features">
          <div class="feature-wrapper" v-for="feature in features">
            <img :src="feature.imageSrc" />
            <span>{{  feature.text }}</span>
          </div>
        </div>

        <el-input
          v-model="promptText"
          class="prompt-input"
          placeholder="Insert text to convert"
          type="textarea"
          autofocus
          :autosize="{ minRows: 3, maxRows: 4 }"
        />
        
        <div class="prompt-wrapper">
          <el-button
            class="submit-prompt"
            @click="handleSubmit"
            type="primary"
            round
          >
            Convert
          </el-button>
        </div>
      </div>
    </el-main>
  </PageWrapper>
</template>

<style scoped lang="scss">
.content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.prompt-wrapper {
  max-width: 912px;
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.prompt-input {
  max-width: 912px;
  margin-bottom: 16px;
}
.submit-prompt {
  position: absolute;
  right: 0px;
  top: 0px;
}
.features {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 120px;
  user-select: none;
}
.feature-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 26px;

  > span {
    margin-top: 30px;
    font-family: RF-Headline;
    font-size: 14px;
    font-weight: 800;
    max-width: 242px;
  }
}


h1 {
  font-family: RF-Headline;
  font-size: 48px;
  font-weight: 800;
}
</style>
