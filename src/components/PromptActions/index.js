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
  handleModelSelect,
  selectedModel,
  isWebSearchDisabled,
  toggleWebSearchDisabled,
}) => {
  return (
    <div className="flex justify-between items-center gap-2">
      <div className="flex items-center gap-2">
        <SelectAIModel
          onSelect={handleModelSelect}
          selectedModel={selectedModel}
          toggleWebSearchDisabled={toggleWebSearchDisabled}
        />
        <WebSearchOption
          selectedModel={selectedModel}
          disabled={isWebSearchDisabled}
          onClick={handleClickWebSearch}
          active={isWebSearchOn}
        />
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
