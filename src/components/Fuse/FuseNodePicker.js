import React, { useCallback, useEffect, useState } from "react";
import { TbArrowLeft, TbArrowRight, TbSearch } from "react-icons/tb";
import {
  getNodeCatalogSectionsAPI,
  getNodeCatalogSectionNodesAPI,
  searchNodeCatalogAPI,
} from "../../apis/fuse/queryFunctions";
import useFuseStudioStore from "../../store/useFuseStudioStore";
import FuseNodeIcon, { FUSE_NODE_ICON_SIZES } from "./FuseNodeIcon";
import {
  FUSE_NODE_LABEL_MUTED,
  FUSE_PICKER_LIST_ACCENT,
  FUSE_PICKER_LIST_ROW,
} from "./fuseNodeTheme";

const SEARCH_DEBOUNCE_MS = 280;

const NodePickerSearch = ({ query, onChange, placeholder = "Search nodes..." }) => (
  <div
    className="flex items-center gap-2.5 px-3 py-2.5 rounded-md border border-ink-200 dark:border-void-725
      bg-white dark:bg-void-850 focus-within:ring-2 focus-within:ring-brand-500/30 dark:focus-within:ring-brand-400/25
      focus-within:border-brand-500 dark:focus-within:border-brand-400 transition-[box-shadow,border-color]"
  >
    <TbSearch className={`w-[18px] h-[18px] flex-shrink-0 ${FUSE_NODE_LABEL_MUTED}`} />
    <input
      type="text"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-transparent text-[14px] text-ink-875 dark:text-ink-100
        placeholder:text-ink-600 dark:placeholder:text-ink-450
        outline-none border-none"
    />
  </div>
);

/** n8n-style list row: left hover accent, no bottom border, icon + title + description. */
const PickerListRow = ({
  iconName,
  title,
  description,
  onClick,
  showChevron = false,
  draggable = false,
  onDragStart,
}) => {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className={`${FUSE_PICKER_LIST_ROW}
        ${onClick ? "cursor-pointer border-0 font-inherit bg-transparent" : ""}
        ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <span className={FUSE_PICKER_LIST_ACCENT} aria-hidden />
      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-ink-750 dark:text-ink-200">
        <FuseNodeIcon iconName={iconName} sizeClass={FUSE_NODE_ICON_SIZES.pickerRow} />
      </span>
      <span className="flex-1 min-w-0 pr-2">
        <span className="block text-[14px] font-semibold text-ink-875 dark:text-ink-100 leading-[1.35]">
          {title}
        </span>
        {description ? (
          <span
            className={`block text-[12px] leading-[1.45] mt-1 line-clamp-2 font-normal ${FUSE_NODE_LABEL_MUTED}`}
          >
            {description}
          </span>
        ) : null}
      </span>
      {showChevron ? (
        <TbArrowRight
          className={`w-[18px] h-[18px] flex-shrink-0 ${FUSE_NODE_LABEL_MUTED}
            opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100
            transition-opacity duration-150`}
          aria-hidden
        />
      ) : null}
    </Comp>
  );
};

const PickerSkeleton = () => (
  <div className="flex flex-col">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="h-[76px] px-4 flex items-center">
        <div className="h-full w-full bg-ink-50/80 dark:bg-void-775/60 animate-pulse" />
      </div>
    ))}
  </div>
);

const NodeList = ({ nodes, onPick, isStarter }) => (
  <div className="flex flex-col">
    {nodes.map((node) => {
      const payload = isStarter ? { ...node, isStarter: true } : node;
      const handleDragStart = (e) => {
        e.dataTransfer.setData("application/fuse-node", JSON.stringify(payload));
        e.dataTransfer.effectAllowed = "copy";
      };
      return (
        <PickerListRow
          key={node.type}
          iconName={node.icon}
          title={node.label}
          description={node.description}
          onClick={() => onPick(node)}
          draggable={!isStarter}
          onDragStart={!isStarter ? handleDragStart : undefined}
        />
      );
    })}
  </div>
);

/**
 * n8n-style node picker: category list → lazy nodes per category → search.
 */
export default function FuseNodePicker({
  role,
  onPick,
  isStarter = false,
  title,
  subtitle,
  searchPlaceholder,
}) {
  const mergeListingNodes = useFuseStudioStore((s) => s.mergeListingNodes);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [activeSection, setActiveSection] = useState(null);
  const [sectionNodes, setSectionNodes] = useState([]);
  const [loadingSectionNodes, setLoadingSectionNodes] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoadingSections(true);
    getNodeCatalogSectionsAPI(role)
      .then((data) => {
        if (!cancelled) setSections(data.sections ?? []);
      })
      .catch(() => {
        if (!cancelled) setSections([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSections(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  const openSection = useCallback(
    (section) => {
      setActiveSection(section);
      setLoadingSectionNodes(true);
      setSectionNodes([]);
      getNodeCatalogSectionNodesAPI(role, section.id)
        .then((data) => {
          const nodes = data.nodes ?? [];
          setSectionNodes(nodes);
          mergeListingNodes(nodes);
        })
        .catch(() => setSectionNodes([]))
        .finally(() => setLoadingSectionNodes(false));
    },
    [role, mergeListingNodes],
  );

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setLoadingSearch(false);
      return undefined;
    }

    let cancelled = false;
    setLoadingSearch(true);
    searchNodeCatalogAPI(debouncedQuery, { role, limit: 50 })
      .then((data) => {
        if (cancelled) return;
        const results = data.results ?? [];
        setSearchResults(results);
        mergeListingNodes(results);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingSearch(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, role, mergeListingNodes]);

  const handlePick = (node) => {
    mergeListingNodes([node]);
    onPick(node);
  };

  const isSearchMode = debouncedQuery.length > 0;
  const headerTitle = title ?? (role === "starter" ? "What triggers this workflow?" : "What happens next?");
  const headerSubtitle =
    subtitle ??
    (role === "starter"
      ? "A trigger is a step that starts your workflow."
      : "Choose the next step in your workflow.");

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-void-850">
      <div className="px-4 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-start gap-2 mb-4 min-h-[28px]">
          {activeSection && !isSearchMode ? (
            <button
              type="button"
              onClick={() => {
                setActiveSection(null);
                setSectionNodes([]);
              }}
              className="p-1 -ml-1 mt-0.5 rounded-md text-ink-600 dark:text-ink-450 hover:bg-ink-50 dark:hover:bg-void-775"
              aria-label="Back to categories"
            >
              <TbArrowLeft className="w-5 h-5" />
            </button>
          ) : null}
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] font-semibold text-ink-875 dark:text-ink-100 leading-tight tracking-tight">
              {activeSection && !isSearchMode ? activeSection.label : headerTitle}
            </h2>
            {!activeSection || isSearchMode ? (
              <p className={`text-[13px] mt-1.5 leading-snug ${FUSE_NODE_LABEL_MUTED}`}>
                {headerSubtitle}
              </p>
            ) : activeSection.description ? (
              <p className={`text-[13px] mt-1.5 leading-snug ${FUSE_NODE_LABEL_MUTED}`}>
                {activeSection.description}
              </p>
            ) : null}
          </div>
        </div>
        <NodePickerSearch
          query={query}
          onChange={setQuery}
          placeholder={searchPlaceholder ?? "Search nodes..."}
        />
      </div>

      {/* Full-bleed list so left accent aligns with panel edge (n8n-style). */}
      <div className="flex-1 overflow-y-auto pb-4 min-h-0">
        {isSearchMode ? (
          loadingSearch ? (
            <PickerSkeleton />
          ) : searchResults.length === 0 ? (
            <p className="text-center text-[12px] text-ink-450 dark:text-ink-600 select-none mt-8 px-4">
              No nodes match your search
            </p>
          ) : (
            <NodeList nodes={searchResults} onPick={handlePick} isStarter={isStarter} />
          )
        ) : activeSection ? (
          loadingSectionNodes ? (
            <PickerSkeleton />
          ) : sectionNodes.length === 0 ? (
            <p className="text-center text-[12px] text-ink-450 dark:text-ink-600 select-none mt-8 px-4">
              No nodes in this category
            </p>
          ) : (
            <NodeList nodes={sectionNodes} onPick={handlePick} isStarter={isStarter} />
          )
        ) : loadingSections ? (
          <PickerSkeleton />
        ) : sections.length === 0 ? (
          <p className="text-center text-[12px] text-ink-450 dark:text-ink-600 select-none mt-8 px-4">
            No nodes available
          </p>
        ) : (
          <div className="flex flex-col">
            {sections.map((section) => (
              <PickerListRow
                key={section.id}
                iconName={section.icon}
                title={section.label}
                description={section.description}
                showChevron
                onClick={() => openSection(section)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
