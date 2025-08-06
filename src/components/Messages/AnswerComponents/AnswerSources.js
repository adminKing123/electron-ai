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
        className="px-3 py-2 border border-[#c4c4c4] dark:border-[#616161] w-fit rounded-full flex items-center gap-1"
      >
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
