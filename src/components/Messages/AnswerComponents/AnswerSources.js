import CONFIG from "../../../config";
import useMainSideLayoutStore from "../../../store/useMainSideLayoutStore";

const AnswerSources = ({ sources, message_id }) => {
  const setData = useMainSideLayoutStore((state) => state.setData);

  const handleClick = () => {
    setData({
      type: "sources",
      payload: { message_id, sources },
    });
  };

  return (
    <div className="mt-3">
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full
          border border-[#e0e0e0] dark:border-[#2a2a2a]
          bg-white dark:bg-[#1e1e1e]
          hover:bg-[#f5f5f5] dark:hover:bg-[#252525]
          transition-colors"
      >
        <div className="flex flex-row-reverse">
          {Array.from(new Map(sources.map((s) => [s.domain, s])).values())
            .slice(0, 3)
            .map((source, index) => (
              <div
                key={index}
                className="w-4 h-4 overflow-hidden rounded-full border-2 border-white dark:border-[#1e1e1e] -ml-1"
              >
                <img
                  alt={source.domain}
                  src={CONFIG.GOOGLE_ICON_IMAGE_LOAD_API_64(source.domain)}
                  loading="lazy"
                />
              </div>
            ))}
        </div>
        <span className="text-[12px] font-medium text-[#555] dark:text-[#aaa]">
          {sources.length} {sources.length === 1 ? "source" : "sources"}
        </span>
      </button>
    </div>
  );
};

export default AnswerSources;
