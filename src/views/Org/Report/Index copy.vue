<template>
  <div>
    <h2>Income Report (Past 12 Months)</h2>
    <line-chart v-if="chartData" :chart-data="chartData" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
import Swal from 'sweetalert2';
import { authStore } from '../../../store/authStore';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const auth = authStore;
const userId = auth.user.id;
const chartData = ref(null);

// Fetch report data for the past 12 months
const fetchReportData = async () => {
  try {
    const response = await auth.fetchProtectedApi('/api/reports', {}, 'GET'); // Adjust the API endpoint if necessary

    if (response.status) {
      // Format data for Chart.js
      const labels = response.data.map(item => `${item.year}-${item.month}`);
      const income = response.data.map(item => item.total_income);

      // Set chart data
      chartData.value = {
        labels,
        datasets: [
          {
            label: 'Income',
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
            data: income,
            fill: false,
          }
        ]
      };
    } else {
      Swal.fire('Error', 'Failed to fetch report data', 'error');
    }
  } catch (error) {
    console.error('Error fetching report data:', error);
    Swal.fire('Error', 'Error fetching report data', 'error');
  }
};

// Fetch data on mount
onMounted(() => {
  fetchReportData();
});

// Line chart component
const LineChart = {
  extends: Line,
  props: ['chartData'],
  mounted() {
    this.renderChart(this.chartData, {
      responsive: true,
      maintainAspectRatio: false,
    });
  }
};
</script>

<style scoped>
/* You can adjust the styling if needed */
</style>
