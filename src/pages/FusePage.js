import { FuseStudioSidebar } from "../components/Fuse";
import Header from "../components/Header";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import ROUTES from "../router/routes";

const FusePage = () => {
  const { creating, handleCreate } = useCreateWorkflow();

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
        ></div>
      </div>
    </main>
  );
};

export default FusePage;
