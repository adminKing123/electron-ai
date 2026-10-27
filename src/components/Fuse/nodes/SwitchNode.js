import React, { useMemo } from "react";
import FuseBranchCardNode from "./FuseBranchCardNode";

const FALLBACK_CASES = [
  { id: "case_0", label: "Case 1" },
  { id: "case_1", label: "Case 2" },
];

const SwitchNode = ({ data, selected }) => {
  const branches = useMemo(() => {
    const raw = data?.config?.cases;
    const cases = Array.isArray(raw) && raw.length > 0 ? raw : FALLBACK_CASES;
    return [
      ...cases.map((c, index) => ({
        id: c.id ?? `case_${index}`,
        label: c.label || c.id || `Case ${index + 1}`,
        dot: "brand",
      })),
      { id: "default", label: "Default", dot: "muted" },
    ];
  }, [data?.config?.cases]);

  return (
    <FuseBranchCardNode
      data={data}
      selected={selected}
      branches={branches}
      defaultTitle="Switch"
    />
  );
};

export default SwitchNode;
