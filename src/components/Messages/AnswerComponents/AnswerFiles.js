import MessageFilePreview from "../MessageFilePreview";

const AnswerFiles = ({ answer_files, message_id }) => {
  if (answer_files.length === 0) return null;
  return (
    <div className="flex justify-start mt-2">
      <div className="flex flex-wrap gap-2">
        {answer_files.map((file) => (
          <MessageFilePreview key={file.file_id} fileObj={file} />
        ))}
      </div>
    </div>
  );
};

export default AnswerFiles;
