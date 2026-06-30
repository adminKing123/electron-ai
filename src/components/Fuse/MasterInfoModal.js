import React from "react";
import GmailInfoModal from "./GmailInfoModal";
import WebexInfoModal from "./WebexInfoModal";
import GoogleSheetsInfoModal from "./GoogleSheetsInfoModal";
import useIntegrationInfoModalStore from "../../store/useIntegrationInfoModalStore";

function MasterInfoModal() {
  const { isOpen, integrationId, closeModal } = useIntegrationInfoModalStore();

  if (integrationId === "gmail") {
    return <GmailInfoModal isOpen={isOpen} onClose={closeModal} />;
  }
  if (integrationId === "webex") {
    return <WebexInfoModal isOpen={isOpen} onClose={closeModal} />;
  }
  if (integrationId === "google_sheets") {
    return <GoogleSheetsInfoModal isOpen={isOpen} onClose={closeModal} />;
  }
  return null;
}

export default MasterInfoModal;
