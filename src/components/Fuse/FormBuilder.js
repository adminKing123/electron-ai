import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { getDisplayFuseNodeId } from "../../utils/helpers";
import { getWebexRoomsAPI, getWebexPeopleAPI } from "../../apis/fuse/queryFunctions";

// ─── Timezone options ──────────────────────────────────────────────────────────
// Built once at module load from the browser's Intl API.
// Falls back to a curated list on older browsers that lack Intl.supportedValuesOf.
const TIMEZONE_OPTIONS = (() => {
  try {
    const zones = Intl.supportedValuesOf("timeZone");
    const now = new Date();
    return zones.map((tz) => {
      try {
        const offset = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          timeZoneName: "longOffset",
        })
          .formatToParts(now)
          .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
        return { label: `(${offset}) ${tz.replace(/_/g, " ")}`, value: tz };
      } catch {
        return { label: tz.replace(/_/g, " "), value: tz };
      }
    });
  } catch {
    return [
      { label: "(GMT+00:00) UTC", value: "UTC" },
      { label: "(GMT+05:30) Asia/Kolkata", value: "Asia/Kolkata" },
      { label: "(GMT-05:00) America/New_York", value: "America/New_York" },
      { label: "(GMT-08:00) America/Los_Angeles", value: "America/Los_Angeles" },
      { label: "(GMT+01:00) Europe/London", value: "Europe/London" },
      { label: "(GMT+09:00) Asia/Tokyo", value: "Asia/Tokyo" },
      { label: "(GMT+08:00) Asia/Shanghai", value: "Asia/Shanghai" },
    ];
  }
})();

// ─── Preset value resolver ─────────────────────────────────────────────────────
/**
 * Converts special dynamic preset tokens into concrete field values.
 *   "today"       → current date (YYYY-MM-DD)
 *   "next-monday" → ISO date of next Monday
 *   "+5min"       → current time + 5 minutes (HH:MM), also sets date to today
 *
 * @param {object} presetValues
 * @returns {object}
 */
const resolvePresetValues = (presetValues) => {
  const out = { ...presetValues };

  if (out.date === "today") {
    out.date = new Date().toISOString().split("T")[0];
  } else if (out.date === "next-monday") {
    const d = new Date();
    const dow = d.getDay(); // 0 = Sunday, 1 = Monday, …
    const daysUntilMonday = dow === 1 ? 7 : (1 - dow + 7) % 7 || 7;
    d.setDate(d.getDate() + daysUntilMonday);
    out.date = d.toISOString().split("T")[0];
  }

  if (out.time === "+5min") {
    const d = new Date(Date.now() + 5 * 60 * 1000);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    out.time = `${hh}:${mm}`;
    if (!out.date) {
      out.date = new Date().toISOString().split("T")[0];
    }
  }

  return out;
};

// ─── Shared base classes ──────────────────────────────────────────────────────

/** Base for text / date / time inputs */
const INPUT_BASE =
  "w-full px-3 py-2.5 rounded-lg text-[13px] " +
  "text-[#222] dark:text-[#d0d0d0] " +
  "bg-white dark:bg-[#1a1a1a] " +
  "border border-[#ddd] dark:border-[#2e2e2e] " +
  "focus:outline-none focus:border-[#aaa] dark:focus:border-[#4a4a4a] " +
  "transition-colors";

/**
 * Base for <select> elements.
 * - appearance-none hides the native OS arrow so we can render our own.
 * - pr-9 leaves room for the custom chevron overlay.
 */
const SELECT_BASE =
  "w-full pl-3 pr-9 py-2.5 rounded-lg text-[13px] appearance-none " +
  "text-[#222] dark:text-[#d0d0d0] " +
  "bg-white dark:bg-[#1a1a1a] " +
  "border border-[#ddd] dark:border-[#2e2e2e] " +
  "focus:outline-none focus:border-[#aaa] dark:focus:border-[#4a4a4a] " +
  "transition-colors cursor-pointer";

/** Custom chevron icon rendered on top of the select wrapper */
const SelectChevron = () => (
  <span
    aria-hidden
    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2
      text-[#aaa] dark:text-[#555]"
  >
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M3 5l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

// ─── Field input components ────────────────────────────────────────────────────

/** Plain single-line text input. */
const TextField = ({ field, value, onChange }) => (
  <input
    type="text"
    value={value ?? ""}
    placeholder={field.placeholder ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={INPUT_BASE}
  />
);

/** Multi-line textarea. */
const TextareaField = ({ field, value, onChange }) => (
  <textarea
    value={value ?? ""}
    rows={3}
    placeholder={field.placeholder ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={`${INPUT_BASE} resize-none leading-relaxed`}
  />
);

/** Numeric input. */
const NumberField = ({ field, value, onChange }) => (
  <input
    type="number"
    value={value ?? ""}
    placeholder={field.placeholder ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={INPUT_BASE}
  />
);

const DateField = ({ value, onChange }) => (
  <input
    type="date"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={`${INPUT_BASE} [color-scheme:light] dark:[color-scheme:dark]`}
  />
);

/** Time input — same color-scheme trick for the clock icon. */
const TimeField = ({ value, onChange }) => (
  <input
    type="time"
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    className={`${INPUT_BASE} [color-scheme:light] dark:[color-scheme:dark]`}
  />
);

const SelectField = ({ field, value, onChange }) => {
  const defaultVal = field.options?.[0]?.value ?? "";

  // Persist the first select option for required fields so the backend receives
  // a value even when the user never touches the dropdown.
  useEffect(() => {
    if ((value === undefined || value === null || value === "") && field.required && defaultVal) {
      onChange(defaultVal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <select
        value={value ?? defaultVal}
        onChange={(e) => onChange(e.target.value)}
        className={SELECT_BASE}
      >
        {(field.options ?? []).map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <SelectChevron />
    </div>
  );
};

const CheckboxField = ({ field, value, onChange }) => (
  <label className="inline-flex items-center cursor-pointer select-none py-0.5">
    <input
      type="checkbox"
      checked={!!value}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded border-[#ccc] dark:border-[#444]
        text-[#2563eb] focus:ring-[#2563eb]/30
        dark:bg-[#1a1a1a] dark:checked:bg-[#2563eb]"
    />
  </label>
);

const WebexRoomSelectField = ({ field, value, onChange }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);

    getWebexRoomsAPI()
      .then((data) => {
        if (!mounted) return;
        setRooms(data.rooms ?? []);
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className={`${INPUT_BASE} text-[#888] dark:text-[#666]`}>
        Loading spaces…
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-[12px] text-red-500 dark:text-red-400">
        Couldn&apos;t load Webex spaces. Reconnect Webex or try again.
      </p>
    );
  }

  if (!rooms.length) {
    return (
      <p className="text-[12px] text-[#888] dark:text-[#666]">
        No Webex spaces found on your account.
      </p>
    );
  }

  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={SELECT_BASE}
      >
        <option value="" disabled>
          Select a space or chat…
        </option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.label}
          </option>
        ))}
      </select>
      <SelectChevron />
    </div>
  );
};

const WebexPersonSelectField = ({ field, value, onChange }) => {
  const valueField = field.personValue === "id" ? "id" : "email";
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);

    getWebexPeopleAPI()
      .then((data) => {
        if (!mounted) return;
        setPeople(data.people ?? []);
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const options = people.filter((person) => {
    if (valueField === "email") return !!person.email;
    return !!person.id;
  });

  if (loading) {
    return (
      <div className={`${INPUT_BASE} text-[#888] dark:text-[#666]`}>
        Loading people…
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-[12px] text-red-500 dark:text-red-400">
        Couldn&apos;t load Webex people. Reconnect Webex or enter the destination manually.
      </p>
    );
  }

  if (!options.length) {
    return (
      <p className="text-[12px] text-[#888] dark:text-[#666]">
        No people found. Switch to &ldquo;Enter manually&rdquo; or use a variable.
      </p>
    );
  }

  return (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={SELECT_BASE}
      >
        <option value="" disabled>
          Select a person…
        </option>
        {options.map((person) => {
          const optionValue = valueField === "id" ? person.id : person.email;
          const optionLabel =
            valueField === "id"
              ? person.label_id
              : (person.label_email || person.email);
          return (
            <option key={person.id} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      <SelectChevron />
    </div>
  );
};

const isFieldVisible = (field, values) => {
  const rule = field.visibleWhen;
  if (!rule) return true;
  const rules = Array.isArray(rule) ? rule : [rule];
  return rules.every((r) => values?.[r.key] === r.value);
};

const TimezoneSelectField = ({ value, onChange }) => {
  const defaultTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  // Persist the browser's local timezone into the node config on first render,
  // so the backend never falls back to UTC when the user hasn't touched the field.
  React.useEffect(() => {
    if (!value) onChange(defaultTz);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      <select
        value={value ?? defaultTz}
        onChange={(e) => onChange(e.target.value)}
        className={SELECT_BASE}
      >
        {TIMEZONE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <SelectChevron />
    </div>
  );
};

// ─── Variable picker shared hook ──────────────────────────────────────────────
/**
 * Inserts a variable token `{{token}}` at the current cursor position inside
 * a textarea or text input and fires onChange with the updated string.
 */
const useVariableInserter = (inputRef, value, onChange) =>
  useCallback(
    (token) => {
      const el = inputRef.current;
      const text = value ?? "";
      const start = el?.selectionStart ?? text.length;
      const end   = el?.selectionEnd   ?? text.length;
      const next  = text.slice(0, start) + `{{${token}}}` + text.slice(end);
      onChange(next);
      // Restore cursor after the inserted token on next tick
      requestAnimationFrame(() => {
        if (!el) return;
        const pos = start + token.length + 4; // 4 = len("{{" + "}}")
        el.setSelectionRange(pos, pos);
        el.focus();
      });
    },
    [inputRef, value, onChange]
  );

/**
 * Strips the node name prefix from a label to get just the field path.
 * e.g. "My Webhook.body.email"  → "body.email"
 *      "HTTP Node → status_code" → "status_code"
 */
const getShortLabel = (label, nodeName) => {
  if (nodeName && label.startsWith(nodeName + "."))
    return label.slice(nodeName.length + 1);
  if (nodeName && label.startsWith(nodeName + " → "))
    return label.slice(nodeName.length + 3);
  return label;
};

/**
 * Two-step floating variable picker.
 *
 * Step 1 — node list: shows each upstream node's name + short ID
 *           (starter nodes omit the ID).
 * Step 2 — variable list: shows the variables belonging to the chosen node,
 *           with a back chevron to return to step 1.
 */
const VariablePicker = ({ variables, onPick, onClose }) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  /** Group variables by nodeId. Falls back to token prefix for legacy vars. */
  const groups = useMemo(() => {
    const map = new Map();
    variables.forEach((v) => {
      const nid      = v.nodeId   ?? v.token.split(".")[0];
      const nname    = v.nodeName ?? nid;
      const starter  = v.isStarter ?? false;
      if (!map.has(nid)) map.set(nid, { nodeId: nid, nodeName: nname, isStarter: starter, vars: [] });
      map.get(nid).vars.push(v);
    });
    return [...map.values()];
  }, [variables]);

  const WRAPPER =
    "absolute z-50 right-0 top-full mt-1 w-64 rounded-xl " +
    "bg-white dark:bg-[#1e1e1e] " +
    "border border-[#e0e0e0] dark:border-[#2e2e2e] " +
    "shadow-lg overflow-hidden";

  if (!variables.length) {
    return (
      <div className={`${WRAPPER} p-3`}>
        <p className="text-[11.5px] text-[#bbb] dark:text-[#555] text-center select-none">
          No variables available yet.<br />
          Define fields in the webhook body.
        </p>
      </div>
    );
  }

  /* ── Step 2: variables for the selected node ── */
  if (selectedNodeId !== null) {
    const group = groups.find((g) => g.nodeId === selectedNodeId);
    if (!group) { setSelectedNodeId(null); return null; }

    return (
      <div className={WRAPPER}>
        {/* Header row with back button */}
        <div className="flex items-center gap-1.5 px-2 pt-2 pb-1.5
          border-b border-[#f0f0f0] dark:border-[#272727]">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedNodeId(null); }}
            className="w-6 h-6 flex items-center justify-center rounded-md
              text-[#aaa] dark:text-[#555]
              hover:text-[#555] dark:hover:text-[#aaa]
              hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a]
              transition-colors flex-shrink-0"
            aria-label="Back to nodes"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-[11.5px] font-semibold text-[#333] dark:text-[#c0c0c0] truncate">
            {group.nodeName}
          </span>
        </div>

        <ul className="max-h-52 overflow-y-auto pb-1.5 pt-0.5">
          {group.vars.map((v) => (
            <li key={v.token}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onPick(v.token); onClose(); }}
                className="w-full text-left px-3 py-2 flex flex-col gap-0.5
                  hover:bg-[#f5f7ff] dark:hover:bg-[#252540] transition-colors"
              >
                <span className="text-[12px] font-medium text-[#222] dark:text-[#d0d0d0] truncate">
                  {getShortLabel(v.label, group.nodeName)}
                </span>
                <span className="text-[10.5px] font-mono text-[#4a6cf7] dark:text-[#6b8aff] truncate">
                  {`{{${v.token}}}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  /* ── Step 1: node list ── */
  return (
    <div className={WRAPPER}>
      <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider
        text-[#bbb] dark:text-[#484848]">
        Pick a node
      </p>
      <ul className="max-h-52 overflow-y-auto pb-1.5">
        {groups.map((g) => (
          <li key={g.nodeId}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedNodeId(g.nodeId); }}
              className="w-full text-left px-3 py-2 flex items-center justify-between gap-2
                hover:bg-[#f5f7ff] dark:hover:bg-[#252540] transition-colors"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[12px] font-medium text-[#222] dark:text-[#d0d0d0] truncate">
                  {g.nodeName}
                </span>
                {!g.isStarter && (
                  <span className="text-[10.5px] font-mono text-[#aaa] dark:text-[#555] truncate">
                    {getDisplayFuseNodeId(g.nodeId)}
                  </span>
                )}
              </div>
              {/* Chevron right */}
              <svg className="flex-shrink-0 text-[#ccc] dark:text-[#444]"
                width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 2L8.5 6l-4 4" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Text input that supports `@` variable insertion via a picker button. */
const VariableTextField = ({ field, value, onChange, variables }) => {
  const inputRef    = useRef(null);
  const containerRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const insertVariable = useVariableInserter(inputRef, value, onChange);

  // Close picker when user clicks outside the entire container.
  React.useEffect(() => {
    if (!pickerOpen) return;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [pickerOpen]);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5">
        <input
          ref={inputRef}
          type="text"
          value={value ?? ""}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_BASE} flex-1 pr-9`}
        />
        {/* @ variable button */}
        <button
          type="button"
          title="Insert variable"
          onMouseDown={(e) => { e.preventDefault(); setPickerOpen((o) => !o); }}
          className="flex-shrink-0 w-8 h-[38px] flex items-center justify-center rounded-lg
            text-[12px] font-mono font-bold
            text-[#888] dark:text-[#555]
            border border-[#ddd] dark:border-[#2e2e2e]
            hover:text-[#4a6cf7] dark:hover:text-[#6b8aff]
            hover:border-[#c0c8f0] dark:hover:border-[#363660]
            hover:bg-[#f5f7ff] dark:hover:bg-[#1a1a30]
            transition-colors"
        >
          @
        </button>
      </div>
      {pickerOpen && (
        <VariablePicker
          variables={variables}
          onPick={insertVariable}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
};

/** Textarea that supports `@` variable insertion via a picker button. */
const VariableTextareaField = ({ field, value, onChange, variables }) => {
  const inputRef     = useRef(null);
  const containerRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const insertVariable = useVariableInserter(inputRef, value, onChange);

  // Close picker when user clicks outside the entire container.
  React.useEffect(() => {
    if (!pickerOpen) return;
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [pickerOpen]);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-start gap-1.5">
        <textarea
          ref={inputRef}
          value={value ?? ""}
          rows={3}
          placeholder={field.placeholder ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_BASE} flex-1 resize-none leading-relaxed`}
        />
        <button
          type="button"
          title="Insert variable"
          onMouseDown={(e) => { e.preventDefault(); setPickerOpen((o) => !o); }}
          className="flex-shrink-0 w-8 h-8 mt-0.5 flex items-center justify-center rounded-lg
            text-[12px] font-mono font-bold
            text-[#888] dark:text-[#555]
            border border-[#ddd] dark:border-[#2e2e2e]
            hover:text-[#4a6cf7] dark:hover:text-[#6b8aff]
            hover:border-[#c0c8f0] dark:hover:border-[#363660]
            hover:bg-[#f5f7ff] dark:hover:bg-[#1a1a30]
            transition-colors"
        >
          @
        </button>
      </div>
      {pickerOpen && (
        <VariablePicker
          variables={variables}
          onPick={insertVariable}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
};

// ─── BodyBuilderField ─────────────────────────────────────────────────────────
/**
 * Recursive, visual-only body schema builder.
 *
 * Stored value shape:
 * {
 *   mode:   "visual",
 *   fields: FieldNode[],
 * }
 *
 * FieldNode:
 * {
 *   key:    string,
 *   type:   "string" | "number" | "boolean" | "array" | "object",
 *   fields: FieldNode[],  // when type === "object"
 *   items:  {             // when type === "array"
 *     type:   "string" | "number" | "boolean" | "array" | "object",
 *     fields: FieldNode[], // when items.type === "object"
 *   },
 * }
 */
const BODY_FIELD_TYPES = ["string", "number", "boolean", "array", "object"];
const BODY_SCHEMA_MAX_DEPTH = 4;

/**
 * Renders one field row: [key input] [type select] [× button]
 * Expands below with nested content for "object" and "array" types.
 */
const SchemaFieldRow = ({ field, depth, onUpdate, onRemove }) => {
  const handleTypeChange = (newType) => {
    const updated = { ...field, type: newType };
    if (newType === "object") updated.fields = field.fields ?? [];
    if (newType === "array")  updated.items  = field.items  ?? { type: "string" };
    onUpdate(updated);
  };

  const handleItemsTypeChange = (newType) => {
    const items = { ...(field.items ?? {}), type: newType };
    if (newType === "object") items.fields = field.items?.fields ?? [];
    onUpdate({ ...field, items });
  };

  const canNest = depth < BODY_SCHEMA_MAX_DEPTH;
  const indent  = "ml-5 pl-3 border-l border-[#e0e0e0] dark:border-[#2a2a2a]";

  return (
    <div className="flex flex-col gap-1.5">
      {/* Main row: key + type + description + remove */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={field.key}
          placeholder="field_name"
          onChange={(e) => onUpdate({ ...field, key: e.target.value })}
          className={`${INPUT_BASE} flex-1 font-mono text-[12px]`}
        />
        <div className="relative flex-shrink-0 w-28">
          <select
            value={field.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className={SELECT_BASE}
          >
            {BODY_FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <SelectChevron />
        </div>
        {field.showDescription && (
          <input
            type="text"
            value={field.description ?? ""}
            placeholder="Description..."
            onChange={(e) => onUpdate({ ...field, description: e.target.value })}
            className={`${INPUT_BASE} flex-1 text-[12px]`}
          />
        )}
        {field.showEnum && field.type === "string" && (
          <input
            type="text"
            value={field.enum ?? ""}
            placeholder="Enum (comma separated)"
            onChange={(e) => onUpdate({ ...field, enum: e.target.value })}
            className={`${INPUT_BASE} flex-1 text-[12px]`}
          />
        )}
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
            text-[#bbb] dark:text-[#444]
            hover:text-[#e05c5c] dark:hover:text-[#c26060]
            hover:bg-[#fef2f2] dark:hover:bg-[#2a1a1a]
            transition-colors text-lg leading-none"
          aria-label="Remove field"
        >
          ×
        </button>
      </div>

      {/* Array: choose items type + optionally define object properties */}
      {field.type === "array" && (
        <div className={`${indent} flex flex-col gap-1.5 py-1.5`}>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#bbb] dark:text-[#555] whitespace-nowrap">
              Items type:
            </span>
            <div className="relative w-28">
              <select
                value={field.items?.type ?? "string"}
                onChange={(e) => handleItemsTypeChange(e.target.value)}
                className={SELECT_BASE}
              >
                {BODY_FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>
          {/* If each array item is an object, define its properties */}
          {field.items?.type === "object" && canNest && (
            <SchemaFieldList
              fields={field.items.fields ?? []}
              depth={depth + 1}
              label="Object properties"
              showDescription={field.showDescription}
              showEnum={field.showEnum}
              onChange={(newFields) =>
                onUpdate({ ...field, items: { ...field.items, fields: newFields } })
              }
            />
          )}
        </div>
      )}

      {/* Object: define its properties */}
      {field.type === "object" && canNest && (
        <div className={`${indent} py-1.5`}>
          <SchemaFieldList
            fields={field.fields ?? []}
            depth={depth + 1}
            label="Properties"
            showDescription={field.showDescription}
            showEnum={field.showEnum}
            onChange={(newFields) => onUpdate({ ...field, fields: newFields })}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Renders a list of SchemaFieldRows with an "Add" button.
 * Used both at the root level and recursively inside nested fields.
 */
const SchemaFieldList = ({ fields, depth, label, onChange, showDescription, showEnum }) => {
  const addRow    = () => onChange([...fields, { key: "", type: "string", showDescription, showEnum }]);
  const removeRow = (i) => onChange(fields.filter((_, idx) => idx !== i));
  const updateRow = (i, updated) =>
    onChange(fields.map((f, idx) => (idx === i ? updated : f)));

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[12px] font-medium text-[#555] dark:text-[#888]">
          {label}
        </span>
      )}
      {fields.length === 0 && (
        <p className="text-[11px] text-[#bbb] dark:text-[#555] pl-0.5">
          {depth === 0 ? "No fields defined yet." : "No properties yet."}
        </p>
      )}
      {fields.map((f, i) => (
        <SchemaFieldRow
          key={i}
          field={{...f, showDescription, showEnum}}
          depth={depth}
          onUpdate={(updated) => updateRow(i, updated)}
          onRemove={() => removeRow(i)}
        />
      ))}
      <button
        type="button"
        onClick={addRow}
        className="self-start mt-0.5 px-2.5 py-1 rounded-lg text-[12px]
          border border-[#ddd] dark:border-[#2e2e2e]
          text-[#444] dark:text-[#999]
          hover:bg-[#f5f5f5] dark:hover:bg-[#252525]
          hover:border-[#c0c0c0] dark:hover:border-[#3a3a3a]
          transition-colors"
      >
        + Add {depth === 0 ? "field" : "property"}
      </button>
    </div>
  );
};

const BodyBuilderField = ({ field, value, onChange }) => {
  const fields = value?.fields ?? [];
  return (
    <SchemaFieldList
      fields={fields}
      depth={0}
      showDescription={field.showDescription}
      showEnum={field.showEnum}
      onChange={(newFields) => onChange({ mode: "visual", fields: newFields })}
    />
  );
};

// ─── JsonValueBuilderField ────────────────────────────────────────────────────
/**
 * Visual JSON value builder — mirrors BodyBuilderField but assigns concrete
 * VALUES (with variable insertion) to each declared field, instead of just
 * defining the schema type.
 *
 * Used for: request headers, query params, request body payload.
 *
 * Stored value shape:
 * {
 *   mode:   "visual",
 *   fields: ValueFieldNode[],
 * }
 *
 * ValueFieldNode:
 * {
 *   key:    string,
 *   type:   "string" | "number" | "boolean" | "array" | "object",
 *   value:  string,            // for primitive + array types (may contain {{vars}})
 *   fields: ValueFieldNode[],  // when type === "object"
 * }
 */
const VALUE_FIELD_TYPES = ["string", "number", "boolean", "array", "object"];
const JSON_VALUE_MAX_DEPTH = 4;

/**
 * Single row: [key] [type] [value-with-@] [×]
 * For "object" type the value column is replaced by nested ValueFieldList.
 * Defined before ValueFieldList so both can reference each other via hoisting.
 */
const ValueFieldRow = ({ field, depth, onUpdate, onRemove, variables }) => {
  const inputRef     = useRef(null);
  const containerRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const insertVariable = useVariableInserter(
    inputRef,
    field.value ?? "",
    (v) => onUpdate({ ...field, value: v }),
  );

  const handleTypeChange = (newType) => {
    const updated = { ...field, type: newType };
    if (newType === "object") {
      updated.fields = field.fields ?? [];
      delete updated.value;
      delete updated.elements;
    } else if (newType === "array") {
      updated.elements = field.elements ?? [];
      delete updated.value;
      delete updated.fields;
    } else {
      if (!("value" in updated)) updated.value = "";
      delete updated.fields;
      delete updated.elements;
    }
    onUpdate(updated);
  };

  const canNest = depth < JSON_VALUE_MAX_DEPTH;
  const indent  = "ml-5 pl-3 border-l border-[#e0e0e0] dark:border-[#2a2a2a]";

  React.useEffect(() => {
    if (!pickerOpen) return;
    const outside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setPickerOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [pickerOpen]);

  return (
    <div className="flex flex-col gap-1.5">
      {/* Main row: Key, Type, Remove */}
      <div className="flex items-center gap-2 w-full">
        {/* Key (only if not in an array) */}
        {field.key !== undefined && (
          <input
            type="text"
            value={field.key ?? ""}
            placeholder="key"
            onChange={(e) => onUpdate({ ...field, key: e.target.value })}
            className={`${INPUT_BASE} flex-1 min-w-0 font-mono text-[12px]`}
          />
        )}

        {/* Type */}
        <div className="relative flex-shrink-0 w-24">
          <select
            value={field.type ?? "string"}
            onChange={(e) => handleTypeChange(e.target.value)}
            className={SELECT_BASE}
          >
            {VALUE_FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <SelectChevron />
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove field"
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
            text-[#bbb] dark:text-[#444]
            hover:text-[#e05c5c] dark:hover:text-[#c26060]
            hover:bg-[#fef2f2] dark:hover:bg-[#2a1a1a]
            transition-colors text-lg leading-none ml-auto"
        >
          ×
        </button>
      </div>

      {/* Value row — shown for all types except "object" (nested fields handle it) */}
      {field.type !== "object" && field.type !== "array" && (
        <div ref={containerRef} className="relative flex items-center gap-1 w-full mt-1">
          <input
            ref={inputRef}
            type="text"
            value={field.value ?? ""}
            placeholder={
              field.type === "boolean" ? "true / false" :
              "value  or  {{var}}"
            }
            onChange={(e) => onUpdate({ ...field, value: e.target.value })}
            className={`${INPUT_BASE} flex-1 text-[12px]`}
          />
          <button
            type="button"
            title="Insert variable"
            onMouseDown={(e) => { e.preventDefault(); setPickerOpen((o) => !o); }}
            className="flex-shrink-0 w-7 h-[38px] flex items-center justify-center rounded-lg
              text-[11px] font-mono font-bold
              text-[#888] dark:text-[#555]
              border border-[#ddd] dark:border-[#2e2e2e]
              hover:text-[#4a6cf7] dark:hover:text-[#6b8aff]
              hover:border-[#c0c8f0] dark:hover:border-[#363660]
              hover:bg-[#f5f7ff] dark:hover:bg-[#1a1a30]
              transition-colors"
          >
            @
          </button>
          {pickerOpen && (
            <VariablePicker
              variables={variables}
              onPick={insertVariable}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>
      )}

      {/* Nested properties for object type */}
      {field.type === "object" && canNest && (
        <div className={`${indent} py-1.5 mt-1`}>
          <ValueFieldList
            fields={field.fields ?? []}
            depth={depth + 1}
            variables={variables}
            onChange={(newFields) => onUpdate({ ...field, fields: newFields })}
          />
        </div>
      )}

      {/* Nested items for array type */}
      {field.type === "array" && canNest && (
        <div className={`${indent} py-1.5 mt-1`}>
          <ValueFieldList
            fields={field.elements ?? []}
            depth={depth + 1}
            variables={variables}
            isArray={true}
            onChange={(newElements) => onUpdate({ ...field, elements: newElements })}
          />
        </div>
      )}
    </div>
  );
};

/** Renders a list of ValueFieldRows with an "Add field" button. */
const ValueFieldList = ({ fields, depth, onChange, variables, isArray = false }) => {
  const addRow    = () => onChange([...fields, isArray ? { type: "string", value: "" } : { key: "", type: "string", value: "" }]);
  const removeRow = (i) => onChange(fields.filter((_, idx) => idx !== i));
  const updateRow = (i, updated) =>
    onChange(fields.map((f, idx) => (idx === i ? updated : f)));

  return (
    <div className="flex flex-col gap-1.5">
      {fields.length === 0 && (
        <p className="text-[11px] text-[#bbb] dark:text-[#555] pl-0.5">
          {isArray ? "No items added yet." : depth === 0 ? "No fields added yet." : "No properties yet."}
        </p>
      )}
      {fields.map((f, i) => (
        <ValueFieldRow
          key={i}
          field={f}
          depth={depth}
          variables={variables}
          onUpdate={(updated) => updateRow(i, updated)}
          onRemove={() => removeRow(i)}
        />
      ))}
      <button
        type="button"
        onClick={addRow}
        className="self-start mt-0.5 px-2.5 py-1 rounded-lg text-[12px]
          border border-[#ddd] dark:border-[#2e2e2e]
          text-[#444] dark:text-[#999]
          hover:bg-[#f5f5f5] dark:hover:bg-[#252525]
          hover:border-[#c0c0c0] dark:hover:border-[#3a3a3a]
          transition-colors"
      >
        + Add {isArray ? "item" : depth === 0 ? "field" : "property"}
      </button>
    </div>
  );
};

/** Entry-point wrapper that reads/writes the `{ mode, fields }` envelope. */
const JsonValueBuilderField = ({ field, value, onChange, variables }) => {
  const fields = value?.fields ?? [];
  return (
    <ValueFieldList
      fields={fields}
      depth={0}
      variables={variables}
      onChange={(newFields) => onChange({ mode: "visual", fields: newFields })}
    />
  );
};

// ─── KeyValueBuilderField ──────────────────────────────────────────────────────
/**
 * Simple Key-Value builder for headers and query params where keys and values are always strings.
 */
const KeyValueRow = ({ field, onUpdate, onRemove, variables }) => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const insertVariable = useVariableInserter(
    inputRef,
    field.value ?? "",
    (v) => onUpdate({ ...field, value: v }),
  );

  React.useEffect(() => {
    if (!pickerOpen) return;
    const outside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setPickerOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [pickerOpen]);

  return (
    <div className="flex items-center gap-2 w-full min-w-0">
      <input
        type="text"
        value={field.key ?? ""}
        placeholder="key"
        onChange={(e) => onUpdate({ ...field, key: e.target.value })}
        className={`px-3 py-2.5 rounded-lg text-[13px] text-[#222] dark:text-[#d0d0d0] bg-white dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#2e2e2e] focus:outline-none focus:border-[#aaa] dark:focus:border-[#4a4a4a] transition-colors w-[35%] flex-shrink-0 font-mono`}
      />
      <div ref={containerRef} className="relative flex-1 flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={field.value ?? ""}
          placeholder="value or {{var}}"
          onChange={(e) => onUpdate({ ...field, value: e.target.value })}
          className={`px-3 py-2.5 rounded-lg text-[13px] text-[#222] dark:text-[#d0d0d0] bg-white dark:bg-[#1a1a1a] border border-[#ddd] dark:border-[#2e2e2e] focus:outline-none focus:border-[#aaa] dark:focus:border-[#4a4a4a] transition-colors flex-1`}
        />
        <button
          type="button"
          title="Insert variable"
          onMouseDown={(e) => { e.preventDefault(); setPickerOpen((o) => !o); }}
          className="flex-shrink-0 w-7 h-[38px] flex items-center justify-center rounded-lg
            text-[11px] font-mono font-bold
            text-[#888] dark:text-[#555]
            border border-[#ddd] dark:border-[#2e2e2e]
            hover:text-[#4a6cf7] dark:hover:text-[#6b8aff]
            hover:border-[#c0c8f0] dark:hover:border-[#363660]
            hover:bg-[#f5f7ff] dark:hover:bg-[#1a1a30]
            transition-colors"
        >
          @
        </button>
        {pickerOpen && (
          <VariablePicker
            variables={variables}
            onPick={insertVariable}
            onClose={() => setPickerOpen(false)}
          />
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
          text-[#bbb] dark:text-[#444]
          hover:text-[#e05c5c] dark:hover:text-[#c26060]
          hover:bg-[#fef2f2] dark:hover:bg-[#2a1a1a]
          transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

const KeyValueBuilderField = ({ field, value, onChange, variables }) => {
  const fields = value?.fields ?? [];
  const addRow = () => onChange({ mode: "visual", fields: [...fields, { key: "", value: "" }] });
  const updateRow = (i, updated) => {
    const newFields = [...fields];
    newFields[i] = updated;
    onChange({ mode: "visual", fields: newFields });
  };
  const removeRow = (i) => {
    onChange({ mode: "visual", fields: fields.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="flex flex-col gap-1.5">
      {fields.length === 0 && (
        <p className="text-[11px] text-[#bbb] dark:text-[#555] pl-0.5">
          No items added yet.
        </p>
      )}
      {fields.map((f, i) => (
        <KeyValueRow
          key={i}
          field={f}
          variables={variables}
          onUpdate={(updated) => updateRow(i, updated)}
          onRemove={() => removeRow(i)}
        />
      ))}
      <button
        type="button"
        onClick={addRow}
        className="self-start mt-0.5 px-2.5 py-1 rounded-lg text-[12px]
          border border-[#ddd] dark:border-[#2e2e2e]
          text-[#444] dark:text-[#999]
          hover:bg-[#f5f5f5] dark:hover:bg-[#252525]
          hover:border-[#c0c0c0] dark:hover:border-[#3a3a3a]
          transition-colors"
      >
        + Add item
      </button>
    </div>
  );
};

// ─── VariableSelectorField ───────────────────────────────────────────────────
/**
 * Picks a single variable from the upstream variable list.
 * Opens the shared VariablePicker on the @ button, sets the value to
 * the full  {{token}}  string, and shows a clear button when one is selected.
 */
const VariableSelectorField = ({ value, onChange, variables }) => {
  const containerRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  React.useEffect(() => {
    if (!pickerOpen) return;
    const outside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setPickerOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [pickerOpen]);

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-1.5">
        {/* Current selection display */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setPickerOpen((o) => !o)}
          onKeyDown={(e) => e.key === "Enter" && setPickerOpen((o) => !o)}
          className={[
            INPUT_BASE,
            "flex-1 cursor-pointer select-none font-mono text-[12px] truncate",
            value
              ? "text-[#4a6cf7] dark:text-[#6b8aff]"
              : "text-[#bbb] dark:text-[#555] italic",
          ].join(" ")}
        >
          {value || "— click @ to pick a variable —"}
        </div>

        {/* Clear */}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear variable"
            className="flex-shrink-0 w-7 h-[38px] flex items-center justify-center rounded-lg
              text-[#bbb] dark:text-[#444]
              hover:text-[#e05c5c] dark:hover:text-[#c26060]
              hover:bg-[#fef2f2] dark:hover:bg-[#2a1a1a]
              transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}

        {/* Open picker */}
        <button
          type="button"
          title="Pick variable"
          onMouseDown={(e) => { e.preventDefault(); setPickerOpen((o) => !o); }}
          className="flex-shrink-0 w-8 h-[38px] flex items-center justify-center rounded-lg
            text-[12px] font-mono font-bold
            text-[#888] dark:text-[#555]
            border border-[#ddd] dark:border-[#2e2e2e]
            hover:text-[#4a6cf7] dark:hover:text-[#6b8aff]
            hover:border-[#c0c8f0] dark:hover:border-[#363660]
            hover:bg-[#f5f7ff] dark:hover:bg-[#1a1a30]
            transition-colors"
        >
          @
        </button>
      </div>

      {pickerOpen && (
        <VariablePicker
          variables={variables}
          onPick={(token) => { onChange(`{{${token}}}`); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
};

// ─── ConditionBuilderField ────────────────────────────────────────────────────
/**
 * Builds compound AND/OR conditions for the if/else node.
 *
 * Each condition row: [variable picker] [operator] [value?] [remove ×]
 * An AND/OR toggle badge appears between consecutive rows.
 *
 * Stored value shape (new):
 * {
 *   combinator: "and" | "or",
 *   conditions: Array<{ variable: string, operator: string, value: string }>
 * }
 *
 * Backward-compatible: old single-condition shape { variable, operator, value }
 * is automatically migrated to the new format on first access.
 */
const CONDITION_OPERATORS = [
  { group: "Equality",     ops: ["is", "is not"] },
  { group: "Comparison",   ops: [">", "<", ">=", "<="] },
  { group: "Numeric",      ops: ["is even", "is odd"] },
  { group: "Presence",     ops: ["is empty", "is not empty"] },
  { group: "String",       ops: ["contains", "does not contain", "starts with",
                                  "does not start with", "ends with", "does not end with"] },
  { group: "Boolean",      ops: ["is true", "is false"] },
];

// Operators that don't require a comparison value.
const UNARY_OPERATORS = new Set([
  "is even", "is odd", "is empty", "is not empty", "is true", "is false",
]);

/** Blank condition template for new rows. */
const EMPTY_CONDITION = { variable: "", operator: "is", value: "" };

/**
 * Normalise stored value to the group format.
 * Accepts both old { variable, operator, value } and new { combinator, conditions }.
 */
const normaliseConditionValue = (raw) => {
  if (!raw) return { combinator: "and", conditions: [{ ...EMPTY_CONDITION }] };

  // Old single-condition shape: has "variable" but no "conditions" array
  if (raw.conditions === undefined && raw.variable !== undefined) {
    return {
      combinator: "and",
      conditions: [{ variable: raw.variable ?? "", operator: raw.operator ?? "is", value: raw.value ?? "" }],
    };
  }

  return {
    combinator: raw.combinator ?? "and",
    conditions: Array.isArray(raw.conditions) && raw.conditions.length
      ? raw.conditions
      : [{ ...EMPTY_CONDITION }],
  };
};

/**
 * Single condition row: variable picker, operator select, optional value input,
 * and a remove button (shown only when more than one condition exists).
 */
const ConditionRow = ({ cond, total, variables, onChange, onRemove }) => {
  const operator = cond.operator ?? "is";
  const isUnary  = UNARY_OPERATORS.has(operator);

  const update = (patch) => onChange({ ...cond, ...patch });

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl
      bg-[#fafafa] dark:bg-[#141414]
      border border-[#e8e8e8] dark:border-[#272727]">

      {/* Variable selector with optional remove button */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 min-w-0">
          <VariableSelectorField
            value={cond.variable ?? ""}
            variables={variables ?? []}
            onChange={(v) => update({ variable: v })}
          />
        </div>

        {/* Remove button — only visible when more than one row exists */}
        {total > 1 && (
          <button
            type="button"
            onClick={onRemove}
            title="Remove this condition"
            className="flex-shrink-0 w-7 h-[38px] flex items-center justify-center rounded-lg
              text-[#bbb] dark:text-[#444]
              border border-[#e0e0e0] dark:border-[#2a2a2a]
              hover:text-[#e05] hover:border-[#fcc] dark:hover:border-[#5a1a1a]
              hover:bg-[#fff5f5] dark:hover:bg-[#1e0a0a]
              transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Operator + optional comparison value */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            value={operator}
            onChange={(e) => update({ operator: e.target.value, value: "" })}
            className={SELECT_BASE}
          >
            {CONDITION_OPERATORS.map(({ group, ops }) => (
              <optgroup key={group} label={group}>
                {ops.map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <SelectChevron />
        </div>

        {!isUnary && (
          <input
            type="text"
            value={cond.value ?? ""}
            placeholder="value…"
            onChange={(e) => update({ value: e.target.value })}
            className={`${INPUT_BASE} flex-1`}
          />
        )}
      </div>

      {/* Live preview */}
      {cond.variable && operator && (
        <div className="px-2.5 py-1.5 rounded-lg
          bg-[#f5f7ff] dark:bg-[#1a1a30]
          border border-[#c7cfe8] dark:border-[#2a2a50]
          text-[11px] font-mono text-[#4a6cf7] dark:text-[#6b8aff] break-all leading-snug">
          {cond.variable} <span className="font-bold">{operator}</span>
          {!isUnary && cond.value ? ` "${cond.value}"` : ""}
        </div>
      )}
    </div>
  );
};

const ConditionBuilderField = ({ field, value, onChange, variables }) => {
  const group = normaliseConditionValue(value);

  const updateCombinator = (c) => onChange({ ...group, combinator: c });

  const updateCondition = (index, updated) => {
    const next = group.conditions.map((c, i) => (i === index ? updated : c));
    onChange({ ...group, conditions: next });
  };

  const addCondition = () =>
    onChange({ ...group, conditions: [...group.conditions, { ...EMPTY_CONDITION }] });

  const removeCondition = (index) => {
    if (group.conditions.length <= 1) return;
    onChange({ ...group, conditions: group.conditions.filter((_, i) => i !== index) });
  };

  return (
    <div className="flex flex-col gap-2">
      {group.conditions.map((cond, idx) => (
        <React.Fragment key={idx}>
          {/* AND / OR toggle badge between condition rows */}
          {idx > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-[#e8e8e8] dark:bg-[#272727]" />
              <div className="flex rounded-lg overflow-hidden border border-[#ddd] dark:border-[#2e2e2e]">
                {["and", "or"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateCombinator(c)}
                    className={[
                      "px-3 py-1 text-[10.5px] font-bold uppercase tracking-widest transition-colors",
                      group.combinator === c
                        ? "bg-[#4a6cf7] text-white"
                        : "text-[#999] dark:text-[#555] hover:bg-[#f0f0f0] dark:hover:bg-[#222]",
                    ].join(" ")}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex-1 h-px bg-[#e8e8e8] dark:bg-[#272727]" />
            </div>
          )}

          <ConditionRow
            cond={cond}
            total={group.conditions.length}
            variables={variables ?? []}
            onChange={(updated) => updateCondition(idx, updated)}
            onRemove={() => removeCondition(idx)}
          />
        </React.Fragment>
      ))}

      {/* Add condition button */}
      <button
        type="button"
        onClick={addCondition}
        className="flex items-center gap-1.5 self-start mt-1 px-3 py-1.5 rounded-lg text-[12px]
          text-[#4a6cf7] dark:text-[#6b8aff]
          border border-[#c7cfe8] dark:border-[#2a2a50]
          hover:bg-[#f5f7ff] dark:hover:bg-[#1a1a30]
          transition-colors"
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        Add condition
      </button>
    </div>
  );
};

/**
 * Dispatch to the correct input component based on field.type.
 * Supported types: "date" | "time" | "select" | "timezone_select"
 */
const FieldInput = ({ field, value, onChange, variables = [] }) => {
  switch (field.type) {
    case "text":                return <TextField              field={field} value={value} onChange={onChange} />;
    case "textarea":            return <TextareaField           field={field} value={value} onChange={onChange} />;
    case "number":              return <NumberField             field={field} value={value} onChange={onChange} />;
    case "date":                return <DateField               value={value} onChange={onChange} />;
    case "time":                return <TimeField               value={value} onChange={onChange} />;
    case "timezone_select":     return <TimezoneSelectField     value={value} onChange={onChange} />;
    case "variable_text":       return <VariableTextField       field={field} value={value} onChange={onChange} variables={variables} />;
    case "variable_textarea":   return <VariableTextareaField   field={field} value={value} onChange={onChange} variables={variables} />;
    case "body_builder":        return <BodyBuilderField        field={field} value={value} onChange={onChange} />;
    case "condition_builder":   return <ConditionBuilderField   field={field} value={value} onChange={onChange} variables={variables} />;
    case "json_value_builder":  return <JsonValueBuilderField   field={field} value={value} onChange={onChange} variables={variables} />;
    case "key_value_builder":   return <KeyValueBuilderField    field={field} value={value} onChange={onChange} variables={variables} />;
    case "checkbox":            return <CheckboxField           field={field} value={value} onChange={onChange} />;
    case "webex_room_select":   return <WebexRoomSelectField     field={field} value={value} onChange={onChange} />;
    case "webex_person_select": return <WebexPersonSelectField   field={field} value={value} onChange={onChange} />;
    case "select":
    default:                    return <SelectField             field={field} value={value} onChange={onChange} />;
  }
};

// ─── FormBuilder ───────────────────────────────────────────────────────────────
/**
 * Generic, schema-driven form renderer.
 *
 * The `configForm` schema (provided by the backend) drives everything —
 * no hardcoded fields exist here. Adding a new field type only requires
 * adding a case to FieldInput and a corresponding entry in the schema.
 *
 * Schema shape:
 * {
 *   presets:  Array<{ label: string, values: object }>
 *   sections: Array<{
 *     title?:  string
 *     layout?: "grid-2" | undefined   (default = single column)
 *     fields:  Array<{
 *       key:         string
 *       label:       string
 *       type:        "date" | "time" | "select" | "timezone_select"
 *       required?:   boolean
 *       options?:    Array<{ label: string, value: string }>  (for select)
 *       hint?:       string   (shown below the input)
 *       after_hint?: string   (contextual note shown below the field block)
 *     }>
 *   }>
 * }
 *
 * @param {{ configForm: object, values: object, onChange: (newValues: object) => void }} props
 */
const FormBuilder = ({ configForm, values = {}, onChange, variables = [] }) => {
  const { presets = [], sections = [] } = configForm ?? {};

  const handlePreset = (preset) => {
    onChange({ ...values, ...resolvePresetValues(preset.values) });
  };

  const handleFieldChange = (key, val) => {
    const next = { ...values, [key]: val };
    if (key === "filter_type" && val !== "room") {
      delete next.room_id;
    }
    if (key === "send_to" || key === "destination_source") {
      delete next.destination_pick;
      delete next.destination;
    }
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Quick preset buttons ─────────────────────────────────────────── */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePreset(preset)}
              className="px-3 py-1.5 rounded-lg text-[12px]
                border border-[#ddd] dark:border-[#2e2e2e]
                text-[#444] dark:text-[#999]
                hover:bg-[#f5f5f5] dark:hover:bg-[#252525]
                hover:border-[#c0c0c0] dark:hover:border-[#3a3a3a]
                transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Form sections ─────────────────────────────────────────────────── */}
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="flex flex-col gap-3">
          {/* Section heading */}
          {section.title && (
            <p className="text-[12.5px] font-semibold text-[#333] dark:text-[#c0c0c0]">
              {section.title}
            </p>
          )}

          {/* Fields — grid-2 layout or single column */}
          <div
            className={
              section.layout === "grid-2"
                ? "grid grid-cols-2 gap-3"
                : "flex flex-col gap-3"
            }
          >
            {section.fields.filter((field) => isFieldVisible(field, values)).map((field, fIdx) => (
              <div key={`${field.key}-${field.type}-${field.label}-${fIdx}`} className="flex flex-col gap-1">
                {/* Field label */}
                <label className="text-[12px] font-medium text-[#555] dark:text-[#888]">
                  {field.label}
                  {field.required && (
                    <span className="text-[#e05] ml-0.5">*</span>
                  )}
                </label>

                {/* Input */}
                <FieldInput
                  field={field}
                  value={values[field.key]}
                  onChange={(val) => handleFieldChange(field.key, val)}
                  variables={variables}
                />

                {/* Hint below the input (e.g. "MM/DD/YYYY") */}
                {field.hint && (
                  <span className="text-[11px] text-[#bbb] dark:text-[#555]">
                    {field.hint}
                  </span>
                )}

                {/* Contextual note after the field block */}
                {field.after_hint && (
                  <span className="text-[11.5px] leading-relaxed text-[#888] dark:text-[#555] mt-0.5">
                    {field.after_hint}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FormBuilder;
