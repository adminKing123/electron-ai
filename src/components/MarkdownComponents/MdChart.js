import { Chart } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { validate_chart_data } from "../../utils/helpers";

ChartJS.register(...registerables);

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
