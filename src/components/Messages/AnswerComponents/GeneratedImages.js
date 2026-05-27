import { useState } from "react";
import { BiExpandAlt } from "react-icons/bi";
import ImageWithSkeleton from "../../Common/ImageWithSkeleton";
import ImageViewer from "../../Common/ImageViewer";
import { getClassNameWithAspectRatio } from "../../../utils/helpers";
import ENDPOINTS from "../../../apis/endpoints";

const GeneratedImages = ({ images }) => {
  const [viewerIndex, setViewerIndex] = useState(null);
  const len = images.length;

  if (len === 0) return null;

  if (len === 1) {
    const img = images[0];
    const src = ENDPOINTS.GET_DOWNLOAD_URI(img.download_url);
    return (
      <div className="my-2">
        {/* Clickable thumbnail with hover overlay */}
        <div
          className="relative group cursor-zoom-in inline-block"
          onClick={() => setViewerIndex(0)}
        >
          <ImageWithSkeleton
            src={src}
            alt={img.original_name}
            className={`${getClassNameWithAspectRatio(img.aspect_ratio)} overflow-hidden rounded-2xl`}
            skeletonClassName={`${getClassNameWithAspectRatio(img.aspect_ratio)} rounded-2xl`}
          />
          {/* Hover expand indicator */}
          <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 backdrop-blur-sm rounded-full p-2.5">
              <BiExpandAlt className="w-[18px] h-[18px] text-white" />
            </div>
          </div>
        </div>

        {/* Fullscreen viewer */}
        <ImageViewer
          src={src}
          alt={img.original_name}
          isOpen={viewerIndex === 0}
          onClose={() => setViewerIndex(null)}
        />
      </div>
    );
  }

  return null;
};

export default GeneratedImages;

