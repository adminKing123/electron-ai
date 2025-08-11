import useMainModalStore from "../../store/useMainModalStore";
import { AnimatePresence } from "framer-motion";
import DeleteChatModal from "./DeleteChatModal";

const MainModalLayout = () => {
  const data = useMainModalStore((state) => state.data);

  const COMPONENTS = {
    delete_chat: DeleteChatModal,
  };

  const Component = COMPONENTS?.[data?.type];

  return (
    <AnimatePresence>
      {Component ? <Component data={data} /> : null}
    </AnimatePresence>
  );
};

export default MainModalLayout;
