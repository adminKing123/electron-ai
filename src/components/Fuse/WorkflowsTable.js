import { TbEdit, TbTrash } from "react-icons/tb";
import WorkflowEmptyState from "./WorkflowEmptyState";

const fmtDate = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const TH =
  "px-3 sm:px-5 py-3.5 text-left text-[11px] font-semibold text-[#aaa] dark:text-[#555] uppercase tracking-widest whitespace-nowrap";
const TD = "px-3 sm:px-5 py-4 text-[13px] text-[#555] dark:text-[#999] whitespace-nowrap";

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
    <Icon className="w-[16px] h-[16px]" />
  </button>
);

const StatusBadge = ({ status }) => {
  const isActive = status === "active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold select-none
        ${
          isActive
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-[#f0f0f0] text-[#999] dark:bg-[#222] dark:text-[#555]"
        }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0
          ${isActive ? "bg-emerald-500" : "bg-[#ccc] dark:bg-[#444]"}`}
      />
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

const WorkflowRow = ({ workflow, isDeleting, onEdit, onDelete, isLast }) => (
  <tr
    className={`group transition-colors duration-100
      hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]
      ${!isLast ? "border-b border-[#f0f0f0] dark:border-[#1d1d1d]" : ""}`}
  >
    <td className={`${TD} font-medium text-[#111] dark:text-white max-w-[140px] sm:max-w-none truncate`}>
      {workflow.name}
    </td>
    <td className={TD}>
      <StatusBadge status={workflow.status} />
    </td>
    <td className={`${TD} hidden sm:table-cell`}>{fmtDate(workflow.created_at)}</td>
    <td className={`${TD} hidden sm:table-cell`}>{fmtDate(workflow.updated_at)}</td>
    <td className={`${TD} text-right`}>
      <div className="flex items-center justify-end gap-0.5">
        <ActionBtn
          icon={TbEdit}
          title="Edit workflow"
          onClick={() => onEdit(workflow)}
          hoverCls="hover:text-[#111] dark:hover:text-white hover:bg-[#ebebeb] dark:hover:bg-[#242424]"
        />
        <ActionBtn
          icon={TbTrash}
          title="Delete workflow"
          onClick={() => onDelete(workflow)}
          disabled={isDeleting}
          hoverCls="hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/8 dark:hover:bg-red-500/10"
        />
      </div>
    </td>
  </tr>
);

const WorkflowsTable = ({ workflows, deletingId, onEdit, onDelete }) => (
  <div className="overflow-x-auto rounded-2xl border border-[#ebebeb] dark:border-[#232323] bg-white dark:bg-[#1a1a1a]">
    <table className="w-full min-w-[320px] border-collapse">
      <thead>
        <tr className="border-b border-[#ebebeb] dark:border-[#232323] bg-[#fafafa] dark:bg-[#161616]">
          <th className={TH}>Name</th>
          <th className={TH}>Status</th>
          <th className={`${TH} hidden sm:table-cell`}>Created At</th>
          <th className={`${TH} hidden sm:table-cell`}>Updated At</th>
          <th className={`${TH} text-right`}></th>
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
);

export default WorkflowsTable;
