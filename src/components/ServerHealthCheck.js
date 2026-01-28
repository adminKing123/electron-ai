import { useEffect, useState } from "react";
import CONFIG from "../config";
import { checkServerHealth } from "../apis/health/queryFunctions";
import { TbGalaxy } from "react-icons/tb";
import { motion, AnimatePresence } from "framer-motion";
import { MdDone } from "react-icons/md";
import { MdErrorOutline } from "react-icons/md";

import { BasicLoader } from "./Loaders";

const SERVER_STATES = {
  CONNECTING: "connecting",
  READY: "ready",
  FAILED: "failed",
};

const CHECK_STATES = {
  PENDING: "pending",
  CHECKING: "checking",
  SUCCESS: "success",
  ERROR: "error",
};

const messages = [
  "Language is more than words—it's intent.",
  "Every question carries context beyond the surface.",
  "Patterns emerge when information connects.",
  "Understanding improves when assumptions are minimized.",
  "Clarity comes from structured reasoning.",
  "Accuracy matters more than speed.",
  "Good answers begin with careful interpretation.",
  "Meaning evolves through context and nuance.",
  "Reasoning is strongest when bias is reduced.",
  "Complexity becomes useful when organized.",
  "Precision is built through iteration.",
  "Insight comes from connecting ideas, not isolating them.",
];

const getStatusIcon = (state) => {
  switch (state) {
    case CHECK_STATES.PENDING:
      return <span><BasicLoader /></span>;
    case CHECK_STATES.CHECKING:
      return <span><BasicLoader /></span>;
    case CHECK_STATES.SUCCESS:
      return <span className="text-green-500"><MdDone /></span>;
    case CHECK_STATES.ERROR:
      return <span className="text-red-500"><MdErrorOutline /></span>;
    default:
      return <span><BasicLoader /></span>;
  }
};

const LoadingStateUI = ({ checks }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#ffffff] dark:bg-[#212121] w-screen h-[100dvh] flex items-center justify-center flex-col">
      <TbGalaxy className="text-[#000000] dark:text-white w-[72px] h-[72px] animate-spin [animation-duration:5s] mb-8" />
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-[#000000] dark:text-white font-semibold text-center italic px-4"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
      <p className="opacity-50 text-[#000000] dark:text-white text-xs text-center px-4 mt-10">
        Please wait
      </p>
      <p className="opacity-50 text-[#000000] dark:text-white text-xs text-center px-4 mb-2">
        while we check the server status...
      </p>
      <div className="px-4">
        <div className="flex items-center gap-3 text-sm">
          {getStatusIcon(checks.api)}
          <span className="text-[#000000] dark:text-white font-mono text-xs">
            API Server
          </span>
          <span className="text-[#000000] dark:text-white opacity-40 text-xs">
            {CONFIG.API_BASE_URL}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {getStatusIcon(checks.cdn)}
          <span className="text-[#000000] dark:text-white font-mono text-xs">
            CDN Server
          </span>
          <span className="text-[#000000] dark:text-white opacity-40 text-xs">
            {CONFIG.FILE_CDN_URL}
          </span>
        </div>
      </div>
    </div>
  );
};

const ErrorStateUI = ({ checks }) => {
  return (
    <div className="bg-[#ffffff] dark:bg-[#212121] w-screen h-[100dvh] flex items-center justify-center flex-col">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-8"
      >
        <TbGalaxy className="text-red-600 dark:text-red-400 w-[72px] h-[72px]" />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-red-600 dark:text-red-400 font-semibold text-center italic px-4 text-lg"
        >
          Server said “nah bro, not today.”
        </motion.p>
      </AnimatePresence>

      <p className="opacity-60 text-[#000000] dark:text-white text-sm text-center px-4 mt-6 max-w-md">
        We tried reaching the backend server but it didn’t respond. This could
        be a network issue, server downtime, or configuration mismatch.
      </p>

      {/* Server Status Details */}
      <div className="mt-6 px-4">
        <div className="flex items-center gap-3 text-sm">
          {getStatusIcon(checks.api)}
          <span className={`font-mono text-xs ${
            checks.api === CHECK_STATES.SUCCESS
              ? "text-green-500"
              : "text-red-500"
          }`}>
            API Server
          </span>
          <span className="text-[#000000] dark:text-white opacity-40 text-xs">
            {CONFIG.API_BASE_URL}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {getStatusIcon(checks.cdn)}
          <span className={`font-mono text-xs ${
            checks.cdn === CHECK_STATES.SUCCESS
              ? "text-green-500"
              : "text-red-500"
          }`}>
            CDN Server
          </span>
          <span className="text-[#000000] dark:text-white opacity-40 text-xs">
            {CONFIG.FILE_CDN_URL}
          </span>
        </div>
      </div>

      <p className="opacity-40 text-[#000000] dark:text-white text-xs text-center px-4 mt-6">
        Please contact the administrator if the issue persists.
      </p>
    </div>
  );
};

const ServerHealthCheck = ({ children }) => {
  const [serverState, setServerState] = useState(SERVER_STATES.CONNECTING);
  const [checks, setChecks] = useState({
    api: CHECK_STATES.PENDING,
    cdn: CHECK_STATES.PENDING,
  });

  useEffect(() => {
    if (!CONFIG.CHECK_RUNNING_STATUS) return;

    const checkHealth = async () => {
      const startTime = Date.now();

      try {
        // Use the checkServerHealth function with progress callback
        await checkServerHealth((server, state) => {
          const stateMap = {
            'checking': CHECK_STATES.CHECKING,
            'success': CHECK_STATES.SUCCESS,
            'error': CHECK_STATES.ERROR,
          };
          setChecks((prev) => ({ ...prev, [server]: stateMap[state] }));
        });

        const elapsed = Date.now() - startTime;
        const remaining = 3000 - elapsed; // 3000ms minimum delay

        if (remaining > 0) {
          setTimeout(() => {
            setServerState(SERVER_STATES.READY);
          }, remaining);
        } else {
          setServerState(SERVER_STATES.READY);
        }
      } catch (error) {
        setServerState(SERVER_STATES.FAILED);
      }
    };

    checkHealth();
  }, []);

  if (!CONFIG?.CHECK_RUNNING_STATUS) return children;

  if (serverState === SERVER_STATES.CONNECTING) return <LoadingStateUI checks={checks} />;

  if (serverState === SERVER_STATES.FAILED) return <ErrorStateUI checks={checks} />;
  
  return children;
};

export default ServerHealthCheck;
