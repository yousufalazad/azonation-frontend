<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">Expense Report (Past 12 Months)</h2>

    <div class="border p-4 rounded" style="width: 600px; height: 400px;">
      <LineChart v-if="chartData" :chart-data="chartData" ref="lineChart" />
    </div>

    <!-- Download Buttons -->
    <div class="mt-4 flex gap-4">
      <button @click="downloadImage('png')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Download PNG
      </button>
      <button @click="downloadImage('jpeg')" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
        Download JPEG
      </button>
      <button @click="downloadPDF" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
        Download PDF
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import LineChart from './LineChart.vue';
import { authStore } from '../../../store/authStore';
import moment from 'moment';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

const auth = authStore;
const chartData = ref(null);
const lineChart = ref(null);

// Fetch expense report data
const fetchExpenseReportData = async () => {
  try {
    chartData.value = null;
    const response = await auth.fetchProtectedApi('/api/org-expense-reports', {}, 'GET');
    if (response.status) {
      const allMonths = Array.from({ length: 12 }, (_, i) => {
        const month = moment().subtract(i, 'months').format('YYYY-MM');
        return { month, total_expense: 0 };
      });

      response.data.forEach(item => {
        const index = allMonths.findIndex(m => m.month === `${item.year}-${String(item.month).padStart(2, '0')}`);
        if (index !== -1) {
          allMonths[index].total_expense = item.total_expense;
        }
      });

      const labels = allMonths.map(item => item.month).reverse();
      const expenses = allMonths.map(item => item.total_expense).reverse();

      chartData.value = {
        labels,
        datasets: [
          {
            label: 'Expense',
            backgroundColor: '#FF5722',
            borderColor: '#FF5722',
            data: expenses,
            fill: false
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

onMounted(() => {
  fetchExpenseReportData();
});

// Download as Image
const downloadImage = (type) => {
  const chartInstance = lineChart.value?.chart?.chart;
  if (chartInstance) {
    const link = document.createElement('a');
    link.href = chartInstance.toBase64Image(`image/${type}`);
    link.download = `expense-report.${type}`;
    link.click();
  } else {
    Swal.fire('Error', 'Chart not loaded yet', 'error');
  }
};

// Download as PDF
const downloadPDF = () => {
  const chartInstance = lineChart.value?.chart?.chart;
  if (chartInstance) {
    const canvas = chartInstance.canvas;
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('expense-report.pdf');
  } else {
    Swal.fire('Error', 'Chart not loaded yet', 'error');
  }
};
</script>
