<script setup>
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
  chartDataBalance: {
    type: Object,
    required: true
  }
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1000,
        max: Math.max(...props.chartDataBalance.datasets[0].data) + 1000
      }
    },
    x: {
      title: {
        display: true,
        text: 'Months'
      }
    }
  }
};
</script>

<template>
  <Line :data="chartDataBalance" :options="chartOptions" />
</template>
