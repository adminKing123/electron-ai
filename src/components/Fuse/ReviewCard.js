import { Link, useNavigate } from "react-router-dom";
import { LuArrowUpRight } from "react-icons/lu";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import ROUTES from "../../router/routes";
import FuseWorkflowToggle from "./FuseWorkflowToggle";

const CARD_BASE =
  "rounded-2xl border border-ink-150 dark:border-void-800 bg-white dark:bg-void-825 overflow-hidden";

const CARD_HOVER =
  "hover:border-brand-200 dark:hover:border-brand-900 hover:shadow-[0_4px_20px_-8px_rgba(124,58,237,0.25)]";

// --- Action Buttons -----------------------------------------------------------

const OpenButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1 h-8 px-3.5 rounded-xl text-[12px] font-semibold select-none
      border border-ink-150 dark:border-void-750
      bg-white dark:bg-void-800
      text-ink-750 dark:text-ink-200
      hover:bg-ink-50 dark:hover:bg-void-775
      active:opacity-80 transition-colors duration-150"
  >
    Open
    <LuArrowUpRight className="w-3.5 h-3.5" />
  </button>
);

// --- Status badge -------------------------------------------------------------

const StatusBadge = ({ workflow }) => {
  const [label, cls, dot] = workflow.compiled_graph
    ? workflow.status === "active"
      ? ["Active", "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10", "bg-emerald-500"]
      : ["Inactive", "text-red-600 dark:text-red-400 bg-red-500/10", "bg-red-500"]
    : ["Draft", "text-ink-550 dark:text-ink-450 bg-ink-100 dark:bg-void-800", "bg-ink-450"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

// --- Node icons strip — shared by both card states ----------------------------

const NodeIcons = ({ nodes, overflowCls }) => {
  const visible = nodes.slice(0, 4);
  const overflow = nodes.length - 4;
  return (
    <div className="flex items-center gap-2.5">
      {visible.map((node) => (
        <FuseNodeIcon
          key={node.id}
          iconName={node.data.icon}
          sizeClass={FUSE_NODE_ICON_SIZES.picker}
        />
      ))}
      {overflow > 0 && <span className={overflowCls}>+{overflow}</span>}
    </div>
  );
};

const OVERFLOW_CLS = "text-[12px] font-semibold text-ink-550 dark:text-ink-400";

// --- Skeleton -----------------------------------------------------------------

const IconSkeletons = () => (
  <div className="flex items-center gap-2.5">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="skeleton w-5 h-5 rounded-md" />
    ))}
  </div>
);

export const ReviewQuicklySkeletons = () => (
  <div className="flex gap-3 w-full">
    <div
      className={`${CARD_BASE} p-5 h-[148px] flex flex-col justify-between
        flex-none snap-start w-[80vw] md:w-auto md:flex-[3]`}
    >
      <div className="skeleton h-5 w-3/5 rounded-lg" />
      <div className="flex items-center justify-between">
        <IconSkeletons />
        <div className="skeleton h-8 w-20 rounded-xl" />
      </div>
    </div>

    {[...Array(2)].map((_, i) => (
      <div
        key={i}
        className={`${CARD_BASE} p-5 h-[148px] flex flex-col justify-between
          flex-none snap-start w-[65vw] md:w-auto md:flex-[1]`}
      >
        <div>
          <div className="skeleton h-4 w-full rounded-md" />
          <div className="skeleton mt-1.5 h-4 w-4/5 rounded-md" />
        </div>
        <IconSkeletons />
      </div>
    ))}
  </div>
);

// --- ReviewCard ---------------------------------------------------------------

const ReviewCard = ({ workflow, onHover, active }) => {
  const navigate = useNavigate();

  return (
    <div
      className={`${CARD_BASE} ${CARD_HOVER} p-5 h-[148px]
        transition-all duration-300 flex-none snap-start cursor-pointer
        ${
          active
            ? "w-[80vw] md:w-auto md:flex-[3] !border-brand-200 dark:!border-brand-900 !bg-brand-50/60 dark:!bg-brand-950/30"
            : "w-[65vw] md:w-auto md:flex-[1]"
        }`}
      onMouseEnter={!active ? () => onHover?.(workflow.id) : undefined}
      onClick={() => navigate(ROUTES.GET_FUSE_STUDIO_URL(workflow.id))}
    >
      {active ? (
        <div className="h-full flex flex-col justify-between">
          <div className="min-w-0">
            <p className="text-ink-975 dark:text-white font-semibold text-[17px] tracking-tight truncate">
              {workflow.name}
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <NodeIcons nodes={workflow.nodes} overflowCls={OVERFLOW_CLS} />
            <div onClick={(e) => e.stopPropagation()}>
              {workflow.compiled_graph ? (
                <FuseWorkflowToggle
                  workflowId={workflow.id}
                  isActive={workflow.status === "active"}
                  onDone={() => navigate(ROUTES.GET_FUSE_STUDIO_URL(workflow.id))}
                />
              ) : (
                <OpenButton
                  onClick={() => navigate(ROUTES.GET_FUSE_STUDIO_URL(workflow.id))}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col justify-between">
          <p className="text-ink-750 dark:text-ink-200 font-medium text-[13px] leading-snug line-clamp-2">
            {workflow.name}
          </p>
          <NodeIcons nodes={workflow.nodes} overflowCls={OVERFLOW_CLS} />
        </div>
      )}
    </div>
  );
};

// --- Recent Fuses Skeleton ---------------------------------------------------

export const RecentFusesSkeletons = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className={`${CARD_BASE} p-4`}>
        <div className="h-[40px]">
          <div className="skeleton h-4 w-full rounded-md" />
          <div className="skeleton mt-1.5 h-4 w-3/5 rounded-md" />
        </div>
        <div className="mt-5 pt-3.5 border-t border-ink-100 dark:border-void-800 flex justify-between items-center">
          <IconSkeletons />
          <div className="skeleton h-5 w-14 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

// --- NormalReviewCard ---------------------------------------------------------

export const NormalReviewCard = ({ workflow }) => (
  <Link
    to={ROUTES.GET_FUSE_STUDIO_URL(workflow.id)}
    className={`group ${CARD_BASE} ${CARD_HOVER} p-4 block transition-all duration-200`}
  >
    <div className="h-[40px] flex items-start justify-between gap-2">
      <p className="text-ink-875 dark:text-ink-100 font-medium text-[13px] leading-snug line-clamp-2">
        {workflow.name}
      </p>
      <LuArrowUpRight
        className="w-4 h-4 flex-shrink-0 text-ink-300 dark:text-ink-650
          group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors"
      />
    </div>
    <div className="mt-5 pt-3.5 border-t border-ink-100 dark:border-void-800 flex justify-between items-center gap-2">
      <NodeIcons nodes={workflow.nodes} overflowCls={OVERFLOW_CLS} />
      <StatusBadge workflow={workflow} />
    </div>
  </Link>
);

export default ReviewCard;
