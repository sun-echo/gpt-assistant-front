import { defineStore } from 'pinia'

export const useStore = defineStore('counter', {
  state: () => ({
    promptText: '',
  }),
  getters: {
    promptText: (state) => state.promptText,
  },
  actions: {
    setPromptText(text: string) {
      console.log('Text', text)
      this.promptText = text
    },
  },
})