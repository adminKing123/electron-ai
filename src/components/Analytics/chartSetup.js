/**
 * One-time Chart.js component registration.
 *
 * Import this file as a side-effect in any react-chartjs-2 chart component
 * to ensure all required Chart.js primitives are registered before use.
 * ChartJS.register() is idempotent — safe to call from multiple modules.
 */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
