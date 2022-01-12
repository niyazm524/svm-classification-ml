<script setup>
import { onMounted, ref, reactive, onBeforeMount } from "vue";
import SVM from "libsvm-js/asm";

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

const konva = {
  width: 600,
  height: 600,
};
const colors = ["red", "blue", "green", "gray"];
const cfg = {
  dot: {
    radius: 5,
    fill: "red",
    stroke: "black",
    strokeWidth: 1,
  },
};
const state = reactive({
  curColor: colors[0],
  dots: [],
  svm: null,
  bg: null,
  predict: false,
});

const addDot = ({ layerX, layerY }) => {
  if (!state.predict) layerX && layerY && state.dots.push({ x: layerX, y: layerY, fill: state.curColor });
  else {
    const point = { x: layerX, y: layerY };
    const pred = state.svm.predictOne([point.x / konva.width, point.y / konva.height]);
    point.fill = colors[pred];
    state.dots.push(point);
  }
};

const logs = ref([]);
const consoleLog = (str) => {
  logs.value.push(str);
  console.log(str);
};

const onTrain = () => {
  const labelTypes = [...new Set(state.dots.map(({ fill }) => colors.indexOf(fill))).values()];
  console.log(labelTypes);
  state.svm = new SVM({
    kernel: SVM.KERNEL_TYPES.RBF,
    type: SVM.SVM_TYPES.C_SVC,
    gamma: 1 / labelTypes.length,
    cost: 10,
    quiet: false,
  });

  const dataset = state.dots.map(({ x, y, fill: color }) => ({
    data: [x / konva.width, y / konva.height],
    label: colors.indexOf(color),
  }));
  shuffle(dataset);
  const trainDataset = [],
    trainLabels = [];
  const testDataset = [],
    testLabels = [];
  for (const { data, label } of dataset) {
    if (Math.random() <= 0.1) {
      testDataset.push(data);
      testLabels.push(label);
    } else {
      trainDataset.push(data);
      trainLabels.push(label);
    }
  }
  console.log("Train", trainDataset, trainLabels);
  console.log("Test", testDataset, testLabels);

  state.svm.train(trainDataset, trainLabels);

  const testPrediction = state.svm.predict(testDataset);
  console.log("test prediction", testPrediction);

  console.table(
    "test results",
    testLabels.map((lbl, key) => ({ val: lbl, prd: testPrediction[key] }))
  );
  let SuccessValuesCount = 0;
  for (const [idx, pred] of testPrediction.entries()) {
    const trueLabel = testLabels[idx];
    if (trueLabel === pred) SuccessValuesCount++;
  }
  const accuracy = SuccessValuesCount / testLabels.length;
  console.info(`Accuracy for test dataset is ${accuracy}`);
};

const saveState = () => {
  localStorage.setItem("dots", JSON.stringify(state.dots));
};
const popState = () => {
  const savedState = localStorage.getItem("dots");
  if (savedState) state.dots = JSON.parse(savedState);
};
onMounted(popState);
</script>

<template>
  <div class="root-page">
    <v-stage :config="konva" title style="margin-bottom: 16px" @click="addDot">
      <v-layer>
        <v-circle v-for="(bgDot, key) in state.bg" :key="key" :config="bgDot" />
      </v-layer>
      <v-layer>
        <v-circle v-for="(dot, key) in state.dots" :key="key" :config="{ ...cfg.dot, ...dot }"></v-circle>
      </v-layer>
    </v-stage>
    <div>
      <button
        v-for="(color, idx) in colors"
        :key="idx"
        class="color-btn"
        :style="{ 'background-color': color }"
        @click="state.curColor = color"
      >
        {{ color }}
      </button>
    </div>
    <div style="margin-top: 8px">
      <button @click="onTrain">train</button>
      <button @click="saveState">save state</button>
      <button @click="popState">load state</button>
      <button @click="state.dots = []">clear</button>
      <button @click="state.predict = !state.predict" :class="{ toggled: state.predict }">predict</button>
    </div>
    <ol style="padding-right: 24px; overflow-x: auto">
      <li v-for="(log, key) in logs" :key="key">{{ log }}</li>
    </ol>
  </div>
</template>

<style>
.root-page {
  margin: 16px;
}
.root-page canvas {
  border: 1px solid rgba(161, 161, 161, 0.171) !important;
}
button {
  padding: 8px 10px;
  border: none;
  background-color: #0645a3;
  border-radius: 4px;
  color: white;
  margin-right: 8px;
  cursor: pointer;
}
button.toggled {
  background-color: #07357a;
  font-weight: 600;
}
button.color-btn {
  margin-right: 0;
  border-radius: 0;
  color: white;
}
</style>
