const MdImage = ({ src, alt }) => {
  return (
    <div className="max-w-[400px] rounded-lg overflow-hidden mt-2">
      <img src={src} alt={alt} className="h-full" loading="lazy" />
    </div>
  );
};

export default MdImage;
