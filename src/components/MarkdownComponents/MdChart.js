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
     `px-3 py-1 rounded-full border text-[10px] font-medium transition-colors
    ${
      state === btnState
        ? "bg-[#111] dark:bg-white text-white dark:text-[#111] border-transparent"
        : "bg-transparent text-[#666] dark:text-[#888] border-[#e0e0e0] dark:border-[#333] hover:bg-[#f0f0f0] dark:hover:bg-[#252525]"
    }`;

   return (
     <div className="border border-[#e8e8e8] dark:border-[#2a2a2a] rounded-2xl overflow-hidden my-2">
       <div className="px-4 py-2.5 bg-[#f0f0f0] dark:bg-[#1e1e1e] border-b border-[#e8e8e8] dark:border-[#2a2a2a] flex justify-between items-center">
         <div className="text-[12px] font-medium text-[#888] dark:text-[#555] tracking-wide truncate">
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
             <pre className="text-[12px] font-mono text-[#333] dark:text-[#ccc] m-0">{JSON.stringify(chartData.data, null, 2)}</pre>
           ) : (
             <pre className="text-[12px] font-mono text-[#333] dark:text-[#ccc] m-0">{chartData.data}</pre>
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
