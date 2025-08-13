import { Chart } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import { validate_chart_data } from "../../utils/helpers";
import { useState } from "react";
import { useProcessController } from "../../store/useMessagesStore";
import ChartLoader from "./ChartLoader";
import ChartError from "./ChartError";

ChartJS.register(...registerables);

const STATES = {
  LOADING: "LOADING",
  DATA: "DATA",
  CHART: "CHART",
};

const ChartContainer = ({
  chartData,
  isValid,
  initialState = STATES.CHART,
}) => {
  const [state, setState] = useState(initialState);

  const getButtonClasses = (btnState) =>
    `px-3 py-1 rounded-full border text-[10px] font-medium
   ${
     state === btnState
       ? "border-[#595959] dark:border-[#aaaaaa]"
       : `bg-white text-gray-700 border-gray-300 hover:bg-gray-100
          dark:bg-[#2F2F2F] dark:text-gray-200 dark:border-[#4E4E4E] dark:hover:bg-[#3A3A3A]`
   }`;

  return (
    <div className="border border-[#E4E4E4] dark:border-[#454545] rounded-2xl overflow-hidden">
      <div className="px-[18px] py-2 bg-[#f1f1f1] dark:bg-[#292929] rounded-t-2xl flex justify-between items-center">
        <div className="font-bold text-black dark:text-white text-sm truncate">
          {isValid ? chartData.meta_data.title : "Chart Data"}
        </div>
        <div className="flex items-center gap-2">
          <button
            className={getButtonClasses(STATES.CHART)}
            onClick={() => setState(STATES.CHART)}
          >
            Graph
          </button>
          <button
            className={getButtonClasses(STATES.DATA)}
            onClick={() => setState(STATES.DATA)}
          >
            Data
          </button>
        </div>
      </div>

      {state === STATES.CHART && isValid ? (
        <div className="p-3">
          <Chart
            type={chartData.meta_data.type}
            data={chartData.data}
            options={{
              responsive: true,
            }}
          />
        </div>
      ) : state === STATES.DATA ? (
        <div className="p-3">
          {isValid ? (
            <pre>{JSON.stringify(chartData.data, null, 2)}</pre>
          ) : (
            <pre>{chartData.data}</pre>
          )}
        </div>
      ) : null}
    </div>
  );
};

const MdChart = ({ message_id, children }) => {
  const data = validate_chart_data(children);
  const process = useProcessController(
    (state) => state.message_process?.[message_id]
  );
  if (process?.id === message_id && !data?.valid) {
    return <ChartLoader />;
  } else if (process?.id !== message_id && !data?.valid) {
    return <ChartError />;
  } else
    return (
      <ChartContainer
        chartData={data.chart_data}
        isValid={data?.valid}
        initialState={data?.valid ? STATES.CHART : STATES.DATA}
      />
    );
};

export default MdChart;
