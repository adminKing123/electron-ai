import { FaBrain } from "react-icons/fa";
import { PiGlobe } from "react-icons/pi";

const ShowSelectedModel = ({ message }) => {
  return (
    <div className="text-[#b8b8b8] flex items-center gap-1 text-xs">
      {message.google_search ? <PiGlobe /> : <FaBrain />}
      <span>{message.model.name}</span>
    </div>
  );
};

export default ShowSelectedModel;
