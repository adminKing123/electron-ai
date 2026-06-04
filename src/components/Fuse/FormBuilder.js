import React, { useMemo } from "react";

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

/**
 * Dispatch to the correct input component based on field.type.
 * Supported types: "date" | "time" | "select" | "timezone_select"
 */
const FieldInput = ({ field, value, onChange }) => {
  switch (field.type) {
    case "text":            return <TextField     field={field} value={value} onChange={onChange} />;
    case "textarea":        return <TextareaField  field={field} value={value} onChange={onChange} />;
    case "number":          return <NumberField    field={field} value={value} onChange={onChange} />;
    case "date":            return <DateField      value={value} onChange={onChange} />;
    case "time":            return <TimeField      value={value} onChange={onChange} />;
    case "timezone_select": return <TimezoneSelectField value={value} onChange={onChange} />;
    case "select":
    default:                return <SelectField   field={field} value={value} onChange={onChange} />;
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
const FormBuilder = ({ configForm, values = {}, onChange }) => {
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
