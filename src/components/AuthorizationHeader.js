import { TbGalaxy } from "react-icons/tb";
import { motion } from "framer-motion";
import ThemeChangeOption from "./ThemeChangeOption";

const AuthorizationHeader = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="h-[56px] w-full flex items-center justify-between gap-2 px-4 border-b border-[#ebebeb] dark:border-[#222] flex-shrink-0"
    >
      {/* Brand mark */}
      <div className="flex items-center gap-2 text-[#111] dark:text-white">
        <TbGalaxy className="w-[18px] h-[18px]" />
        <span className="text-[14px] font-semibold tracking-tight">Comet AI</span>
      </div>

      {/* Theme toggle */}
      <ThemeChangeOption standalone />
    </motion.header>
  );
};

export default AuthorizationHeader;
