"use client";

import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const labels = ["HemoSense", "PulseGuard", "VentPro", "CardiaLink", "DialySure"];

const data = {
  labels,
  datasets: [
    {
      label: "Complaints per 1k Units",
      data: [2.3, 1.8, 3.1, 1.2, 2.6],
      backgroundColor: [
        "rgba(59, 130, 246, 0.8)",
        "rgba(59, 130, 246, 0.7)",
        "rgba(59, 130, 246, 0.6)",
        "rgba(59, 130, 246, 0.5)",
        "rgba(59, 130, 246, 0.4)",
      ],
      borderRadius: 8,
      maxBarThickness: 38,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(148, 163, 184, 0.1)",
      },
    },
  },
};

export default function BarAnalytics() {
  return (
    <div className="h-80">
      <Bar data={data} options={options} />
    </div>
  );
}

