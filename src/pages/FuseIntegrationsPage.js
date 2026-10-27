import React, { useEffect, useState } from "react";
import { FusePageShell } from "../components/Fuse";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import ROUTES from "../router/routes";
import { getIntegrationsAPI, revokeIntegrationAPI } from "../apis/fuse/queryFunctions";
import IntegrationsTable from "../components/Fuse/IntegrationCard";
import ConfirmDialog from "../components/Common/ConfirmDialog";
import MasterInfoModal from "../components/Fuse/MasterInfoModal";

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
    <FusePageShell
      backRoute={ROUTES.FUSE}
      creating={creating}
      onCreate={handleCreate}
      dialog={
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
      }
      footer={<MasterInfoModal />}
    >
      <div className="max-w-[1080px] mx-auto px-4 pt-6 pb-12 sm:px-8 sm:pt-10">
        <div className="pb-6 mb-6 border-b border-ink-100 dark:border-ink-800">
          <h1 className="text-[24px] md:text-[28px] font-bold tracking-tight text-ink-975 dark:text-white leading-tight">
            Integrations
          </h1>
          <p className="text-[14px] text-ink-500 dark:text-ink-500 mt-1">
            Connect accounts used by workflow steps.
          </p>
        </div>
        <IntegrationsTable
          loading={loading}
          integrations={integrations}
          onRevokeClick={setDeleteTarget}
        />
      </div>
    </FusePageShell>
  );
};

export default FuseIntegrationsPage;
