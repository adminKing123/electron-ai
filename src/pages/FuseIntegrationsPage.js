import React, { useEffect, useState } from "react";
import { FusePageShell } from "../components/Fuse";
import useCreateWorkflow from "../hooks/useCreateWorkflow";
import ROUTES from "../router/routes";
import { getIntegrationsAPI, revokeIntegrationAPI } from "../apis/fuse/queryFunctions";
import IntegrationsTable, { IntegrationsTableSkeleton } from "../components/Fuse/IntegrationsTable";
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
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
        <h2 className="text-[19px] sm:text-[22px] font-semibold text-black dark:text-white tracking-tight leading-tight mb-5 sm:mb-7">
          Integrations
        </h2>
        {loading ? (
          <IntegrationsTableSkeleton count={4} />
        ) : (
          <IntegrationsTable
            integrations={integrations}
            onRevokeClick={setDeleteTarget}
          />
        )}
      </div>
    </FusePageShell>
  );
};

export default FuseIntegrationsPage;
