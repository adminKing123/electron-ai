import Prompt from "../components/Prompt";
import Messages from "../components/Messages";
import { v4 as uuidv4 } from "uuid";

function GenerationPage() {
  const chat_id = `temp-${uuidv4()}`;

  return (
    <div className="bg-[#212121] w-screen h-[100dvh] py-2">
      <div className="flex flex-col h-full w-full">
        <Messages chat_id={chat_id} />
        <div
          id="prompt-container"
          className="w-full transition-all duration-500 absolute bottom-4 screen-center"
        >
          <div className="max-w-[800px] px-5 md:px-0 md:mx-auto">
            <Prompt chat_id={chat_id} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerationPage;
