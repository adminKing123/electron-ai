import Prompt from "../components/Prompt";
import Messages from "../components/Messages";

function GenerationPage({ chat }) {
  return (
    <div className="flex flex-col h-full w-full">
      <Messages chat={chat} />
      <div
        id="prompt-container"
        className="w-full transition-all duration-500 absolute bottom-4 screen-center"
      >
        <div className="max-w-[800px] px-5 mx-auto">
          <Prompt chat={chat} />
        </div>
      </div>
    </div>
  );
}

export default GenerationPage;
