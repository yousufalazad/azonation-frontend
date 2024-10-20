<template>
    <div>
      <h2>Expense Report (Past 12 Months)</h2>
      <div style="width: 600px; height: 400px;">
        <line-chart v-if="chartData" :chart-data="chartData" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { Line } from 'vue-chartjs';
  import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
  import Swal from 'sweetalert2';
  import { authStore } from '../../../store/authStore';
  import moment from 'moment'; // Make sure you have moment.js installed
  
  // Register Chart.js components
  ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);
  
  const auth = authStore;
  const chartData = ref(null);
  
  // Fetch report data for the past 12 months
  const fetchReportData = async () => {
    try {
      // Clear existing chart data
      chartData.value = null;
  
      const response = await auth.fetchProtectedApi('/api/org-expense-reports', {}, 'GET'); // Adjust the API endpoint if necessary
      console.log(response);
      if (response.status) {
        // Prepare array for all months in the last 12 months
        const allMonths = Array.from({ length: 12 }, (_, i) => {
          const month = moment().subtract(i, 'months').format('YYYY-MM');
          return { month, total_expense: 0 };
        });
  
        // Populate with actual expense data
        response.data.forEach(item => {
          const index = allMonths.findIndex(m => m.month === `${item.year}-${String(item.month).padStart(2, '0')}`);
          if (index !== -1) {
            allMonths[index].total_expense = item.total_expense;
          }
        });
  
        // Set the labels and expense data
        const labels = allMonths.map(item => item.month);
        const expenses = allMonths.map(item => item.total_expense);
  
        // Set chart data
        chartData.value = {
          labels,
          datasets: [
            {
              label: 'Expense',
              backgroundColor: '#FF5722', // Color for the expense line
              borderColor: '#FF5722', // Color for the expense line
              data: expenses,
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
    props: {
      chartData: {
        type: Object,
        required: true
      }
    },
    components: {
      Line
    },
    setup(props) {
      const chartOptions = {
        responsive: true,
        maintainAspectRatio: true, // Maintain aspect ratio
        scales: {
          y: {
            beginAtZero: true, // Ensure the y-axis starts at 0
            ticks: {
              stepSize: 1000, // Adjust based on your expense range
              max: Math.max(...props.chartData.datasets[0].data) + 1000 // Adjusting max to make space
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
  
      return { chartOptions };
    },
    template: `
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    `
  };
  </script>
  
  <style scoped>
  /* You can adjust the styling if needed */
  </style>
  