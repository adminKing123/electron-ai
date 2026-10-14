import React, { useCallback, useEffect, useState } from "react";
import Modal from "../Common/Modal";
import { BasicLoader } from "../Loaders";
import {
  getWebexIntegrationInfoAPI,
  getWebexWebhooksAPI,
  deleteWebexWebhookAPI,
} from "../../apis/fuse/queryFunctions";
import IntegrationIconTile from "./IntegrationIconTile";
import {
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineClock,
  HiOutlineIdentification,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineExclamationTriangle,
  HiOutlineLink,
  HiOutlineTrash,
} from "react-icons/hi2";

const TABS = [
  { id: "basic", label: "Basic Info" },
  { id: "webhooks", label: "Webhooks" },
];

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

const TabBar = ({ activeTab, onChange, webhookCount }) => (
  <div className="flex gap-1 p-1 mb-4 rounded-xl bg-[#f4f4f4] dark:bg-[#252525]">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={[
          "flex-1 px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors",
          activeTab === tab.id
            ? "bg-white dark:bg-[#1a1a1a] text-[#222] dark:text-[#eee] shadow-sm"
            : "text-[#888] dark:text-[#777] hover:text-[#444] dark:hover:text-[#bbb]",
        ].join(" ")}
      >
        {tab.label}
        {tab.id === "webhooks" && webhookCount != null ? ` (${webhookCount})` : ""}
      </button>
    ))}
  </div>
);

const BasicInfoPanel = ({ webexInfo }) => (
  <div className="divide-y divide-[#ececec] dark:divide-[#2a2a2a]">
    <InfoRow
      icon={<HiOutlineIdentification className="w-4 h-4" />}
      label="Integration ID"
      value={webexInfo.integration_id}
      valueClassName="font-mono break-all"
    />
    {webexInfo.person_id && (
      <InfoRow
        icon={<HiOutlineIdentification className="w-4 h-4" />}
        label="Person ID"
        value={webexInfo.person_id}
        valueClassName="font-mono break-all"
      />
    )}
    {webexInfo.name && (
      <InfoRow
        icon={<HiOutlineUser className="w-4 h-4" />}
        label="Name"
        value={webexInfo.name}
      />
    )}
    {webexInfo.email && (
      <InfoRow
        icon={<HiOutlineEnvelope className="w-4 h-4" />}
        label="Email"
        value={webexInfo.email}
        valueClassName="break-all"
      />
    )}
    <InfoRow
      icon={<HiOutlineCheckCircle className="w-4 h-4" />}
      label="Status"
      value={<StatusBadge configured={!!webexInfo.configured} />}
    />
    <InfoRow
      icon={<HiOutlineClock className="w-4 h-4" />}
      label="Last updated"
      value={formatDateTime(webexInfo.updated_at)}
    />
    {webexInfo.expires_at && (
      <InfoRow
        icon={<HiOutlineClock className="w-4 h-4" />}
        label="Access token expires"
        value={
          <span className={isExpired(webexInfo.expires_at) ? "text-red-500" : ""}>
            {formatDateTime(webexInfo.expires_at)}
            {isExpired(webexInfo.expires_at) ? " (expired)" : ""}
          </span>
        }
      />
    )}
    {webexInfo.refresh_token_expires_at && (
      <InfoRow
        icon={<HiOutlineClock className="w-4 h-4" />}
        label="Refresh token expires"
        value={
          <span
            className={
              isExpired(webexInfo.refresh_token_expires_at) ? "text-red-500" : ""
            }
          >
            {formatDateTime(webexInfo.refresh_token_expires_at)}
            {isExpired(webexInfo.refresh_token_expires_at) ? " (expired)" : ""}
          </span>
        }
      />
    )}
  </div>
);

const WebhookStatusPill = ({ status }) => {
  const active = (status || "").toLowerCase() === "active";
  return (
    <span
      className={[
        "inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-medium capitalize",
        active
          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
          : "bg-[#f0f0f0] text-[#888] dark:bg-[#2a2a2a] dark:text-[#777]",
      ].join(" ")}
    >
      {status || "unknown"}
    </span>
  );
};

const WebhookCard = ({ webhook, onRemove, removing }) => (
  <div
    className="flex flex-col gap-2 p-3 rounded-xl
      bg-[#fafafa] dark:bg-[#141414]
      border border-[#ececec] dark:border-[#2a2a2a]"
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#222] dark:text-[#eee] truncate">
          {webhook.name || "Unnamed webhook"}
        </p>
        <p className="text-[11px] text-[#888] dark:text-[#666] mt-0.5">
          {webhook.resource}/{webhook.event}
          {webhook.filter ? ` · ${webhook.filter}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <WebhookStatusPill status={webhook.status} />
        <button
          type="button"
          title="Remove webhook"
          disabled={removing}
          onClick={() => onRemove(webhook)}
          className="w-8 h-8 flex items-center justify-center rounded-lg
            text-[#bbb] dark:text-[#555]
            hover:text-red-500 dark:hover:text-red-400
            hover:bg-red-50 dark:hover:bg-red-500/10
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors"
        >
          {removing ? (
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiOutlineTrash className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>

    <div className="flex items-start gap-1.5 min-w-0">
      <HiOutlineLink className="w-3.5 h-3.5 text-[#aaa] dark:text-[#555] mt-0.5 shrink-0" />
      <p
        className="text-[11px] font-mono text-[#666] dark:text-[#888] break-all leading-relaxed"
        title={webhook.target_url}
      >
        {webhook.target_url}
      </p>
    </div>

    <div className="flex items-center justify-between gap-2 text-[10.5px] text-[#aaa] dark:text-[#555]">
      <span className="font-mono truncate" title={webhook.id}>
        {webhook.id}
      </span>
      {webhook.created && <span>{formatDateTime(webhook.created)}</span>}
    </div>

    {webhook.is_fuse_managed && (
      <span className="self-start px-2 py-0.5 rounded-md text-[10px] font-medium
        bg-[#e0f2fe] text-[#0369a1] dark:bg-[#0c4a6e]/40 dark:text-[#7dd3fc]">
        Fuse workflow
      </span>
    )}
  </div>
);

const WebhooksPanel = ({ webhooks, loading, error, onRefresh, onRemove, removingId }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-44 text-[#333] dark:text-[#ccc]">
        <BasicLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-44 text-center px-4">
        <HiOutlineExclamationTriangle className="w-6 h-6 text-red-400" />
        <p className="text-[13px] font-medium text-[#333] dark:text-[#ccc]">
          Couldn't load webhooks
        </p>
        <button
          type="button"
          onClick={onRefresh}
          className="text-[12px] text-[#0073b7] dark:text-[#38bdf8] hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!webhooks.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-44 text-center px-6">
        <p className="text-[13px] font-medium text-[#333] dark:text-[#ccc]">
          No webhooks registered
        </p>
        <p className="text-[12px] text-[#888] dark:text-[#777] leading-relaxed">
          Webhooks appear here when you activate a workflow with an
          &ldquo;On Webex Message&rdquo; starter, or when you create them in Webex directly.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-0.5">
      {webhooks.map((webhook) => (
        <WebhookCard
          key={webhook.id}
          webhook={webhook}
          onRemove={onRemove}
          removing={removingId === webhook.id}
        />
      ))}
    </div>
  );
};

const WebexInfoModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [webexInfo, setWebexInfo] = useState(null);
  const [webhooks, setWebhooks] = useState([]);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [webhooksError, setWebhooksError] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [webhooksFetched, setWebhooksFetched] = useState(false);

  const fetchWebhooks = useCallback(async () => {
    setLoadingWebhooks(true);
    setWebhooksError(false);
    try {
      const data = await getWebexWebhooksAPI();
      setWebhooks(data.webhooks ?? []);
    } catch (error) {
      console.error("Failed to fetch Webex webhooks", error);
      setWebhooksError(true);
    } finally {
      setLoadingWebhooks(false);
      setWebhooksFetched(true);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("basic");
      setWebexInfo(null);
      setWebhooks([]);
      setLoadingInfo(false);
      setLoadingWebhooks(false);
      setWebhooksError(false);
      setHasError(false);
      setRemovingId(null);
      setWebhooksFetched(false);
      return;
    }

    let isMounted = true;

    const fetchInfo = async () => {
      setLoadingInfo(true);
      setHasError(false);
      try {
        const info = await getWebexIntegrationInfoAPI();
        if (isMounted) setWebexInfo(info);
      } catch (error) {
        console.error("Failed to fetch Webex integration info", error);
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

  useEffect(() => {
    if (!isOpen || activeTab !== "webhooks" || hasError || loadingInfo) return;
    fetchWebhooks();
  }, [isOpen, activeTab, hasError, loadingInfo, fetchWebhooks]);

  const handleRemoveWebhook = async (webhook) => {
    const label = webhook.name || webhook.id;
    const confirmed = window.confirm(
      `Remove webhook "${label}"?\n\nThis cannot be undone. Fuse-managed workflows linked to this webhook will be turned off.`,
    );
    if (!confirmed) return;

    setRemovingId(webhook.id);
    try {
      await deleteWebexWebhookAPI(webhook.id);
      setWebhooks((prev) => prev.filter((w) => w.id !== webhook.id));
    } catch (error) {
      console.error("Failed to delete Webex webhook", error);
      window.alert("Failed to remove webhook. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const showBasicLoader = loadingInfo;
  const showBasicError = !loadingInfo && (hasError || !webexInfo);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-3 mb-2">
          <IntegrationIconTile iconName="SiWebex" />
          <div>
            <p className="text-[15px] font-semibold text-[#222] dark:text-[#eee] leading-tight">
              Webex integration
            </p>
            <p className="text-[12px] text-[#888] dark:text-[#777] leading-tight">
              Connection details and webhook management
            </p>
          </div>
        </div>
      }
    >
      {showBasicLoader ? (
        <div className="flex flex-col items-center justify-center gap-3 h-[220px] text-[#333] dark:text-[#ccc]">
          <BasicLoader />
        </div>
      ) : showBasicError ? (
        <div className="flex flex-col items-center justify-center gap-2 h-44 text-center px-6">
          <HiOutlineExclamationTriangle className="w-6 h-6 text-red-400" />
          <p className="text-[13px] font-medium text-[#333] dark:text-[#ccc]">
            Couldn't load Webex integration info
          </p>
          <p className="text-[12px] text-[#888] dark:text-[#777]">
            Please try again, or reconnect your account if the issue continues.
          </p>
        </div>
      ) : (
        <>
          <TabBar
            activeTab={activeTab}
            onChange={setActiveTab}
            webhookCount={webhooksFetched ? webhooks.length : null}
          />

          <div className="min-h-[220px]">
            {activeTab === "basic" ? (
              <BasicInfoPanel webexInfo={webexInfo} />
            ) : (
              <WebhooksPanel
                webhooks={webhooks}
                loading={loadingWebhooks}
                error={webhooksError}
                onRefresh={fetchWebhooks}
                onRemove={handleRemoveWebhook}
                removingId={removingId}
              />
            )}
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#ececec] dark:border-[#2a2a2a]">
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

export default WebexInfoModal;
