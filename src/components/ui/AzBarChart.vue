<script setup>
// Bar chart comparing a few series per label, e.g. income and spending per month.
// Colours come from the design tokens and follow light/dark mode. Chart.js loads only on pages that use it.
//   <AzBarChart :labels="months" :series="[{ label: 'Income', values: [...], tone: 'success' }, ...]" />
import { computed } from "vue";
import { Bar } from "vue-chartjs";
import { Chart as ChartJS, Tooltip, BarElement, CategoryScale, LinearScale } from "chart.js";
import { useTheme } from "@/composables/useTheme";

ChartJS.register(Tooltip, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  labels: { type: Array, required: true },
  series: { type: Array, required: true }, // [{ label, values, tone }]
  ariaLabel: { type: String, default: "" },
  formatValue: { type: Function, default: (v) => Number(v).toLocaleString("en-US") },
  formatTick: {
    type: Function,
    default: (v) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v),
  },
  height: { type: Number, default: 240 },
});

const { isDark } = useTheme();

const tokenColor = (name, alpha = 1) => {
  const rgb = getComputedStyle(document.documentElement).getPropertyValue(`--az-${name}`).trim();
  return rgb ? `rgb(${rgb} / ${alpha})` : undefined;
};

const chartData = computed(() => {
  isDark.value; // re-read token colours when the theme changes
  return {
    labels: props.labels,
    datasets: props.series.map((s) => ({
      label: s.label,
      data: s.values,
      backgroundColor: tokenColor(s.tone || "primary", 0.85),
      hoverBackgroundColor: tokenColor(s.tone || "primary"),
      borderRadius: 4,
      maxBarThickness: 28,
    })),
  };
});

const options = computed(() => {
  isDark.value;
  const muted = tokenColor("muted");
  const grid = tokenColor("line", 0.8);
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${props.formatValue(ctx.parsed.y)}` } },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false }, ticks: { color: muted, maxRotation: 0, autoSkipPadding: 12 } },
      y: {
        beginAtZero: true,
        grid: { color: grid },
        border: { display: false },
        ticks: { color: muted, maxTicksLimit: 5, callback: (v) => props.formatTick(v) },
      },
    },
  };
});

const legendDot = { success: "bg-success", danger: "bg-danger", warning: "bg-warning", primary: "bg-primary" };
</script>

<template>
  <div class="flex flex-col gap-3">
    <ul class="flex flex-wrap gap-4 text-sm text-ink-2" aria-hidden="true">
      <li v-for="s in series" :key="s.label" class="inline-flex items-center gap-2">
        <span class="h-2.5 w-2.5 rounded-full" :class="legendDot[s.tone || 'primary']" />{{ s.label }}
      </li>
    </ul>
    <div :style="{ height: `${height}px` }">
      <Bar :data="chartData" :options="options" :aria-label="ariaLabel" role="img" />
    </div>
  </div>
</template>
