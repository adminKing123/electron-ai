import { SiMediafire } from "react-icons/si";
import { useMutliModelGeneration } from "../../store/usePromptStores";

const TryMultiModelButton = () => {
  const active = useMutliModelGeneration(
    (state) => state.isMultiModelGeneration
  );
  const setIsMultiModelGeneration = useMutliModelGeneration(
    (state) => state.setIsMultiModelGeneration
  );

  const handleClick = () => {
    setIsMultiModelGeneration(!active);
  };

  return (
    <button
      title="Multi-Model"
      className={`border ${
        active ? "border-blue-400 dark:border-green-400" : ""
      } disabled:opacity-50 p-2 rounded-full group flex items-center`}
      onClick={handleClick}
    >
      <SiMediafire
        className={`${
          active
            ? "fill-blue-400 dark:fill-green-400"
            : "fill-black dark:fill-white"
        }`}
      />
      <span
        className={`${
          active
            ? "text-blue-400 dark:text-green-400"
            : "text-black dark:text-white"
        } text-xs max-w-0 text-nowrap opacity-0 group-hover:max-w-[100px] group-hover:pl-2 group-hover:opacity-100 transition-[max-width,opacity,padding] duration-300 overflow-hidden`}
      >
        Multi-Model
      </span>
    </button>
  );
};

export default TryMultiModelButton;
