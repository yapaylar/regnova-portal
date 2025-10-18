"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const labels = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];

const data = {
  labels,
  datasets: [
    {
      label: "Complaints",
      data: [12, 18, 14, 22, 17, 13],
      borderColor: "#2563eb",
      backgroundColor: "rgba(37, 99, 235, 0.15)",
      tension: 0.4,
      fill: true,
    },
    {
      label: "Resolved",
      data: [8, 12, 15, 20, 18, 15],
      borderColor: "#22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.12)",
      tension: 0.4,
      fill: true,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: "index" as const,
  },
  plugins: {
    legend: {
      display: true,
    },
  },
  scales: {
    y: {
      grid: {
        color: "rgba(148, 163, 184, 0.1)",
      },
      ticks: {
        stepSize: 5,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

export default function AreaAnalytics() {
  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
}

