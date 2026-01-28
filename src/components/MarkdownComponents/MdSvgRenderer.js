const MdSvgRenderer = ({ content }) => {
  return (
    <div className="flex justify-center items-center">
      <div 
        dangerouslySetInnerHTML={{ __html: content }}
        className="max-w-full overflow-auto"
      />
    </div>
  );
};

export default MdSvgRenderer;
