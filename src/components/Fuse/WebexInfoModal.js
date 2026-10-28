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
} from "react-icons/hi2";
import {
  WebhookList,
  WebhookListRow,
  WebhooksListHeader,
  WebhooksPanelEmpty,
  WebhooksPanelError,
  WebhooksPanelLoader,
} from "./integrationWebhooksUi";

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

const TabBar = ({ activeTab, onChange, webhookCount }) => (
  <div className="flex gap-1 p-1 mb-4 rounded-xl bg-ink-50 dark:bg-void-825">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={[
          "flex-1 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
          activeTab === tab.id
            ? "bg-white dark:bg-void-850 text-ink-875 dark:text-ink-75 shadow-sm"
            : "text-ink-500 dark:text-ink-550 hover:text-ink-700 dark:hover:text-ink-350",
        ].join(" ")}
      >
        {tab.label}
        {tab.id === "webhooks" && webhookCount != null ? ` (${webhookCount})` : ""}
      </button>
    ))}
  </div>
);

const BasicInfoPanel = ({ webexInfo }) => (
  <div className="divide-y divide-ink-100 dark:divide-void-800">
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

const webexWebhookSubtitle = (webhook) => {
  const base = `${webhook.resource}/${webhook.event}`;
  return webhook.filter ? `${base} � ${webhook.filter}` : base;
};

const WebhooksPanel = ({ webhooks, loading, error, onRefresh, onRemove, removingId }) => {
  if (loading) return <WebhooksPanelLoader />;
  if (error) return <WebhooksPanelError onRetry={onRefresh} />;
  if (!webhooks.length) {
    return (
      <WebhooksPanelEmpty
        message="No webhooks yet"
        hint='Shown when a workflow uses the "On Webex Message" starter or you add webhooks in Webex.'
      />
    );
  }

  const active = (status) => (status || "").toLowerCase() === "active";

  return (
    <WebhookList
      header={
        <WebhooksListHeader count={webhooks.length} onRefresh={onRefresh} />
      }
    >
      {webhooks.map((webhook) => (
        <WebhookListRow
          key={webhook.id}
          title={webhook.name || "Unnamed webhook"}
          subtitle={webexWebhookSubtitle(webhook)}
          active={active(webhook.status)}
          activeLabel={webhook.status || "unknown"}
          fuseManaged={webhook.is_fuse_managed}
          onRemove={() => onRemove(webhook)}
          removing={removingId === webhook.id}
        />
      ))}
    </WebhookList>
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
            <p className="text-[15px] font-semibold text-ink-875 dark:text-ink-75 leading-tight">
              Webex integration
            </p>
            <p className="text-[12px] text-ink-500 dark:text-ink-550 leading-tight">
              Account details and webhooks
            </p>
          </div>
        </div>
      }
    >
      {showBasicLoader ? (
        <div className="flex flex-col items-center justify-center gap-3 h-[220px] text-ink-750 dark:text-ink-300">
          <BasicLoader />
        </div>
      ) : showBasicError ? (
        <div className="flex flex-col items-center justify-center gap-2 h-44 text-center px-6">
          <HiOutlineExclamationTriangle className="w-6 h-6 text-red-400" />
          <p className="text-[13px] font-medium text-ink-750 dark:text-ink-300">
            Couldn't load Webex integration info
          </p>
          <p className="text-[12px] text-ink-500 dark:text-ink-550">
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

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-ink-100 dark:border-void-800">
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

export default WebexInfoModal;
