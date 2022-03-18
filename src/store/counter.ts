import { acceptHMRUpdate, defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(1)

  function increment() {
    count.value++
  }

  function decrement() {
    count.value--
  }

  return {
    count,
    increment,
    decrement,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useCounterStore, import.meta.hot))
