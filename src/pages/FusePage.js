import { useEffect, useState } from "react";
import "../skeleton.css";
import {
  FuseStudioSidebar,
  FuseAutomateInput,
} from "../components/Fuse";
import Header from "../components/Header";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import ROUTES from "../router/routes";
import {
  discoverWorkflowsAPI,
  activateWorkflowAPI,
  deactivateWorkflowAPI,
} from "../apis/fuse/queryFunctions";
import { TbBolt } from "react-icons/tb";
import { getNodeIcon } from "../components/Fuse/iconRegistry";
import { useNavigate } from "react-router-dom";

/**
 * Single toggle button for active/inactive workflow state.
 * Initialise isActive from workflow.status and flip it locally on API success.
 */
const ToggleButton = ({ workflowId, isActive, onDone }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (isActive) {
        await deactivateWorkflowAPI(workflowId);
      } else {
        await activateWorkflowAPI(workflowId);
      }
      onDone();
    } catch {
      setLoading(false);
    }
  };

  return isActive ? (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="px-4 py-1.5 rounded-full text-[12px] font-semibold select-none
        bg-red-100 dark:bg-red-900/30
        text-red-600 dark:text-red-400
        hover:bg-red-200 dark:hover:bg-red-800/50
        active:opacity-80 transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Turning Off…" : "Turn Off"}
    </button>
  ) : (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="px-4 py-1.5 rounded-full text-[12px] font-semibold select-none
        bg-emerald-100 dark:bg-emerald-900/30
        text-emerald-700 dark:text-emerald-400
        hover:bg-emerald-200 dark:hover:bg-emerald-800/50
        active:opacity-80 transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Turning On…" : "Turn On"}
    </button>
  );
};

/** Navigate into the studio editor */
const OpenButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-1.5 rounded-full text-[12px] font-semibold select-none
      border border-[#d0d0d0] dark:border-[#3a3a3a]
      text-[#333] dark:text-[#ccc]
      hover:bg-[#f0f0f0] dark:hover:bg-[#2e2e2e]
      active:opacity-80 transition-colors duration-150"
  >
    Open
  </button>
);

const ReviewCard = ({ workflow, onHover, active }) => {
  const navigate = useNavigate();
  return (
    <div
      onMouseEnter={!active ? () => onHover?.(workflow.id) : undefined}
      className={
        active
          ? "bg-[#ffffff] dark:bg-[#262626] py-6 px-6 rounded-3xl flex-1 shadow-md min-w-0 overflow-hidden"
          : "bg-[#ffffff] dark:bg-[#202020] py-6 px-6 rounded-3xl w-[180px] shadow-md overflow-hidden"
      }
    >
      {active ? (
        <div>
          <p className="text-[#1a1a1a] dark:text-white font-sans text-[1.25rem] truncate">
            <span>{workflow.name}</span>
          </p>

          <div className="mt-7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {workflow.nodes.slice(0, 4).map((node) => {
                const Icon = getNodeIcon(node.data.icon);
                return (
                  <div key={node.id} className="flex items-center gap-1">
                    <Icon className="text-[#444444] dark:text-white text-xl" />
                  </div>
                );
              })}
              {workflow.nodes.length > 4 && (
                <span className="text-[#444444] dark:text-white text-xs">
                  +{workflow.nodes.length - 4}
                </span>
              )}
            </div>
            <div>
              {workflow.compiled_graph ? (
                <ToggleButton
                  workflowId={workflow.id}
                  isActive={workflow.status === "active"}
                  onDone={() => navigate(ROUTES.GET_FUSE_STUDIO_URL(workflow.id))}
                />
              ) : (
                <OpenButton
                  onClick={() => navigate(ROUTES.GET_FUSE_STUDIO_URL(workflow.id))}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-[#666666] dark:text-[#d0d0d0] font-sans text-sm line-clamp-2">
            <span>{workflow.name}</span>
          </p>
          <div className="mt-8 flex items-center gap-2">
            {workflow.nodes.slice(0, 4).map((node) => {
              const Icon = getNodeIcon(node.data.icon);
              return (
                <div key={node.id} className="flex items-center gap-1">
                  <Icon className="text-[#555555] dark:text-white text-xl" />
                </div>
              );
            })}
            {workflow.nodes.length > 4 && (
              <span className="text-[#555555] dark:text-white text-xs">
                +{workflow.nodes.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/** Skeleton placeholder shown while discover data is loading */
const ReviewQuicklySkeletons = () => (
  <div className="flex gap-3">
    {/* Active card skeleton — wide */}
    <div className="bg-[#ffffff] dark:bg-[#262626] py-6 px-6 rounded-3xl flex-1 shadow-md min-w-0 overflow-hidden">
      <div className="skeleton h-6 w-3/5 rounded-lg" />
      <div className="mt-7 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton w-5 h-5 rounded-md" />
          ))}
        </div>
        <div className="skeleton h-7 w-20 rounded-full" />
      </div>
    </div>
    {/* Inactive card skeletons — narrow */}
    {[...Array(2)].map((_, i) => (
      <div
        key={i}
        className="bg-[#ffffff] dark:bg-[#202020] py-6 px-6 rounded-3xl w-[180px] shadow-md overflow-hidden"
      >
        <div className="skeleton h-4 w-full rounded-md" />
        <div className="skeleton mt-1 h-4 w-4/5 rounded-md" />
        <div className="mt-8 flex items-center gap-2">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="skeleton w-5 h-5 rounded-md" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

const ReviewQuicklySection = ({ loading, data }) => {
  const [activeWorkflowId, setActiveWorkflowId] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setActiveWorkflowId(data[0].id);
    }
  }, [data]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {loading ? (
        <ReviewQuicklySkeletons />
      ) : (
        <div className="flex gap-3 cursor-pointer">
          {data.map((workflow) => (
            <ReviewCard
              key={workflow.id}
              workflow={workflow}
              active={activeWorkflowId === workflow.id}
              onHover={setActiveWorkflowId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FusePage = () => {
  const { creating, handleCreate } = useCreateWorkflow();
  const [loading, setLoading] = useState(true);
  const [discoverData, setDiscoverData] = useState(null);

  const fetchDiscoverData = async () => {
    setLoading(true);
    try {
      const data = await discoverWorkflowsAPI();
      setDiscoverData(data);
    } catch (error) {
      setDiscoverData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoverData();
  }, []);

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      <Header type="fuse" backRoute={ROUTES.LIBRARY} />
      <div className="flex-1 flex overflow-hidden">
        <FuseStudioSidebar creating={creating} onCreate={handleCreate} />
        <div
          className="flex-1 overflow-y-auto rounded-xl p-4 mb-3 mr-3
            bg-[#f7f7f7] dark:bg-[#1a1a1a]
            border border-[#e5e5e5] dark:border-[#252525]
            shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]"
        >
          <FuseAutomateInput creating={creating} onCreate={handleCreate} />

          <ReviewQuicklySection
            loading={loading}
            data={
              discoverData?.workflows?.items
                ? discoverData.workflows.items.slice(0, 3)
                : []
            }
          />
        </div>
      </div>
    </main>
  );
};

export default FusePage;
