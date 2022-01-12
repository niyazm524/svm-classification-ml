<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue";
import SvmPage from "./pages/svm/Svm.vue";

const page = ref("svm");
</script>

<template>
  <svm-page v-if="page === 'svm'" />
</template>

<style lang="css">
html,
body {
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  color: #2c3e50;
}
</style>
