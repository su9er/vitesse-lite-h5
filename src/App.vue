<script setup lang="ts">
onMounted(() => {
  let isFirst = $ref(true)
  if (isFirst) {
    const elementMain: any = document.getElementById('__mainLoading')
    if (elementMain)
      elementMain.outerHTML = ''

    isFirst = false
  }
})
</script>

<template>
  <main font-sans p="x-4 y-10" text="center gray-700 dark:gray-200">
    <router-view />
    <Footer />
  </main>
</template>
