import { BsCpu } from "react-icons/bs";
import { PiGlobe } from "react-icons/pi";
import { RiImageCircleAiLine } from "react-icons/ri";

const IdentifySearch = ({ message }) => {
  return message.generate_image ? (
    <RiImageCircleAiLine />
  ) : message.google_search ? (
    <PiGlobe />
  ) : (
    <BsCpu />
  );
};

const ShowSelectedModel = ({ message }) => {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-[#aaa] dark:text-[#444] select-none">
      <IdentifySearch message={message} />
      <span>{message.model.name}</span>
    </div>
  );
};

export default ShowSelectedModel;
