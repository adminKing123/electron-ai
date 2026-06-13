import { useEffect, useState } from "react";
import "../skeleton.css";
import {
  FuseStudioSidebar,
  FuseAutomateInput,
  ReviewCard,
  ReviewQuicklySkeletons,
} from "../components/Fuse";
import Header from "../components/Header";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import ROUTES from "../router/routes";
import { discoverWorkflowsAPI } from "../apis/fuse/queryFunctions";

/**
 * ReviewQuicklySection — renders the discover carousel or its skeleton.
 */
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
