import useMainModalStore from "../../store/useMainModalStore";
import { AnimatePresence } from "framer-motion";
import DeleteChatModal from "./DeleteChatModal";
import RenameChatModal from "./RenameChatModal";
import ConnectAppsModal from "./ConnectAppsModal";

const MainModalLayout = () => {
  const data = useMainModalStore((state) => state.data);

  const COMPONENTS = {
    delete_chat: DeleteChatModal,
    rename_chat: RenameChatModal,
    connect_apps: ConnectAppsModal,
  };

  const Component = COMPONENTS?.[data?.type];

  return (
    <AnimatePresence>
      {Component ? <Component data={data} /> : null}
    </AnimatePresence>
  );
};

export default MainModalLayout;
