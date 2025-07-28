import CONFIG from "../../config";
import useMainSideLayoutStore from "../../store/useMainSideLayoutStore";
import { IoClose } from "react-icons/io5";

const Source = ({ data }) => {
  return (
    <a
      href={data.url}
      rel="noreferrer"
      target="_blank"
      className="p-2 hover:bg-[#f2f2f2] dark:hover:bg-[#303030] rounded-lg"
    >
      <div className="text-xs text-[#454545] dark:text-[#929292] flex items-center gap-2 mb-2">
        <span className="w-[14px] h-[14px]">
          <img
            alt={data.domain}
            src={CONFIG.GOOGLE_ICON_IMAGE_LOAD_API_64(data.domain)}
            loading="lazy"
          />
        </span>
        <span className="truncate">{data.from}</span>
      </div>
      <h2 className="text-sm line-clamp-2 font-semibold text-[#000000] dark:text-[#ffffff]">
        {data.headline}
      </h2>
      <p className="text-sm opacity-65 text-[#000000] dark:text-[#ffffff] line-clamp-2">
        {data.summary}
      </p>
    </a>
  );
};

function SourcesSideLayout() {
  const data = useMainSideLayoutStore((state) => state.data);
  const setData = useMainSideLayoutStore((state) => state.setData);

  const toggleSideLayout = () => {
    setData(null);
  };

  return (
    <div className="w-[380px] flex-shrink-0 border-l border-[#f2f2f2] dark:border-[#303030]">
      <div className="px-4 header-shadow mb-[1px] flex items-center justify-between h-14">
        <h2 className="text-lg font-semibold text-[#000000] dark:text-[#ffffff]">
          Sources
        </h2>
        <button
          onClick={toggleSideLayout}
          className="w-10 h-10 px-2 hover:bg-[#EAEAEA] dark:hover:bg-[#3A3A3A] rounded-lg"
        >
          <IoClose className="text-[#8F8F8F] dark:text-white w-[24px] h-[24px]" />
        </button>
      </div>
      <div className="flex flex-col gap-2 p-2 h-[calc(100%-57px)] overflow-y-auto">
        {data?.sources.map((source, index) => (
          <Source key={index} data={source} />
        ))}
      </div>
    </div>
  );
}

export default SourcesSideLayout;
