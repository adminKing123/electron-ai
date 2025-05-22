import SelectAIModel from "./SelectAIModel";
import SendButton from "./SendButton";
import WebSearchOption from "./WebSearchOption";

const PromptActions = ({
  handleSend,
  isGeneratingPrompt,
}) => {
  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        <SelectAIModel />
        <WebSearchOption />
      </div>
      <div>
        <SendButton
          onClick={handleSend}
          isGeneratingPrompt={isGeneratingPrompt}
        />
      </div>
    </div>
  );
};

export default PromptActions;
