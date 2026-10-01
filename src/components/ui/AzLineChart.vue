<script setup>
// Line chart for monthly trends. Colours come from the design tokens and
// follow light/dark mode. Chart.js is only downloaded by pages that use this.
//   <AzLineChart :labels="months" :values="[1200, 900, ...]" tone="success" label="Income" />
import { computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Tooltip,
  Filler,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { useTheme } from "@/composables/useTheme";

ChartJS.register(Tooltip, Filler, LineElement, PointElement, CategoryScale, LinearScale);

const props = defineProps({
  labels: { type: Array, required: true },
  values: { type: Array, required: true },
  label: { type: String, default: "" },
  tone: { type: String, default: "primary" }, // primary | success | danger | warning
  formatValue: { type: Function, default: (v) => Number(v).toLocaleString("en-US") }, // tooltips
  // axis labels: 1.5K, 2M (defineProps cannot use local variables, so the formatter is built here)
  formatTick: {
    type: Function,
    default: (v) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(v),
  },
  height: { type: Number, default: 180 },
});

const { isDark } = useTheme();

// Reads a token such as --az-success ("18 128 92") as an rgb() colour
const tokenColor = (name, alpha = 1) => {
  const rgb = getComputedStyle(document.documentElement).getPropertyValue(`--az-${name}`).trim();
  return rgb ? `rgb(${rgb} / ${alpha})` : undefined;
};

const chartData = computed(() => {
  isDark.value; // re-read token colours when the theme changes
  const color = tokenColor(props.tone);
  return {
    labels: props.labels,
    datasets: [
      {
        label: props.label,
        data: props.values,
        borderColor: color,
        backgroundColor: tokenColor(props.tone, 0.12),
        pointBackgroundColor: color,
        pointRadius: 2.5,
        pointHoverRadius: 5,
        borderWidth: 2,
        tension: 0.3,
        cubicInterpolationMode: "monotone", // smooth without overshooting peaks or dipping below zero
        fill: true,
      },
    ],
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
      tooltip: {
        callbacks: { label: (ctx) => `${props.label ? props.label + ": " : ""}${props.formatValue(ctx.parsed.y)}` },
      },
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
</script>

<template>
  <div :style="{ height: `${height}px` }">
    <Line :data="chartData" :options="options" :aria-label="label" role="img" />
  </div>
</template>
