import React, { useEffect, useState } from "react";
import Modal from "../Common/Modal";
import { BasicLoader } from "../Loaders";
import { getGmailIntegrationInfoAPI } from "../../apis/fuse/queryFunctions";
import IntegrationIconTile from "./IntegrationIconTile";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineIdentification,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineExclamationTriangle,
} from "react-icons/hi2";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const isExpired = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
};

const StatusBadge = ({ configured }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium
      ${
        configured
          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
          : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
      }`}
  >
    {configured ? (
      <HiOutlineCheckCircle className="w-3.5 h-3.5" />
    ) : (
      <HiOutlineXCircle className="w-3.5 h-3.5" />
    )}
    {configured ? "Configured" : "Not configured"}
  </span>
);

const InfoRow = ({ icon, label, value, valueClassName = "" }) => (
  <div className="flex items-start justify-between gap-4 py-3">
    <div className="flex items-center gap-2 text-[13px] text-ink-500 dark:text-ink-500 shrink-0">
      {icon}
      <span>{label}</span>
    </div>
    <div
      className={`text-[13px] font-medium text-right text-ink-875 dark:text-ink-75 ${valueClassName}`}
    >
      {value}
    </div>
  </div>
);

const GmailInfoModal = ({ isOpen, onClose }) => {
  const [gmailInfo, setGmailInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setGmailInfo(null);
      setLoadingInfo(false);
      setHasError(false);
      return;
    }

    let isMounted = true;

    const fetchInfo = async () => {
      setLoadingInfo(true);
      setHasError(false);
      try {
        const info = await getGmailIntegrationInfoAPI();
        if (isMounted) setGmailInfo(info);
      } catch (error) {
        console.error("Failed to fetch Gmail integration info", error);
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setLoadingInfo(false);
      }
    };

    fetchInfo();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3 mb-2">
          <IntegrationIconTile iconName="SiGmail" />
          <div>
            <p className="text-[15px] font-semibold text-ink-875 dark:text-ink-75 leading-tight">
              Gmail integration
            </p>
            <p className="text-[12px] text-ink-500 dark:text-ink-550 leading-tight">
              Connection details for your linked account
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-[180px]">
        {loadingInfo ? (
          <div className="flex flex-col items-center justify-center gap-3 h-[180px] text-ink-750 dark:text-ink-300">
            <BasicLoader />
          </div>
        ) : hasError || !gmailInfo ? (
          <div className="flex flex-col items-center justify-center gap-2 h-44 text-center px-6">
            <HiOutlineExclamationTriangle className="w-6 h-6 text-red-400" />
            <p className="text-[13px] font-medium text-ink-750 dark:text-ink-300">
              Couldn't load Gmail integration info
            </p>
            <p className="text-[12px] text-ink-500 dark:text-ink-550">
              Please try again, or reconnect your account if the issue
              continues.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-ink-100 dark:divide-void-800">
            <InfoRow
              icon={<HiOutlineIdentification className="w-4 h-4" />}
              label="Integration ID"
              value={gmailInfo.integration_id}
              valueClassName="font-mono break-all"
            />
            {gmailInfo.name && (
              <InfoRow
                icon={<HiOutlineUser className="w-4 h-4" />}
                label="Name"
                value={gmailInfo.name}
              />
            )}
            {gmailInfo.email && (
              <InfoRow
                icon={<HiOutlineEnvelope className="w-4 h-4" />}
                label="Email"
                value={gmailInfo.email}
                valueClassName="break-all"
              />
            )}
            <InfoRow
              icon={<HiOutlineCheckCircle className="w-4 h-4" />}
              label="Status"
              value={<StatusBadge configured={!!gmailInfo.configured} />}
            />
            <InfoRow
              icon={<HiOutlineClock className="w-4 h-4" />}
              label="Last updated"
              value={formatDateTime(gmailInfo.updated_at)}
            />
            {gmailInfo.expires_at && (
              <InfoRow
                icon={<HiOutlineClock className="w-4 h-4" />}
                label="Expires at"
                value={
                  <span
                    className={
                      isExpired(gmailInfo.expires_at) ? "text-red-500" : ""
                    }
                  >
                    {formatDateTime(gmailInfo.expires_at)}
                    {isExpired(gmailInfo.expires_at) ? " (expired)" : ""}
                  </span>
                }
              />
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-1.5 rounded-full text-[13px] font-medium
            bg-ink-50 dark:bg-void-800
            text-ink-750 dark:text-ink-300
            hover:bg-ink-100 dark:hover:bg-void-750
            border border-ink-100 dark:border-void-750
            transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default GmailInfoModal;
