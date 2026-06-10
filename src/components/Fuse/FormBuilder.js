import React, { useMemo, useRef, useState, useCallback } from "react";

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

const SelectField = ({ field, value, onChange }) => (
  <div className="relative">
    <select
      value={value ?? field.options?.[0]?.value ?? ""}
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

/** Small floating variable picker dropdown. */
const VariablePicker = ({ variables, onPick, onClose }) => {
  if (!variables.length) {
    return (
      <div className="absolute z-50 right-0 top-full mt-1 w-52 rounded-xl
        bg-white dark:bg-[#1e1e1e]
        border border-[#e0e0e0] dark:border-[#2e2e2e]
        shadow-lg p-3">
        <p className="text-[11.5px] text-[#bbb] dark:text-[#555] text-center select-none">
          No variables available yet.<br />
          Define fields in the webhook body.
        </p>
      </div>
    );
  }
  return (
    <div className="absolute z-50 right-0 top-full mt-1 w-60 rounded-xl
      bg-white dark:bg-[#1e1e1e]
      border border-[#e0e0e0] dark:border-[#2e2e2e]
      shadow-lg overflow-hidden">
      <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider
        text-[#bbb] dark:text-[#484848]">
        Variables
      </p>
      <ul className="max-h-48 overflow-y-auto pb-1.5">
        {variables.map((v) => (
          <li key={v.token}>
            <button
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onPick(v.token); onClose(); }}
              className="w-full text-left px-3 py-2 flex flex-col gap-0.5
                hover:bg-[#f5f7ff] dark:hover:bg-[#252540] transition-colors"
            >
              <span className="text-[12px] font-medium text-[#222] dark:text-[#d0d0d0] truncate">
                {v.label}
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
    } else {
      if (!("value" in updated)) updated.value = "";
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
      {/* Main row */}
      <div className="flex items-center gap-2">
        {/* Key */}
        <input
          type="text"
          value={field.key ?? ""}
          placeholder="key"
          onChange={(e) => onUpdate({ ...field, key: e.target.value })}
          className={`${INPUT_BASE} w-[30%] flex-shrink-0 font-mono text-[12px]`}
        />

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

        {/* Value — shown for all types except "object" (nested fields handle it) */}
        {field.type !== "object" && (
          <div ref={containerRef} className="relative flex-1 flex items-center gap-1">
            <input
              ref={inputRef}
              type="text"
              value={field.value ?? ""}
              placeholder={
                field.type === "boolean" ? "true / false" :
                field.type === "array"   ? '["a","b"]  or  {{var}}' :
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

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove field"
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg
            text-[#bbb] dark:text-[#444]
            hover:text-[#e05c5c] dark:hover:text-[#c26060]
            hover:bg-[#fef2f2] dark:hover:bg-[#2a1a1a]
            transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Nested properties for object type */}
      {field.type === "object" && canNest && (
        <div className={`${indent} py-1.5`}>
          <ValueFieldList
            fields={field.fields ?? []}
            depth={depth + 1}
            variables={variables}
            onChange={(newFields) => onUpdate({ ...field, fields: newFields })}
          />
        </div>
      )}
    </div>
  );
};

/** Renders a list of ValueFieldRows with an "Add field" button. */
const ValueFieldList = ({ fields, depth, onChange, variables }) => {
  const addRow    = () => onChange([...fields, { key: "", type: "string", value: "" }]);
  const removeRow = (i) => onChange(fields.filter((_, idx) => idx !== i));
  const updateRow = (i, updated) =>
    onChange(fields.map((f, idx) => (idx === i ? updated : f)));

  return (
    <div className="flex flex-col gap-1.5">
      {fields.length === 0 && (
        <p className="text-[11px] text-[#bbb] dark:text-[#555] pl-0.5">
          {depth === 0 ? "No fields added yet." : "No properties yet."}
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
        + Add {depth === 0 ? "field" : "property"}
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
 * Builds a single if/else condition: [variable] [operator] [value?]
 *
 * Operators that compare against a value: is, is not, >, <, >=, <=,
 *   contains, does not contain, starts with, does not start with,
 *   ends with, does not end with.
 * Unary operators (no value needed): is empty, is not empty,
 *   is even, is odd, is true, is false.
 *
 * Stored value shape:
 * { variable: string, operator: string, value: string }
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

// Operators that don't need a comparison value.
const UNARY_OPERATORS = new Set([
  "is even", "is odd", "is empty", "is not empty", "is true", "is false",
]);

const ConditionBuilderField = ({ field, value, onChange, variables }) => {
  const variable = value?.variable ?? "";
  const operator = value?.operator ?? "is";
  const val      = value?.value    ?? "";

  const update = (patch) => onChange({ variable, operator, val, ...value, ...patch });

  const isUnary = UNARY_OPERATORS.has(operator);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Variable selector ── */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-[#777] dark:text-[#555]">
          Variable to check
        </span>
        <VariableSelectorField
          value={variable}
          variables={variables ?? []}
          onChange={(v) => update({ variable: v })}
        />
      </div>

      {/* ── Operator selector ── */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-medium text-[#777] dark:text-[#555]">
          Condition
        </span>
        <div className="relative">
          <select
            value={operator}
            onChange={(e) => update({ operator: e.target.value })}
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
      </div>

      {/* ── Comparison value (hidden for unary operators) ── */}
      {!isUnary && (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium text-[#777] dark:text-[#555]">
            Value
          </span>
          <input
            type="text"
            value={val}
            placeholder="e.g. active, 100, true …"
            onChange={(e) => update({ value: e.target.value })}
            className={INPUT_BASE}
          />
        </div>
      )}

      {/* ── Live preview pill ── */}
      {variable && operator && (
        <div className="px-3 py-2 rounded-lg bg-[#f5f7ff] dark:bg-[#1a1a30]
          border border-[#c7cfe8] dark:border-[#2a2a50] text-[11.5px] font-mono
          text-[#4a6cf7] dark:text-[#6b8aff] break-all leading-snug">
          {variable} <span className="font-bold not-italic">{operator}</span>
          {!isUnary && val ? ` "${val}"` : ""}
        </div>
      )}
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
    onChange({ ...values, [key]: val });
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
            {section.fields.map((field) => (
              <div key={field.key} className="flex flex-col gap-1">
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
