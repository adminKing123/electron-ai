import CONFIG from "../../../config";

// const Source = ({ data }) => {
//   return (
//     <a
//       href={data.url}
//       rel="noreferrer"
//       target="_blank"
//       className="p-2 bg-[#f8f8f8] dark:bg-[#202020] rounded-lg border dark:border-[#303030]"
//     >
//       <div className="text-xs text-[#454545] dark:text-[#929292] flex items-center gap-2 mb-2">
//         <span className="w-[14px] h-[14px]">
// <img
//   alt={data.domain}
//   src={CONFIG.GOOGLE_ICON_IMAGE_LOAD_API_64(data.domain)}
//   loading="lazy"
// />
//         </span>
//         <span className="truncate">{data.from}</span>
//       </div>
//       <h2 className="text-xs line-clamp-2 font-semibold text-[#000000] dark:text-[#ffffff]">
//         {data.headline}
//       </h2>
//     </a>
//   );
// };

const AnswerSources = ({ sources }) => {
  return (
    <div className="mt-3">
      <button className="px-3 py-2 border border-[#c4c4c4] dark:border-[#616161] w-fit rounded-full flex items-center gap-1">
        <div className="flex flex-row-reverse">
          {Array.from(new Map(sources.map((s) => [s.domain, s])).values())
            .slice(0, 3)
            .slice(0, 3)
            .map((source, index) => (
              <div
                key={index}
                className="w-4 h-4 overflow-hidden rounded-full border-2 border-[#ffffff] dark:border-[#212121] -ml-1"
              >
                <img
                  alt={source.domain}
                  src={CONFIG.GOOGLE_ICON_IMAGE_LOAD_API_64(source.domain)}
                  loading="lazy"
                />
              </div>
            ))}
        </div>
        <h2 className="text-xs font-semibold text-[#131313] dark:text-[#c4c4c4]">
          Sources
        </h2>
      </button>
    </div>
  );
};

export default AnswerSources;
