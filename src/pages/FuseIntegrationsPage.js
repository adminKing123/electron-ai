import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { FuseStudioSidebar } from "../components/Fuse";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import ROUTES from "../router/routes";
import { getIntegrationsAPI, revokeIntegrationAPI } from "../apis/fuse/queryFunctions";
import IntegrationCard from "../components/Fuse/IntegrationCard";
import ConfirmDialog from "../components/Common/ConfirmDialog";

const FuseIntegrationsPage = () => {
  const { creating, handleCreate } = useCreateWorkflow();
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [revoking, setRevoking] = useState(false);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const data = await getIntegrationsAPI();
      setIntegrations(data || []);
    } catch (error) {
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleRevokeConfirm = async () => {
    if (!deleteTarget) return;
    setRevoking(true);
    try {
      await revokeIntegrationAPI(deleteTarget.id);
      fetchIntegrations();
    } catch (error) {
      console.error("Failed to revoke integration", error);
    } finally {
      setRevoking(false);
      setDeleteTarget(null);
    }
  };

  return (
    <main className="h-screen flex flex-col overflow-hidden bg-[#ffffff] dark:bg-[#212121]">
      <Header type="fuse" backRoute={ROUTES.FUSE} />
      
      <ConfirmDialog
        open={!!deleteTarget}
        title="Revoke Integration"
        message={`Are you sure you want to revoke access to ${deleteTarget?.name}? You will need to configure it again to use it in workflows.`}
        confirmLabel="Revoke Access"
        variant="danger"
        loading={revoking}
        onConfirm={handleRevokeConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <div className="flex-1 flex overflow-hidden">
        <FuseStudioSidebar creating={creating} onCreate={handleCreate} />
        <div
          className="flex-1 overflow-y-auto rounded-xl p-4 mb-3 mr-3
            bg-[#f7f7f7] dark:bg-[#1a1a1a]
            border border-[#e5e5e5] dark:border-[#252525]
            shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]"
        >
          <div className="max-w-5xl mx-auto px-3 py-6 sm:px-6 sm:py-10">
            <h2 className="text-[19px] sm:text-[22px] font-semibold text-black dark:text-white tracking-tight leading-tight mb-5 sm:mb-7">
              Integrations
            </h2>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-[#ffffff] dark:bg-[#202020] p-6 rounded-3xl shadow-sm border border-[#e5e5e5] dark:border-[#2a2a2a] flex flex-col justify-between aspect-square min-w-0">
                    <div className="flex flex-col items-start gap-4 w-full">
                      <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
                      <div className="w-full">
                        <div className="skeleton h-5 w-2/3 rounded-md" />
                        <div className="skeleton mt-2 h-4 w-full rounded-md" />
                        <div className="skeleton mt-1 h-4 w-4/5 rounded-md" />
                      </div>
                    </div>
                    <div className="skeleton w-20 h-6 rounded-full mt-4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((integration) => (
                  <IntegrationCard 
                    key={integration.id} 
                    integration={integration} 
                    onRevokeClick={() => setDeleteTarget(integration)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default FuseIntegrationsPage;
