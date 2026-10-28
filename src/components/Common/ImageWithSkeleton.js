import { useState } from "react";

const ImageWithSkeleton = ({
  src,
  alt,
  className = "",
  skeletonClassName = "",
  skeletonStyle = {},
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && <div className={`bg-ink-150 dark:bg-void-725 animate-pulse ${skeletonClassName}`} style={skeletonStyle}></div>}
      <img
        className={`${className} ${!isLoaded ? "hidden" : ""}`}
        src={src}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
      />
    </>
  );
};

export default ImageWithSkeleton;
