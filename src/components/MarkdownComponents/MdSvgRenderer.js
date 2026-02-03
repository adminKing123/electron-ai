import { createSvgDataUrl } from "../../utils/helpers";

const MdSvgRenderer = ({ content }) => {
  return (
    <div className="flex justify-center items-center">
      <img
        src={createSvgDataUrl(content)}
        alt="Rendered SVG"
        className="max-h-96 w-full"
      />
    </div>
  );
};

export default MdSvgRenderer;
