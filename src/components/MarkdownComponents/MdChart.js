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
} from "chart.js";
import { Chart } from "react-chartjs-2";
import { validate_chart_data } from "../../utils/helpers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const MdChart = ({ children }) => {
  const chartData = validate_chart_data(children);
  if (chartData)
    return (
      <Chart
        type={chartData.meta_data.type}
        data={chartData.data}
        options={{
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: chartData.meta_data.title,
            },
          },
        }}
      />
    );
  return <pre>{children}</pre>;
};

export default MdChart;
