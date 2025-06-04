import Prompt from "../components/Prompt";
import Messages from "../components/Messages";
import { useEffect } from "react";

function GenerationPage({ chat }) {
  useEffect(() => {
    const container = document.getElementById("messages-container");
    const header = document.getElementById("header");
    const handleScroll = () => {
      if (container.scrollTop > 0) {
        header.classList.add("header-shadow");
      } else {
        header.classList.remove("header-shadow");
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div id="gen-container" className="flex flex-col h-full w-full opacity-0">
      <Messages chat={chat} />
      <div
        id="prompt-container"
        className={`w-full transition-all duration-500 absolute bottom-4 ${
          chat?.scroll_to_message ? "" : "screen-center"
        }`}
      >
        <div className="max-w-[800px] px-5 mx-auto">
          <Prompt chat={chat} />
        </div>
      </div>
    </div>
  );
}

export default GenerationPage;
