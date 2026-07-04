import { useEffect, useState } from "react";
import "../skeleton.css";
import {
  FusePageShell,
  FuseAutomateInput,
  ReviewCard,
  ReviewQuicklySkeletons,
  NormalReviewCard,
  RecentFusesSkeletons,
} from "../components/Fuse";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import ROUTES from "../router/routes";
import { discoverWorkflowsAPI } from "../apis/fuse/queryFunctions";

/**
 * ReviewQuicklySection — renders the discover carousel or its skeleton.
 * On mobile: horizontal snap-scroll carousel (all cards visible, swipeable).
 * On desktop: the original expand-on-hover flex layout.
 */
const ReviewQuicklySection = ({ loading, data }) => {
  const [activeWorkflowId, setActiveWorkflowId] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setActiveWorkflowId(data[0].id);
    }
  }, [data]);

  if (!loading && data.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h2 className="text-xs font-semibold text-[#333] dark:text-[#ccc] mb-2 px-4 md:px-0">
        Review Quickly
      </h2>
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory px-4 md:px-0">
          <ReviewQuicklySkeletons />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory px-4 md:px-0 md:overflow-visible">
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

const RecentFuses = ({ loading, data }) => {
  if (!loading && data.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-10">
      <h2 className="text-xs font-semibold text-[#333] dark:text-[#ccc] mb-2 px-4 md:px-0">
        Your Recent Fuses
      </h2>
      {loading ? (
        <div className="px-4 md:px-0">
          <RecentFusesSkeletons count={6} />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 cursor-pointer px-4 md:px-0">
          {data.map((workflow) => (
            <NormalReviewCard key={workflow.id} workflow={workflow} />
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
  const [promptExpanded, setPromptExpanded] = useState(false);

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
    <FusePageShell backRoute={ROUTES.LIBRARY} creating={creating} onCreate={handleCreate}>
      <FuseAutomateInput
        creating={creating}
        onCreate={handleCreate}
        onExpandedChange={setPromptExpanded}
      />

      <div
        className={`pb-6 transition-all duration-300 ${
          promptExpanded
            ? "opacity-25 dark:opacity-20 blur-[2px] pointer-events-none select-none"
            : ""
        }`}
      >
        <ReviewQuicklySection
          loading={loading}
          data={
            discoverData?.workflows?.items
              ? discoverData.workflows.items.slice(0, 3)
              : []
          }
        />
        <RecentFuses
          loading={loading}
          data={
            discoverData?.workflows?.items
              ? discoverData.workflows.items.slice(3)
              : []
          }
        />
      </div>
    </FusePageShell>
  );
};

export default FusePage;
