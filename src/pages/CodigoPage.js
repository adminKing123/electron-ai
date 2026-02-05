import { BsRobot } from "react-icons/bs";
import { useEffect, useState, useRef } from "react";

const CodigoPage = () => {
  const [elapsedTime, setElapsedTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const animationFrameRef = useRef(null);

  // Start time: 2:30 PM 05 FEB 2026 IST (GMT+5:30)
  const startTime = new Date("2026-02-05T14:00:00+05:30").getTime();

  useEffect(() => {
    const updateTime = () => {
      const now = Date.now();
      const diff = now - startTime;

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setElapsedTime({ hours, minutes, seconds });
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    animationFrameRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const formatTime = () => {
    const h = String(elapsedTime.hours).padStart(2, "0");
    const m = String(elapsedTime.minutes).padStart(2, "0");
    const s = String(elapsedTime.seconds).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="w-screen h-dvh flex items-center justify-center">
      <div>
        <div className="flex items-center gap-4 mb-4">
          <BsRobot className="text-6xl text-[#daa500]" />
          <h2 className="text-6xl text-[#daa500]">CODIGO</h2>
        </div>
        <h1 className="text-center text-xl font-bold text-gray-800 dark:text-[#636363]">
          Coming Soon
        </h1>
        <div className="mt-8 text-center">
          <div className="text-4xl font-mono font-bold text-[#daa500] mb-2">
            {formatTime()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Running since: 2:30 PM 05 FEB 2026 IST
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodigoPage;
