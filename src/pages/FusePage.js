import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";
import "../skeleton.css";
import SectionHeader from "../components/Common/SectionHeader";
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
    <section className="w-full max-w-4xl mx-auto">
      <div className="px-4 md:px-0">
        <SectionHeader title="Review quickly" description="Pick up where you left off" />
      </div>
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
    </section>
  );
};

const RecentFuses = ({ loading, data }) => {
  if (!loading && data.length === 0) return null;

  return (
    <section className="w-full max-w-4xl mx-auto mt-10">
      <div className="px-4 md:px-0">
        <SectionHeader
          title="Your recent fuses"
          description="Workflows you've created or edited recently"
          action={
            <Link
              to={ROUTES.FUSES_LISTING}
              className="flex-shrink-0 inline-flex items-center gap-1 text-[13px] font-medium
                text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              View all
              <LuArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      </div>
      {loading ? (
        <div className="px-4 md:px-0">
          <RecentFusesSkeletons count={6} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 cursor-pointer px-4 md:px-0">
          {data.map((workflow) => (
            <NormalReviewCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </section>
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
        className={`pb-12 md:px-6 transition-all duration-300 ${
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
