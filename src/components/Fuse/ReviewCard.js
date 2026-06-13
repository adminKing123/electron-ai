import { useNavigate } from "react-router-dom";
import { getNodeIcon } from "./iconRegistry";
import ROUTES from "../../router/routes";
import FuseWorkflowToggle from "./FuseWorkflowToggle";

// ─── Action Buttons ───────────────────────────────────────────────────────────

/** OpenButton — navigates into the Studio editor to build the workflow. */
const OpenButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-1.5 rounded-full text-[12px] font-semibold select-none
      border border-[#d0d0d0] dark:border-[#3a3a3a]
      text-[#333] dark:text-[#ccc]
      hover:bg-[#f0f0f0] dark:hover:bg-[#2e2e2e]
      active:opacity-80 transition-colors duration-150"
  >
    Open
  </button>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/** Skeleton placeholder shown while discover data is loading. */
export const ReviewQuicklySkeletons = () => (
  <div className="flex gap-3">
    {/* Active card skeleton — wide */}
    <div className="bg-[#ffffff] dark:bg-[#262626] py-6 px-6 rounded-3xl flex-1 shadow-md min-w-0 overflow-hidden">
      <div className="skeleton h-6 w-3/5 rounded-lg" />
      <div className="mt-7 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton w-5 h-5 rounded-md" />
          ))}
        </div>
        <div className="skeleton h-7 w-20 rounded-full" />
      </div>
    </div>
    {/* Inactive card skeletons — narrow */}
    {[...Array(2)].map((_, i) => (
      <div
        key={i}
        className="bg-[#ffffff] dark:bg-[#202020] py-6 px-6 rounded-3xl w-[180px] shadow-md overflow-hidden"
      >
        <div className="skeleton h-4 w-full rounded-md" />
        <div className="skeleton mt-1 h-4 w-4/5 rounded-md" />
        <div className="mt-8 flex items-center gap-2">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="skeleton w-5 h-5 rounded-md" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ─── ReviewCard ───────────────────────────────────────────────────────────────

/**
 * ReviewCard — displays a workflow in the "Review Quickly" section of FusePage.
 *
 * Active card: shows name, node icons, and a toggle / open action button.
 * Inactive card: shows a compact name + icon strip; expands on hover.
 *
 * @param {object}   props
 * @param {object}   props.workflow    — workflow document from the API
 * @param {boolean}  props.active      — whether this card is the expanded one
 * @param {Function} props.onHover     — called with workflow.id on mouse-enter
 */
const ReviewCard = ({ workflow, onHover, active }) => {
  const navigate = useNavigate();

  return (
    <div
      onMouseEnter={!active ? () => onHover?.(workflow.id) : undefined}
      className={
        active
          ? "bg-[#ffffff] dark:bg-[#262626] py-6 px-6 rounded-3xl flex-1 shadow-md min-w-0 overflow-hidden"
          : "bg-[#ffffff] dark:bg-[#202020] py-6 px-6 rounded-3xl w-[180px] shadow-md overflow-hidden"
      }
    >
      {active ? (
        <div>
          <p className="text-[#1a1a1a] dark:text-white font-sans text-[1.25rem] truncate">
            {workflow.name}
          </p>

          <div className="mt-7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {workflow.nodes.slice(0, 4).map((node) => {
                const Icon = getNodeIcon(node.data.icon);
                return (
                  <div key={node.id} className="flex items-center gap-1">
                    <Icon className="text-[#444444] dark:text-white text-xl" />
                  </div>
                );
              })}
              {workflow.nodes.length > 4 && (
                <span className="text-[#444444] dark:text-white text-xs">
                  +{workflow.nodes.length - 4}
                </span>
              )}
            </div>

            <div>
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
        <div>
          <p className="text-[#666666] dark:text-[#d0d0d0] font-sans text-sm line-clamp-2">
            {workflow.name}
          </p>
          <div className="mt-8 flex items-center gap-2">
            {workflow.nodes.slice(0, 4).map((node) => {
              const Icon = getNodeIcon(node.data.icon);
              return (
                <div key={node.id} className="flex items-center gap-1">
                  <Icon className="text-[#555555] dark:text-white text-xl" />
                </div>
              );
            })}
            {workflow.nodes.length > 4 && (
              <span className="text-[#555555] dark:text-white text-xs">
                +{workflow.nodes.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
