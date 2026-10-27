import { motion } from "framer-motion";
import CONFIG from "../../config";
import useMainSideLayoutStore from "../../store/useMainSideLayoutStore";
import { IoClose } from "react-icons/io5";

const Source = ({ data }) => {
  return (
    <a
      href={data.url}
      rel="noreferrer"
      target="_blank"
      className="flex flex-col gap-1 p-3 rounded-xl
        hover:bg-ink-50 dark:hover:bg-ink-875
        transition-colors"
    >
      {/* Domain row */}
      <div className="flex items-center gap-1.5">
        <span className="w-[13px] h-[13px] flex-shrink-0 overflow-hidden rounded-full">
          <img
            alt={data.domain}
            src={CONFIG.GOOGLE_ICON_IMAGE_LOAD_API_64(data.domain)}
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </span>
        <span className="text-[11px] font-medium text-ink-500 dark:text-ink-550 truncate">
          {data.from}
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-[13px] font-semibold leading-snug line-clamp-2 text-ink-975 dark:text-ink-100">
        {data.headline}
      </h2>

      {/* Summary */}
      <p className="text-[12px] leading-snug line-clamp-2 text-ink-550 dark:text-ink-600">
        {data.summary}
      </p>
    </a>
  );
};

function SourcesSideLayout() {
  const data = useMainSideLayoutStore((state) => state.data);
  const setData = useMainSideLayoutStore((state) => state.setData);

  const animateVariants = {
    hidden: { width: "var(--fm-ssl-width-from)", opacity: 0 },
    visible: { width: "var(--fm-ssl-width-to)", opacity: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={animateVariants}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="fixed min-[1172px]:static top-0 left-0 w-screen h-[100dvh] min-[1172px]:w-[360px] min-[1172px]:flex-shrink-0 z-[100] min-[1172px]:z-auto p-5 min-[1172px]:p-0 flex justify-center min-[1172px]:justify-normal items-center min-[1172px]:items-stretch bg-black/30 dark:bg-black/50 min-[1172px]:bg-transparent"
    >
      <motion.div className="rounded-2xl min-[1172px]:rounded-none min-w-[280px] min-[1172px]:min-w-[360px] max-w-[580px] min-[1172px]:max-w-none w-full h-auto min-[1172px]:h-full
        bg-white dark:bg-ink-850
        shadow-[0_8px_40px_rgba(0,0,0,0.15)] min-[1172px]:shadow-none
        border min-[1172px]:border-0 min-[1172px]:border-l
        border-ink-100 dark:border-ink-875
        flex flex-col"
      >
        {/* Header */}
        <div className="px-4 h-[56px] flex-shrink-0 flex items-center justify-between border-b border-ink-100 dark:border-ink-875">
          <h2 className="text-[14px] font-semibold text-ink-975 dark:text-white">
            Sources
          </h2>
          <button
            onClick={() => setData(null)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              text-ink-500 dark:text-ink-600
              hover:text-ink-975 dark:hover:text-white
              hover:bg-ink-100 dark:hover:bg-ink-875
              transition-colors"
          >
            <IoClose className="w-[16px] h-[16px]" />
          </button>
        </div>

        {/* Source list */}
        <div className="flex flex-col p-2 max-h-[80dvh] min-[1172px]:max-h-none min-[1172px]:flex-1 overflow-y-auto">
          {data?.payload?.sources.map((source, index) => (
            <Source key={index} data={source} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default SourcesSideLayout;
