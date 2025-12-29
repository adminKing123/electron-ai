import FileInputTaker from "./FileInputTaker";
import SelectAIModel from "./SelectAIModel";
import SendButton from "./SendButton";
import SearchOptionsPopover from "./SearchOptionsPopover";
import MicButton from "./MicButton";

const PromptActions = ({ handleSend, fileInputRef, chat }) => {
  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        <SelectAIModel />
        <FileInputTaker inputRef={fileInputRef} chat={chat} />
        <SearchOptionsPopover />
      </div>
      <div className="flex items-center gap-2">
        <MicButton />
        <SendButton onClick={handleSend} />
      </div>
    </div>
  );
};

export default PromptActions;
