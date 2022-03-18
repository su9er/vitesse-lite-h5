<script setup lang="ts">
import { useCounterStore } from '~/store/counter'

const counter = useCounterStore()
</script>

<template>
  <div>
    <div text-center>{{ counter.count }}</div>
    <div w-50 ma flex="~" justify="between" align="items-center">
      <van-button btn text-sm px-10 type="primary" @click="counter.increment()">
        <div ic:baseline-plus />
      </van-button>
      <van-button btn text-sm px-10 type="primary" @click="counter.decrement()">
        <div ri:subtract-fill />
      </van-button>
    </div>
  </div>
</template>
