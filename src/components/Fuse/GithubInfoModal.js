import React, { useCallback, useEffect, useState } from "react";
import Modal from "../Common/Modal";
import { BasicLoader } from "../Loaders";
import {
  getGithubIntegrationInfoAPI,
  getGithubWebhooksAPI,
  deleteGithubWebhookAPI,
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
  GithubRepoLookup,
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

const BasicInfoPanel = ({ info }) => (
  <div className="divide-y divide-ink-100 dark:divide-void-800">
    {info.login && (
      <InfoRow
        icon={<HiOutlineIdentification className="w-4 h-4" />}
        label="Username"
        value={info.login}
      />
    )}
    {info.name && (
      <InfoRow
        icon={<HiOutlineUser className="w-4 h-4" />}
        label="Name"
        value={info.name}
      />
    )}
    {info.email && (
      <InfoRow
        icon={<HiOutlineEnvelope className="w-4 h-4" />}
        label="Email"
        value={info.email}
        valueClassName="break-all"
      />
    )}
    <InfoRow
      icon={<HiOutlineCheckCircle className="w-4 h-4" />}
      label="Status"
      value={<StatusBadge configured={!!info.configured} />}
    />
    <InfoRow
      icon={<HiOutlineClock className="w-4 h-4" />}
      label="Last updated"
      value={formatDateTime(info.updated_at)}
    />
    {info.expires_at && (
      <InfoRow
        icon={<HiOutlineClock className="w-4 h-4" />}
        label="Access token expires"
        value={
          <span className={isExpired(info.expires_at) ? "text-red-500" : ""}>
            {formatDateTime(info.expires_at)}
            {isExpired(info.expires_at) ? " (expired)" : ""}
          </span>
        }
      />
    )}
  </div>
);

const WebhooksPanel = ({
  webhooks,
  loading,
  error,
  onRemove,
  removingId,
  repoName,
  setRepoName,
  handleFetch,
}) => (
  <div>
    <GithubRepoLookup
      repoName={repoName}
      setRepoName={setRepoName}
      onSubmit={handleFetch}
      loading={loading}
    />

    {loading ? (
      <WebhooksPanelLoader />
    ) : error ? (
      <WebhooksPanelError onRetry={handleFetch} />
    ) : webhooks === null ? (
      <WebhooksPanelEmpty
        message="Pick a repository"
        hint="Enter owner/repo and click Load to see webhooks."
      />
    ) : !webhooks.length ? (
      <WebhooksPanelEmpty
        message="No webhooks on this repo"
        hint='They appear when you activate a workflow with the "On GitHub PR" starter.'
      />
    ) : (
      <WebhookList
        header={
          <WebhooksListHeader count={webhooks.length} onRefresh={handleFetch} />
        }
      >
        {webhooks.map((webhook) => (
          <WebhookListRow
            key={webhook.id}
            title={webhook.name || "Webhook"}
            subtitle={(webhook.events || []).join(", ") || "—"}
            active={!!webhook.active}
            activeLabel={webhook.active ? "Active" : "Inactive"}
            fuseManaged={webhook.is_fuse_managed}
            onRemove={() => onRemove(webhook, repoName)}
            removing={removingId === webhook.id}
          />
        ))}
      </WebhookList>
    )}
  </div>
);

const GithubInfoModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [info, setInfo] = useState(null);
  const [webhooks, setWebhooks] = useState(null);
  const [repoName, setRepoName] = useState("");
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingWebhooks, setLoadingWebhooks] = useState(false);
  const [webhooksError, setWebhooksError] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchWebhooks = useCallback(async () => {
    if(!repoName.trim()) return;
    setLoadingWebhooks(true);
    setWebhooksError(false);
    try {
      const data = await getGithubWebhooksAPI(repoName.trim());
      setWebhooks(data.webhooks ?? []);
    } catch (error) {
      console.error("Failed to fetch Github webhooks", error);
      setWebhooksError(true);
    } finally {
      setLoadingWebhooks(false);
    }
  }, [repoName]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("basic");
      setInfo(null);
      setWebhooks(null);
      setRepoName("");
      setLoadingInfo(false);
      setLoadingWebhooks(false);
      setWebhooksError(false);
      setHasError(false);
      setRemovingId(null);
      return;
    }

    let isMounted = true;

    const fetchInfo = async () => {
      setLoadingInfo(true);
      setHasError(false);
      try {
        const data = await getGithubIntegrationInfoAPI();
        if (isMounted) setInfo(data);
      } catch (error) {
        console.error("Failed to fetch Github integration info", error);
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

  const handleRemoveWebhook = async (webhook, repo) => {
    const label = webhook.name || webhook.id;
    const confirmed = window.confirm(
      `Remove webhook "${label}" from ${repo}?\n\nThis cannot be undone. Fuse-managed workflows linked to this webhook will be turned off.`,
    );
    if (!confirmed) return;

    setRemovingId(webhook.id);
    try {
      await deleteGithubWebhookAPI(webhook.id, repo);
      setWebhooks((prev) => prev.filter((w) => w.id !== webhook.id));
    } catch (error) {
      console.error("Failed to delete Github webhook", error);
      window.alert("Failed to remove webhook. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const showBasicLoader = loadingInfo;
  const showBasicError = !loadingInfo && (hasError || !info);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-3 mb-2">
          <IntegrationIconTile iconName="SiGithub" />
          <div>
            <p className="text-[15px] font-semibold text-ink-875 dark:text-ink-75 leading-tight">
              GitHub integration
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
            Couldn't load GitHub integration info
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
            webhookCount={webhooks ? webhooks.length : null}
          />

          <div className="min-h-[220px]">
            {activeTab === "basic" ? (
              <BasicInfoPanel info={info} />
            ) : (
              <WebhooksPanel
                webhooks={webhooks}
                loading={loadingWebhooks}
                error={webhooksError}
                onRemove={handleRemoveWebhook}
                removingId={removingId}
                repoName={repoName}
                setRepoName={setRepoName}
                handleFetch={fetchWebhooks}
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

export default GithubInfoModal;
