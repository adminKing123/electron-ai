import { RiImageCircleAiLine } from "react-icons/ri";
import { useImageGenerateStore } from "../../store/usePromptStores";

const GenerateImageButton = () => {
  const active = useImageGenerateStore((state) => state.isImageGenerateOn);
  const setIsImageGenerateOn = useImageGenerateStore(
    (state) => state.setIsImageGenerateOn
  );

  const handleClick = () => {
    setIsImageGenerateOn(!active);
  };

  return (
    <button
      title="Generate Image"
      className={`border ${
        active ? "border-blue-400 dark:border-green-400" : ""
      } disabled:opacity-50 p-2 rounded-full group flex items-center`}
      onClick={handleClick}
    >
      <RiImageCircleAiLine
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
        Create an image
      </span>
    </button>
  );
};

export default GenerateImageButton;
