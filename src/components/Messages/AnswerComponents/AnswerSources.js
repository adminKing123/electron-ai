import CONFIG from "../../../config";

const Source = ({ data }) => {
  return (
    <a
      href={data.url}
      target="_blank"
      className="p-2 bg-[#f8f8f8] dark:bg-[#202020] rounded-lg border dark:border-[#303030]"
    >
      <div className="text-xs text-[#454545] dark:text-[#929292] flex items-center gap-2 mb-2">
        <span className="w-[14px] h-[14px]">
          <img
            src={CONFIG.GOOGLE_ICON_IMAGE_LOAD_API_64(data.domain)}
            loading="lazy"
          />
        </span>
        <span>{data.from}</span>
      </div>
      <h2 className="text-xs line-clamp-2 font-semibold text-[#000000] dark:text-[#ffffff]">
        {data.headline}
      </h2>
    </a>
  );
};

const AnswerSources = ({ sources }) => {
  console.log(sources);
  return (
    <div className="mt-6">
      <div className="grid grid-cols-4 gap-2">
        {sources.map((source, index) => (
          <Source key={index} data={source} />
        ))}
      </div>
    </div>
  );
};

export default AnswerSources;
