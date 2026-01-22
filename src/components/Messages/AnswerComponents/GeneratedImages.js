const GeneratedImages = ({ images }) => {
  const len = images.length;
  if (len === 0) return null;
  if (len === 1)
    return (
      <div className="my-2">
        <img className="max-w-[400px] rounded-2xl overflow-hidden" src={images[0].download_url} alt={images[0].original_name} />
      </div>
    );
  return (
    <div className="my-4 flex flex-wrap gap-4">
      {images.map((img, index) => (
        <div
          key={index}
          className="w-[150px] h-[150px] border border-gray-300 rounded-lg overflow-hidden"
        >
          <img src={img.download_url} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
};

export default GeneratedImages;
