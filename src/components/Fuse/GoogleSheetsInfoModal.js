import React, { useEffect, useState } from "react";
import Modal from "../Common/Modal";
import { BasicLoader } from "../Loaders";
import { getGoogleSheetsIntegrationInfoAPI } from "../../apis/fuse/queryFunctions";
import { SiGooglesheets } from "react-icons/si";
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
    <div className="flex items-center gap-2 text-[13px] text-[#888] dark:text-[#888] shrink-0">
      {icon}
      <span>{label}</span>
    </div>
    <div
      className={`text-[13px] font-medium text-right text-[#222] dark:text-[#eee] ${valueClassName}`}
    >
      {value}
    </div>
  </div>
);

const GoogleSheetsInfoModal = ({ isOpen, onClose }) => {
  const [sheetsInfo, setSheetsInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSheetsInfo(null);
      setLoadingInfo(false);
      setHasError(false);
      return;
    }

    let isMounted = true;

    const fetchInfo = async () => {
      setLoadingInfo(true);
      setHasError(false);
      try {
        const info = await getGoogleSheetsIntegrationInfoAPI();
        if (isMounted) setSheetsInfo(info);
      } catch (error) {
        console.error("Failed to fetch Google Sheets integration info", error);
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
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#f7f7f7] dark:bg-[#1a1a1a]">
            <SiGooglesheets className="w-6 h-6 text-[#444444] dark:text-white" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#222] dark:text-[#eee] leading-tight">
              Google Sheets integration
            </p>
            <p className="text-[12px] text-[#888] dark:text-[#777] leading-tight">
              Connection details for your linked account
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-[180px]">
        {loadingInfo ? (
          <div className="flex flex-col items-center justify-center gap-3 h-[180px] text-[#333] dark:text-[#ccc]">
            <BasicLoader />
          </div>
        ) : hasError || !sheetsInfo ? (
          <div className="flex flex-col items-center justify-center gap-2 h-44 text-center px-6">
            <HiOutlineExclamationTriangle className="w-6 h-6 text-red-400" />
            <p className="text-[13px] font-medium text-[#333] dark:text-[#ccc]">
              Couldn't load Google Sheets integration info
            </p>
            <p className="text-[12px] text-[#888] dark:text-[#777]">
              Please try again, or reconnect your account if the issue
              continues.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#ececec] dark:divide-[#2a2a2a]">
            <InfoRow
              icon={<HiOutlineIdentification className="w-4 h-4" />}
              label="Integration ID"
              value={sheetsInfo.integration_id}
              valueClassName="font-mono break-all"
            />
            {sheetsInfo.name && (
              <InfoRow
                icon={<HiOutlineUser className="w-4 h-4" />}
                label="Name"
                value={sheetsInfo.name}
              />
            )}
            {sheetsInfo.email && (
              <InfoRow
                icon={<HiOutlineEnvelope className="w-4 h-4" />}
                label="Email"
                value={sheetsInfo.email}
                valueClassName="break-all"
              />
            )}
            <InfoRow
              icon={<HiOutlineCheckCircle className="w-4 h-4" />}
              label="Status"
              value={<StatusBadge configured={!!sheetsInfo.configured} />}
            />
            <InfoRow
              icon={<HiOutlineClock className="w-4 h-4" />}
              label="Last updated"
              value={formatDateTime(sheetsInfo.updated_at)}
            />
            {sheetsInfo.expires_at && (
              <InfoRow
                icon={<HiOutlineClock className="w-4 h-4" />}
                label="Expires at"
                value={
                  <span
                    className={
                      isExpired(sheetsInfo.expires_at) ? "text-red-500" : ""
                    }
                  >
                    {formatDateTime(sheetsInfo.expires_at)}
                    {isExpired(sheetsInfo.expires_at) ? " (expired)" : ""}
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
            bg-[#f4f4f4] dark:bg-[#2a2a2a]
            text-[#333] dark:text-[#ccc]
            hover:bg-[#ebebeb] dark:hover:bg-[#333]
            border border-[#e8e8e8] dark:border-[#333]
            transition-colors"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default GoogleSheetsInfoModal;
