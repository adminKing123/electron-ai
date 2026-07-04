import { TbEdit, TbTrash } from "react-icons/tb";
import { getNodeIcon } from "./iconRegistry";
import WorkflowEmptyState from "./WorkflowEmptyState";

/** Short date — e.g. "Jun 12, 2026" */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// ─── Shared sub-components ────────────────────────────────────────────────────

const ActionBtn = ({ icon: Icon, title, onClick, disabled, hoverCls }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`w-8 h-8 flex items-center justify-center rounded-lg
      text-[#bbb] dark:text-[#555]
      transition-colors duration-150
      disabled:opacity-40 disabled:cursor-not-allowed
      ${hoverCls}`}
  >
    <Icon className="w-[15px] h-[15px]" />
  </button>
);

const StatusBadge = ({ status }) => {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold select-none
        ${
          isActive
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-[#f0f0f0] text-[#999] dark:bg-[#252525] dark:text-[#555]"
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? "bg-emerald-500" : "bg-[#ccc] dark:bg-[#444]"}`} />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

const EDIT_CLS = "hover:text-[#111] dark:hover:text-white hover:bg-[#ebebeb] dark:hover:bg-[#2a2a2a]";
const DELETE_CLS = "hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/8 dark:hover:bg-red-500/10";

// ─── Mobile card row ──────────────────────────────────────────────────────────

const WorkflowListItem = ({ workflow, isDeleting, onEdit, onDelete, isLast }) => {
  const visibleNodes = workflow.nodes?.slice(0, 4) ?? [];
  const overflow = Math.max(0, (workflow.nodes?.length ?? 0) - 4);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5
        ${!isLast ? "border-b border-[#f0f0f0] dark:border-[#212121]" : ""}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[#111] dark:text-white truncate">
          {workflow.name}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <StatusBadge status={workflow.status} />
          {visibleNodes.length > 0 && (
            <div className="flex items-center gap-1.5">
              {visibleNodes.map((node) => {
                const Icon = getNodeIcon(node.data.icon);
                return <Icon key={node.id} className="text-[#888] dark:text-[#666] text-[15px] flex-shrink-0" />;
              })}
              {overflow > 0 && <span className="text-[10px] text-[#aaa] dark:text-[#555]">+{overflow}</span>}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <ActionBtn icon={TbEdit} title="Edit workflow" onClick={() => onEdit(workflow)} hoverCls={EDIT_CLS} />
        <ActionBtn icon={TbTrash} title="Delete workflow" onClick={() => onDelete(workflow)} disabled={isDeleting} hoverCls={DELETE_CLS} />
      </div>
    </div>
  );
};

// ─── Desktop table row ────────────────────────────────────────────────────────

const TH = "px-4 py-3 text-left text-[11px] font-semibold text-[#aaa] dark:text-[#555] uppercase tracking-widest whitespace-nowrap";
const TD = "px-4 py-3.5 text-[13px] text-[#555] dark:text-[#999] whitespace-nowrap";

const WorkflowRow = ({ workflow, isDeleting, onEdit, onDelete, isLast }) => {
  const visibleNodes = workflow.nodes?.slice(0, 5) ?? [];
  const overflow = Math.max(0, (workflow.nodes?.length ?? 0) - 5);

  return (
    <tr
      className={`transition-colors duration-100
        hover:bg-[#fafafa] dark:hover:bg-[#1f1f1f]
        ${!isLast ? "border-b border-[#f0f0f0] dark:border-[#212121]" : ""}`}
    >
      <td className={`${TD} font-medium text-[#111] dark:text-white max-w-[200px] truncate`}>{workflow.name}</td>
      <td className={TD}><StatusBadge status={workflow.status} /></td>
      <td className={`${TD} hidden sm:table-cell`}>
        <div className="flex items-center gap-2">
          {visibleNodes.map((node) => {
            const Icon = getNodeIcon(node.data.icon);
            return <Icon key={node.id} className="text-[#888] dark:text-[#666] text-[17px] flex-shrink-0" />;
          })}
          {overflow > 0 && <span className="text-[11px] text-[#aaa] dark:text-[#555]">+{overflow}</span>}
        </div>
      </td>
      <td className={`${TD} hidden md:table-cell text-[#aaa] dark:text-[#555]`}>{fmtDate(workflow.updated_at)}</td>
      <td className={`${TD} text-right`}>
        <div className="flex items-center justify-end gap-0.5">
          <ActionBtn icon={TbEdit} title="Edit workflow" onClick={() => onEdit(workflow)} hoverCls={EDIT_CLS} />
          <ActionBtn icon={TbTrash} title="Delete workflow" onClick={() => onDelete(workflow)} disabled={isDeleting} hoverCls={DELETE_CLS} />
        </div>
      </td>
    </tr>
  );
};

// ─── WorkflowsTable ───────────────────────────────────────────────────────────

const WorkflowsTable = ({ workflows, deletingId, onEdit, onDelete }) => (
  <div className="rounded-2xl border border-[#ebebeb] dark:border-[#232323] bg-white dark:bg-[#1a1a1a]">
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
      <table className="w-full min-w-[420px] border-collapse">
        <thead>
          <tr className="border-b border-[#ebebeb] dark:border-[#232323] bg-[#fafafa] dark:bg-[#161616]">
            <th className={TH}>Name</th>
            <th className={TH}>Status</th>
            <th className={`${TH} hidden sm:table-cell`}>Nodes</th>
            <th className={`${TH} hidden md:table-cell`}>Updated</th>
            <th className={`${TH} text-right`} />
          </tr>
        </thead>
        <tbody>
          {workflows.length === 0 ? (
            <WorkflowEmptyState />
          ) : (
            workflows.map((wf, idx) => (
              <WorkflowRow
                key={wf.id}
                workflow={wf}
                isDeleting={deletingId === wf.id}
                onEdit={onEdit}
                onDelete={onDelete}
                isLast={idx === workflows.length - 1}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default WorkflowsTable;
