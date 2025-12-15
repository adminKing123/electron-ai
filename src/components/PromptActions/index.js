import DeepResearchButton from "./DeepResearchButton";
import FileInputTaker from "./FileInputTaker";
import SelectAIModel from "./SelectAIModel";
import SendButton from "./SendButton";
import WebSearchOption from "./WebSearchOption";

const PromptActions = ({ handleSend, fileInputRef }) => {
  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        <SelectAIModel />
        <FileInputTaker inputRef={fileInputRef} />
        <WebSearchOption />
        <DeepResearchButton />
      </div>
      <div>
        <SendButton onClick={handleSend} />
      </div>
    </div>
  );
};

export default PromptActions;
