import { createApp } from "vue";
import App from "./App.vue";
// @ts-ignore
import VueKonva from "vue3-konva";

createApp(App).use(VueKonva).mount("#app");
