import React from "react";
import GmailInfoModal from "./GmailInfoModal";
import useIntegrationInfoModalStore from "../../store/useIntegrationInfoModalStore";

function MasterInfoModal() {
  const { isOpen, integrationId, closeModal } = useIntegrationInfoModalStore();

  if (integrationId === "gmail") {
    return <GmailInfoModal isOpen={isOpen} onClose={closeModal} />;
  }
  return null;
}

export default MasterInfoModal;
