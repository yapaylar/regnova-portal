"use client";

import { Doughnut } from "react-chartjs-2";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ["Device Performance", "Software", "User Handling", "Consumables"],
  datasets: [
    {
      data: [42, 28, 18, 12],
      backgroundColor: [
        "rgba(37, 99, 235, 0.85)",
        "rgba(59, 130, 246, 0.75)",
        "rgba(96, 165, 250, 0.7)",
        "rgba(191, 219, 254, 0.8)",
      ],
      borderWidth: 1,
      borderColor: "#ffffff",
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
  },
  cutout: "60%",
};

export default function DonutAnalytics() {
  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
}

