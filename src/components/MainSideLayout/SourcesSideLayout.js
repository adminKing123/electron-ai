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
        hover:bg-[#f5f5f5] dark:hover:bg-[#222]
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
        <span className="text-[11px] font-medium text-[#888] dark:text-[#555] truncate">
          {data.from}
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-[13px] font-semibold leading-snug line-clamp-2 text-[#111] dark:text-[#e8e8e8]">
        {data.headline}
      </h2>

      {/* Summary */}
      <p className="text-[12px] leading-snug line-clamp-2 text-[#777] dark:text-[#666]">
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
      className="fixed lg:static top-0 left-0 w-screen h-[100dvh] lg:w-[360px] lg:flex-shrink-0 z-[100] lg:z-auto p-5 lg:p-0 flex justify-center lg:justify-normal items-center lg:items-stretch bg-black/30 dark:bg-black/50 lg:bg-transparent"
    >
      <motion.div className="rounded-2xl lg:rounded-none min-w-[280px] lg:min-w-[360px] max-w-[580px] lg:max-w-none w-full h-auto lg:h-full
        bg-white dark:bg-[#191919]
        shadow-[0_8px_40px_rgba(0,0,0,0.15)] lg:shadow-none
        border lg:border-0 lg:border-l
        border-[#ebebeb] dark:border-[#222]
        flex flex-col"
      >
        {/* Header */}
        <div className="px-4 h-[56px] flex-shrink-0 flex items-center justify-between border-b border-[#ebebeb] dark:border-[#222]">
          <h2 className="text-[14px] font-semibold text-[#111] dark:text-white">
            Sources
          </h2>
          <button
            onClick={() => setData(null)}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              text-[#888] dark:text-[#666]
              hover:text-[#111] dark:hover:text-white
              hover:bg-[#ebebeb] dark:hover:bg-[#222]
              transition-colors"
          >
            <IoClose className="w-[16px] h-[16px]" />
          </button>
        </div>

        {/* Source list */}
        <div className="flex flex-col p-2 max-h-[80dvh] lg:max-h-none lg:flex-1 overflow-y-auto">
          {data?.payload?.sources.map((source, index) => (
            <Source key={index} data={source} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default SourcesSideLayout;
