import React, { useCallback, useEffect, useState } from "react";
import Modal from "../Common/Modal";
import { BasicLoader } from "../Loaders";
import {
  getGithubIntegrationInfoAPI,
  getGithubWebhooksAPI,
  deleteGithubWebhookAPI,
} from "../../apis/fuse/queryFunctions";
import { SiGithub } from "react-icons/si";
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
  HiOutlineMagnifyingGlass,
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

const BasicInfoPanel = ({ info }) => (
  <div className="divide-y divide-[#ececec] dark:divide-[#2a2a2a]">
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

const WebhookStatusPill = ({ active }) => {
  return (
    <span
      className={[
        "inline-flex px-2 py-0.5 rounded-full text-[10.5px] font-medium capitalize",
        active
          ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
          : "bg-[#f0f0f0] text-[#888] dark:bg-[#2a2a2a] dark:text-[#777]",
      ].join(" ")}
    >
      {active ? "Active" : "Inactive"}
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
          {webhook.name || "Webhook"}
        </p>
        <p className="text-[11px] text-[#888] dark:text-[#666] mt-0.5 break-all">
          Events: {(webhook.events || []).join(", ")}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <WebhookStatusPill active={webhook.active} />
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

const WebhooksPanel = ({ webhooks, loading, error, onRefresh, onRemove, removingId, repoName, setRepoName, handleFetch }) => {
  return (
    <div className="flex flex-col h-full">
        <div className="flex gap-2 mb-3 items-center">
            <input 
                type="text" 
                placeholder="owner/repo" 
                value={repoName} 
                onChange={e => setRepoName(e.target.value)}
                className="flex-1 bg-white dark:bg-[#111] border border-[#d0d0d0] dark:border-[#333] text-[13px] px-3 py-1.5 rounded-lg text-[#222] dark:text-[#eee] focus:outline-none focus:border-blue-500"
            />
            <button
                onClick={handleFetch}
                disabled={!repoName.trim() || loading}
                className="flex items-center justify-center px-3 py-1.5 rounded-lg bg-[#333] text-white text-[13px] font-medium disabled:opacity-50 hover:bg-[#111] transition-colors"
            >
                <HiOutlineMagnifyingGlass className="w-4 h-4 mr-1" />
                Search
            </button>
        </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 h-32 text-[#333] dark:text-[#ccc]">
          <BasicLoader />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-2 h-32 text-center px-4">
          <HiOutlineExclamationTriangle className="w-6 h-6 text-red-400" />
          <p className="text-[13px] font-medium text-[#333] dark:text-[#ccc]">
            Couldn't load webhooks
          </p>
          <button
            type="button"
            onClick={handleFetch}
            className="text-[12px] text-[#0073b7] dark:text-[#38bdf8] hover:underline"
          >
            Try again
          </button>
        </div>
      ) : webhooks === null ? (
         <div className="flex flex-col items-center justify-center gap-2 h-32 text-center px-6">
          <p className="text-[12px] text-[#888] dark:text-[#777] leading-relaxed">
            Enter a repository name to view its webhooks.
          </p>
        </div>
      ) : !webhooks.length ? (
        <div className="flex flex-col items-center justify-center gap-2 h-32 text-center px-6">
          <p className="text-[13px] font-medium text-[#333] dark:text-[#ccc]">
            No webhooks registered
          </p>
          <p className="text-[12px] text-[#888] dark:text-[#777] leading-relaxed">
            Webhooks appear here when you activate a workflow with an
            &ldquo;On GitHub PR&rdquo; starter.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-0.5">
          {webhooks.map((webhook) => (
            <WebhookCard
              key={webhook.id}
              webhook={webhook}
              onRemove={() => onRemove(webhook, repoName)}
              removing={removingId === webhook.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#f7f7f7] dark:bg-[#1a1a1a]">
            <SiGithub className="w-6 h-6 text-[#444444] dark:text-white" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#222] dark:text-[#eee] leading-tight">
              GitHub integration
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
            Couldn't load GitHub integration info
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
                onRefresh={fetchWebhooks}
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

export default GithubInfoModal;
