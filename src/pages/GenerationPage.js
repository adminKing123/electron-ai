import Prompt from "../components/Prompt";
import Messages from "../components/Messages";
import { v4 as uuidv4 } from "uuid";
import useUserStore from "../store/useUserStore";
import { Navigate } from "react-router-dom";
import ROUTES from "../router/routes";

function GenerationPage() {
  const { user } = useUserStore();
  const chat_id = `temp-${uuidv4()}`;

  if (!user) return <Navigate to={ROUTES.AUTH} />;
  return (
    <div className="flex flex-col h-full w-full">
      <Messages chat_id={chat_id} />
      <div
        id="prompt-container"
        className="w-full transition-all duration-500 absolute bottom-4 screen-center"
      >
        <div className="max-w-[800px] px-5 mx-auto">
          <Prompt chat_id={chat_id} />
        </div>
      </div>
    </div>
  );
}

export default GenerationPage;
