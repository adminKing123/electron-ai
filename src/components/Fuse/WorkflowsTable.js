import { TbTrash } from "react-icons/tb";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import WorkflowEmptyState from "./WorkflowEmptyState";
import {
  FUSE_LIST_TABLE_WRAP,
  FUSE_LIST_TH,
  FUSE_LIST_TD,
  FUSE_LIST_ROW,
  FUSE_LIST_LINK,
  fmtListingTime,
  FuseListingStatusDot,
  FuseListingViewLink,
  FuseListingTableFooter,
  FuseListingTableHead,
} from "./fuseListingTable";

// ─── Shared sub-components ────────────────────────────────────────────────────

const DELETE_CLS =
  "w-8 h-8 flex items-center justify-center rounded-lg text-[#bbb] dark:text-[#555] transition-colors duration-150 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/8 dark:hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed";

// ─── Mobile card row ──────────────────────────────────────────────────────────

const WorkflowListItem = ({ workflow, isDeleting, onEdit, onDelete, isLast }) => {
  const visibleNodes = workflow.nodes?.slice(0, 4) ?? [];
  const overflow = Math.max(0, (workflow.nodes?.length ?? 0) - 4);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5
        ${!isLast ? "border-b border-[#eef0f2] dark:border-[#252525]" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <button
          type="button"
          onClick={() => onEdit(workflow)}
          className={`${FUSE_LIST_LINK} font-semibold truncate block text-left max-w-full`}
        >
          {workflow.name}
        </button>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <FuseListingStatusDot status={workflow.status === "active" ? "active" : "inactive"} />
          <span className="text-[11px] text-[#9ca3af] dark:text-[#666] capitalize">{workflow.status}</span>
          {visibleNodes.length > 0 && (
            <div className="flex items-center gap-1.5">
              {visibleNodes.map((node) => (
                <FuseNodeIcon
                  key={node.id}
                  iconName={node.data.icon}
                  sizeClass={FUSE_NODE_ICON_SIZES.picker}
                />
              ))}
              {overflow > 0 && <span className="text-[10px] text-[#aaa] dark:text-[#555]">+{overflow}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <FuseListingViewLink onClick={() => onEdit(workflow)} />
        <button
          type="button"
          onClick={() => onDelete(workflow)}
          disabled={isDeleting}
          title="Delete workflow"
          className={DELETE_CLS}
        >
          <TbTrash className="w-[15px] h-[15px]" />
        </button>
      </div>
    </div>
  );
};

// ─── Desktop table row ────────────────────────────────────────────────────────

const WorkflowRow = ({ workflow, isDeleting, onEdit, onDelete }) => {
  const visibleNodes = workflow.nodes?.slice(0, 5) ?? [];
  const overflow = Math.max(0, (workflow.nodes?.length ?? 0) - 5);
  const open = () => onEdit(workflow);

  return (
    <tr className={FUSE_LIST_ROW}>
      <td className={FUSE_LIST_TD}>
        <button type="button" className={`${FUSE_LIST_LINK} font-semibold`} onClick={open}>
          {workflow.name}
        </button>
      </td>
      <td className={`${FUSE_LIST_TD} text-[#6b7280] dark:text-[#888] tabular-nums whitespace-nowrap hidden sm:table-cell`}>
        {fmtListingTime(workflow.updated_at)}
      </td>
      <td className={`${FUSE_LIST_TD} hidden md:table-cell`}>
        <div className="flex items-center gap-2">
          {visibleNodes.map((node) => (
            <FuseNodeIcon
              key={node.id}
              iconName={node.data.icon}
              sizeClass={FUSE_NODE_ICON_SIZES.config}
            />
          ))}
          {overflow > 0 && <span className="text-[11px] text-[#aaa] dark:text-[#555]">+{overflow}</span>}
        </div>
      </td>
      <td className={`${FUSE_LIST_TD} text-right`}>
        <div className="flex justify-end">
          <FuseListingStatusDot status={workflow.status === "active" ? "active" : "inactive"} />
        </div>
      </td>
      <td className={`${FUSE_LIST_TD} text-right`}>
        <div className="flex items-center justify-end gap-2">
          <FuseListingViewLink onClick={open} />
          <button
            type="button"
            onClick={() => onDelete(workflow)}
            disabled={isDeleting}
            title="Delete workflow"
            className={DELETE_CLS}
          >
            <TbTrash className="w-[15px] h-[15px]" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ─── WorkflowsTable ───────────────────────────────────────────────────────────

const WorkflowsTable = ({
  workflows,
  deletingId,
  onEdit,
  onDelete,
  page = 0,
  hasNextPage = false,
  onPrevPage,
  onNextPage,
}) => (
  <div className={FUSE_LIST_TABLE_WRAP}>
    {/* Mobile — card list */}
    <div className="md:hidden">
      {workflows.length === 0 ? (
        <WorkflowEmptyState />
      ) : (
        workflows.map((wf, idx) => (
          <WorkflowListItem
            key={wf.id}
            workflow={wf}
            isDeleting={deletingId === wf.id}
            onEdit={onEdit}
            onDelete={onDelete}
            isLast={idx === workflows.length - 1}
          />
        ))
      )}
    </div>

    {/* Desktop — full table */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <FuseListingTableHead>
          <th className={FUSE_LIST_TH}>Name</th>
          <th className={`${FUSE_LIST_TH} hidden sm:table-cell`}>Time</th>
          <th className={`${FUSE_LIST_TH} hidden md:table-cell`}>Nodes</th>
          <th className={`${FUSE_LIST_TH} text-right`}>Status</th>
          <th className={`${FUSE_LIST_TH} text-right w-[120px]`} />
        </FuseListingTableHead>
        <tbody>
          {workflows.length === 0 ? (
            <tr>
              <td colSpan={5}>
                <WorkflowEmptyState />
              </td>
            </tr>
          ) : (
            workflows.map((wf) => (
              <WorkflowRow
                key={wf.id}
                workflow={wf}
                isDeleting={deletingId === wf.id}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>

    {(workflows.length > 0 || page > 0 || hasNextPage) && (
      <FuseListingTableFooter
        count={workflows.length}
        singular="fuse"
        plural="fuses"
        page={page}
        hasNextPage={hasNextPage}
        onPrev={onPrevPage}
        onNext={onNextPage}
      />
    )}
  </div>
);

export default WorkflowsTable;
