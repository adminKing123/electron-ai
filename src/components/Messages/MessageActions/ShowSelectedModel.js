import { LuBrainCircuit } from "react-icons/lu";
import { PiGlobe } from "react-icons/pi";
import { RiImageCircleAiLine } from "react-icons/ri";

const IdentifySearch = ({ message }) => {
  return message.generate_image ? (
    <RiImageCircleAiLine />
  ) : message.google_search ? (
    <PiGlobe />
  ) : (
    <LuBrainCircuit />
  );
};

const ShowSelectedModel = ({ message }) => {
  return (
    <div className="text-[#5D5D5D] dark:text-[#b8b8b8] flex items-center gap-1 text-xs">
      <IdentifySearch message={message} />
      <span>{message.model.name}</span>
    </div>
  );
};

export default ShowSelectedModel;
