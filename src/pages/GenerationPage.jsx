import Prompt from "../components/Prompt";
import Messages from "../components/Messages";

function GenerationPage() {
  return (
    <div className="bg-[#0d1117] w-screen h-[100dvh] py-2">
      <div className="flex flex-col h-full w-full">
        <Messages />
        <div className="max-w-[768px] px-5 md:px-0 md:mx-auto w-full">
          <Prompt />
        </div>
      </div>
    </div>
  );
}

export default GenerationPage;
