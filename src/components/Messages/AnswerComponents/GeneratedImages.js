import ImageWithSkeleton from "../../Common/ImageWithSkeleton";
import { getAspectRatio, getClassNameWithAspectRatio } from "../../../utils/helpers";

const GeneratedImages = ({ images }) => {
  const len = images.length;

  if (len === 0) return null;
  if (len === 1) {
    return (
      <div className="my-2">
        <ImageWithSkeleton
          src={images[0].download_url}
          alt={images[0].original_name}
          className={`${getClassNameWithAspectRatio(images[0].aspect_ratio)} overflow-hidden rounded-2xl`}
          skeletonClassName={`${getClassNameWithAspectRatio(images[0].aspect_ratio)} rounded-2xl`}
        />
      </div>
    );
  }

  // we will handle it later when we will generate multiple images
  return null;
};

export default GeneratedImages;
