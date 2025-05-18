import SelectAIModel from "./SelectAIModel";
import SendButton from "./SendButton";
import WebSearchOption from "./WebSearchOption";

const PromptActions = ({
  handleSend,
  isSendButtonDisabled,
  isGeneratingPrompt,
  stopGeneration,
  handleClickWebSearch,
  isWebSearchOn,
}) => {
  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        <WebSearchOption
          onClick={handleClickWebSearch}
          active={isWebSearchOn}
        />
        <SelectAIModel />
      </div>
      <div>
        <SendButton
          onClick={handleSend}
          stopGeneration={stopGeneration}
          disabled={isSendButtonDisabled}
          isGeneratingPrompt={isGeneratingPrompt}
        />
      </div>
    </div>
  );
};

export default PromptActions;
