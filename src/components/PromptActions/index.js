import SendButton from "./SendButton";

const PromptActions = ({
  handleSend,
  isSendButtonDisabled,
  isGeneratingPrompt,
  stopGeneration,
}) => {
  return (
    <div className="flex justify-end">
      <SendButton
        onClick={handleSend}
        stopGeneration={stopGeneration}
        disabled={isSendButtonDisabled}
        isGeneratingPrompt={isGeneratingPrompt}
      />
    </div>
  );
};

export default PromptActions;
