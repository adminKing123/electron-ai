import { TbTrash } from "react-icons/tb";
import { LuArrowUpRight } from "react-icons/lu";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import WorkflowEmptyState from "./WorkflowEmptyState";
import {
  FUSE_LIST_TABLE_WRAP,
  FUSE_LIST_TH,
  FUSE_LIST_TD,
  FUSE_LIST_ROW,
  fmtListingTime,
  FuseListingTableFooter,
  FuseListingTableHead,
} from "./fuseListingTable";

// ─── Shared sub-components ────────────────────────────────────────────────────

const DELETE_CLS =
  "w-8 h-8 flex items-center justify-center rounded-lg text-ink-450 dark:text-ink-550 transition-colors duration-150 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed";

const OPEN_CLS =
  "inline-flex items-center gap-1 h-8 px-3 rounded-lg text-[12px] font-semibold " +
  "border border-ink-150 dark:border-ink-750 bg-white dark:bg-ink-800 " +
  "text-ink-750 dark:text-ink-200 hover:border-brand-200 dark:hover:border-brand-900 " +
  "hover:text-brand-700 dark:hover:text-white transition-colors";

const StatusPill = ({ status }) => {
  const active = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
        active
          ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10"
          : "text-ink-550 dark:text-ink-450 bg-ink-100 dark:bg-ink-800"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-ink-400 dark:bg-ink-600"}`} />
      {status}
    </span>
  );
};

const NodeIcons = ({ nodes, max }) => {
  const visible = nodes?.slice(0, max) ?? [];
  const overflow = Math.max(0, (nodes?.length ?? 0) - max);
  if (visible.length === 0) {
    return <span className="text-[12px] text-ink-400 dark:text-ink-600">—</span>;
  }
  return (
    <div className="flex items-center gap-2">
      {visible.map((node) => (
        <FuseNodeIcon key={node.id} iconName={node.data.icon} sizeClass={FUSE_NODE_ICON_SIZES.picker} />
      ))}
      {overflow > 0 && (
        <span className="text-[12px] font-semibold text-ink-500 dark:text-ink-450">+{overflow}</span>
      )}
    </div>
  );
};

const DeleteButton = ({ isDeleting, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isDeleting}
    title="Delete workflow"
    className={DELETE_CLS}
  >
    <TbTrash className="w-[15px] h-[15px]" />
  </button>
);

// ─── Mobile card row ──────────────────────────────────────────────────────────

const WorkflowListItem = ({ workflow, isDeleting, onEdit, onDelete, isLast }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3.5
      ${!isLast ? "border-b border-ink-100 dark:border-ink-800" : ""}`}
  >
    <button
      type="button"
      onClick={() => onEdit(workflow)}
      className="flex-1 min-w-0 text-left"
    >
      <p className="text-[14px] font-semibold text-ink-975 dark:text-white truncate">
        {workflow.name}
      </p>
      <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
        <StatusPill status={workflow.status} />
        <NodeIcons nodes={workflow.nodes} max={4} />
      </div>
    </button>
    <DeleteButton isDeleting={isDeleting} onClick={() => onDelete(workflow)} />
  </div>
);

// ─── Desktop table row ────────────────────────────────────────────────────────

const WorkflowRow = ({ workflow, isDeleting, onEdit, onDelete }) => {
  const open = () => onEdit(workflow);

  return (
    <tr className={`${FUSE_LIST_ROW} group`}>
      <td className={FUSE_LIST_TD}>
        <button type="button" onClick={open} className="min-w-0 text-left">
          <span
            className="text-[14px] font-semibold text-ink-975 dark:text-white truncate max-w-[320px]
              group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors"
          >
            {workflow.name}
          </span>
        </button>
      </td>
      <td className={FUSE_LIST_TD}>
        <NodeIcons nodes={workflow.nodes} max={5} />
      </td>
      <td className={`${FUSE_LIST_TD} text-ink-550 dark:text-ink-500 tabular-nums whitespace-nowrap`}>
        {fmtListingTime(workflow.updated_at)}
      </td>
      <td className={FUSE_LIST_TD}>
        <StatusPill status={workflow.status} />
      </td>
      <td className={`${FUSE_LIST_TD} text-right`}>
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" onClick={open} className={OPEN_CLS}>
            Open
            <LuArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <DeleteButton isDeleting={isDeleting} onClick={() => onDelete(workflow)} />
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
      <table className="w-full min-w-[640px] border-collapse">
        <FuseListingTableHead>
          <th className={FUSE_LIST_TH}>Name</th>
          <th className={`${FUSE_LIST_TH} w-[200px]`}>Steps</th>
          <th className={`${FUSE_LIST_TH} w-[140px]`}>Last updated</th>
          <th className={`${FUSE_LIST_TH} w-[120px]`}>Status</th>
          <th className={`${FUSE_LIST_TH} w-[130px]`} />
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
