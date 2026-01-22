import ImageWithSkeleton from "../../Common/ImageWithSkeleton";

const GeneratedImages = ({ images }) => {
  const len = images.length;

  if (len === 0) return null;
  if (len === 1)
    return (
      <div className="my-2">
        <ImageWithSkeleton
          src={images[0].download_url}
          alt={images[0].original_name}
          className="max-w-[400px] rounded-2xl overflow-hidden"
          skeletonClassName="w-full max-w-[400px] aspect-square rounded-lg"
        />
      </div>
    );

  // we will handle it later when we will generate multiple images
  return null;
};

export default GeneratedImages;
