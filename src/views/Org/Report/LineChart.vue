<template>
  <Line ref="chartRef" :data="chartData" :options="chartOptions" />
</template>

<script setup>
import { ref, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const props = defineProps({
  chartData: {
    type: Object,
    required: true
  }
});

const chartRef = ref(null);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true
    },
    x: {
      title: {
        display: true,
        text: 'Months'
      }
    }
  }
};

// Expose the chart instance to parent
defineExpose({
  chart: chartRef
});
</script>
