import { RiImageCircleAiLine } from "react-icons/ri";
import { useImageGenerateStore } from "../../store/usePromptStores";

const GenerateImageButton = () => {
  const { isImageGenerateOn: active, setIsImageGenerateOn } =
    useImageGenerateStore();

  const handleClick = () => {
    setIsImageGenerateOn(!active);
  };

  return (
    <button
      title="Generate Image"
      className={`border ${
        active ? "border-green-400" : ""
      } disabled:opacity-50 p-2 rounded-full group`}
      onClick={handleClick}
    >
      <RiImageCircleAiLine
        className={`${active ? "fill-green-400" : "fill-white"}`}
      />
    </button>
  );
};

export default GenerateImageButton;
