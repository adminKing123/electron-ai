import Prompt from "../components/Prompt";
import Messages from "../components/Messages";
import { v4 as uuidv4 } from "uuid";

function GenerationPage() {
  const chat_id = `temp-${uuidv4()}`;

  return (
    <div className="bg-[#0d1117] w-screen h-[100dvh] py-2">
      <div className="flex flex-col h-full w-full">
        <Messages />
        <div className="max-w-[768px] px-5 md:px-0 md:mx-auto w-full">
          <Prompt chat_id={chat_id} />
        </div>
      </div>
    </div>
  );
}

export default GenerationPage;
