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
     `px-3 py-1 rounded-full border text-[11px] font-medium transition-colors
    ${
      state === btnState
        ? "bg-brand-600 dark:bg-brand-500 text-white dark:text-[var(--brand-on-solid)] border-transparent"
        : "bg-transparent text-ink-600 dark:text-ink-500 border-ink-150 dark:border-void-750 hover:bg-ink-75 dark:hover:bg-void-825"
    }`;

   return (
     <div className="border border-ink-100 dark:border-void-800 rounded-2xl overflow-hidden my-2">
       <div className="px-4 py-2.5 bg-ink-75 dark:bg-void-825 border-b border-ink-100 dark:border-void-800 flex justify-between items-center">
         <div className="text-[12px] font-medium text-ink-500 dark:text-ink-550 tracking-wide truncate">
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
         <div className="p-3 max-h-[400px] overflow-y-auto">
           {isValid ? (
             <pre className="text-[12px] font-mono text-ink-750 dark:text-ink-300 m-0">{JSON.stringify(chartData.data, null, 2)}</pre>
           ) : (
             <pre className="text-[12px] font-mono text-ink-750 dark:text-ink-300 m-0">{chartData.data}</pre>
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
