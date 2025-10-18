"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, TimeScale);

const data = {
  datasets: [
    {
      label: "Active Recalls",
      data: [
        { x: new Date("2025-07-01"), y: 2 },
        { x: new Date("2025-08-01"), y: 4 },
        { x: new Date("2025-09-01"), y: 3 },
        { x: new Date("2025-10-01"), y: 1 },
      ],
      borderColor: "#f97316",
      backgroundColor: "rgba(249, 115, 22, 0.2)",
      tension: 0.4,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      type: "time" as const,
      time: {
        unit: "month" as const,
      },
      grid: {
        color: "rgba(148, 163, 184, 0.08)",
      },
    },
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
      },
      grid: {
        color: "rgba(148, 163, 184, 0.08)",
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

export default function TimelineAnalytics() {
  return (
    <div className="h-72">
      <Line data={data} options={options} />
    </div>
  );
}

