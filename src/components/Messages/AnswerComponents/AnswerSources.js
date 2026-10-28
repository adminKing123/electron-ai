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
          border border-ink-150 dark:border-void-800
          bg-white dark:bg-void-825
          hover:bg-ink-50 dark:hover:bg-void-800
          transition-colors"
      >
        <div className="flex flex-row-reverse">
          {Array.from(new Map(sources.map((s) => [s.domain, s])).values())
            .slice(0, 3)
            .map((source, index) => (
              <div
                key={index}
                className="w-4 h-4 overflow-hidden rounded-full border-2 border-white dark:border-void-900 -ml-1"
              >
                <img
                  alt={source.domain}
                  src={CONFIG.GOOGLE_ICON_IMAGE_LOAD_API_64(source.domain)}
                  loading="lazy"
                />
              </div>
            ))}
        </div>
        <span className="text-[12px] font-medium text-ink-650 dark:text-ink-400">
          {sources.length} {sources.length === 1 ? "source" : "sources"}
        </span>
      </button>
    </div>
  );
};

export default AnswerSources;
