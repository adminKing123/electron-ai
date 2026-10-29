import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { TbX } from "react-icons/tb";
import {
  formatDisplayVariableToken,
  getDisplayFuseNodeId,
  wrapVariableToken,
} from "../../utils/helpers";
import {
  getWebexRoomsAPI,
  getWebexPeopleAPI,
  getSystemVariablesAPI,
  getGithubReposAPI,
  getGithubBranchesAPI,
  getGoogleSheetsSpreadsheetListAPI,
  getGoogleSheetTabsAPI,
  getGoogleSheetColumnsAPI,
} from "../../apis/fuse/queryFunctions";

// --- Timezone options ----------------------------------------------------------
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

// --- Preset value resolver -----------------------------------------------------
/**
 * Converts special dynamic preset tokens into concrete field values.
 *   "today"       ? current date (YYYY-MM-DD)
 *   "next-monday" ? ISO date of next Monday
 *   "+5min"       ? current time + 5 minutes (HH:MM), also sets date to today
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
    const dow = d.getDay(); // 0 = Sunday, 1 = Monday, ...
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

// --- Shared base classes ------------------------------------------------------

/** Base for text / date / time inputs */
const INPUT_BASE =
  "w-full px-3 py-2.5 rounded-lg text-[13px] " +
  "text-ink-875 dark:text-ink-200 " +
  "bg-white dark:bg-void-850 " +
  "border border-ink-200 dark:border-void-775 " +
  "focus:outline-none focus:border-ink-400 dark:focus:border-void-700 " +
  "transition-colors";

/**
 * Base for <select> elements.
 * - appearance-none hides the native OS arrow so we can render our own.
 * - pr-9 leaves room for the custom chevron overlay.
 */
const SELECT_BASE =
  "w-full pl-3 pr-9 py-2.5 rounded-lg text-[13px] appearance-none " +
  "text-ink-875 dark:text-ink-200 " +
  "bg-white dark:bg-void-850 " +
  "border border-ink-200 dark:border-void-775 " +
  "focus:outline-none focus:border-ink-400 dark:focus:border-void-700 " +
  "transition-colors cursor-pointer";

/** Custom chevron icon rendered on top of the select wrapper */
const SelectChevron = () => (
  <span
    aria-hidden
    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2
      text-ink-400 dark:text-ink-550"
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

// --- Field input components ----------------------------------------------------

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
      className="w-4 h-4 rounded border-ink-300 dark:border-void-700
        text-brand-600 focus:ring-brand-600/30
        dark:bg-void-850 dark:checked:bg-brand-600"
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
      <div className={`${INPUT_BASE} text-ink-500 dark:text-ink-600`}>
        Loading spaces...
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
      <p className="text-[12px] text-ink-500 dark:text-ink-600">
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
          Select a space or chat...
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

const GithubRepoSelectField = ({ field, value, onChange }) => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);

    getGithubReposAPI()
      .then((data) => {
        if (!mounted) return;
        setRepos(data.repos ?? []);
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
      <div className={`${INPUT_BASE} text-ink-500 dark:text-ink-600`}>
        Loading repositories...
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-[12px] text-red-500 dark:text-red-400">
        Couldn't load GitHub repos. Reconnect GitHub or try again.
      </p>
    );
  }

  if (!repos.length) {
    return (
      <p className="text-[12px] text-ink-500 dark:text-ink-600">
        No GitHub repositories found.
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
          Select a repository...
        </option>
        {repos.map((repo) => (
          <option key={repo.id} value={repo.id}>
            {repo.label}
          </option>
        ))}
      </select>
      <SelectChevron />
    </div>
  );
};

const GithubBranchSelectField = ({ field, value, onChange, variables, allValues }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const repoName = allValues?.repo_name;

  useEffect(() => {
    if (!repoName) {
        setBranches([]);
        return;
    }
    
    let mounted = true;
    setLoading(true);
    setError(false);

    getGithubBranchesAPI(repoName)
      .then((data) => {
        if (!mounted) return;
        setBranches(data.branches ?? []);
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
  }, [repoName]);

  if (!repoName) {
      return (
        <div className={`${INPUT_BASE} text-ink-500 dark:text-ink-600`}>
          Select a repository first
        </div>
      );
  }

  if (loading) {
    return (
      <div className={`${INPUT_BASE} text-ink-500 dark:text-ink-600`}>
        Loading branches...
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-[12px] text-red-500 dark:text-red-400">
        Couldn't load branches.
      </p>
    );
  }

  if (!branches.length) {
    return (
      <p className="text-[12px] text-ink-500 dark:text-ink-600">
        No branches found.
      </p>
    );
  }

  return (
    <div className="relative flex gap-2">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={SELECT_BASE}
      >
        <option value="">
          -- All branches --
        </option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.label}
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
      <div className={`${INPUT_BASE} text-ink-500 dark:text-ink-600`}>
        Loading people...
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
      <p className="text-[12px] text-ink-500 dark:text-ink-600">
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
          Select a person...
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

// --- Google Sheets field components ------------------------------------------

/**
 * Searchable spreadsheet picker.
 *
 * On open it loads the 25 most-recently-modified spreadsheets.
 * Typing in the search box debounces 400 ms then fires a new API call
 * with the search term so users can find any file by name.
 */
const GoogleSheetsSpreadsheetSelectField = ({ value, onChange }) => {
  const containerRef           = useRef(null);
  const searchRef              = useRef(null);
  const debounceRef            = useRef(null);

  const [open, setOpen]               = useState(false);
  const [searchText, setSearchText]   = useState("");
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus the search input when the dropdown opens
  useEffect(() => {
    if (open) requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  // Fetch spreadsheets (initially and on search)
  const fetchSheets = useCallback((query = "") => {
    setLoading(true);
    setError(false);
    getGoogleSheetsSpreadsheetListAPI({ limit: 25, ...(query ? { search: query } : {}) })
      .then((data) => setSpreadsheets(data.spreadsheets ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  // If a value is already saved (e.g. page refresh / reopen), load the list
  // so we can resolve the human-readable name from the ID.
  useEffect(() => {
    if (value && !selectedLabel) fetchSheets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Once the list loads, find and cache the label for the current value.
  useEffect(() => {
    if (value && !selectedLabel && spreadsheets.length > 0) {
      const match = spreadsheets.find((s) => s.id === value);
      if (match) setSelectedLabel(match.label);
    }
  }, [spreadsheets, value, selectedLabel]);

  // Load on first open (if not already loaded by the label-resolution effect above)
  useEffect(() => {
    if (open && spreadsheets.length === 0 && !loading) fetchSheets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchText(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSheets(q), 400);
  };

  const handleSelect = (sheet) => {
    onChange(sheet.id);
    setSelectedLabel(sheet.label);
    setOpen(false);
    setSearchText("");
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          INPUT_BASE,
          "w-full flex items-center justify-between gap-2 cursor-pointer text-left",
          value ? "" : "text-ink-450 dark:text-ink-550 italic",
        ].join(" ")}
      >
        <span className="truncate text-[13px]">
          {value ? (selectedLabel || value) : "Select a spreadsheet..."}
        </span>
        <svg
          className={`flex-shrink-0 text-ink-400 dark:text-ink-550 transition-transform ${open ? "rotate-180" : ""}`}
          width="14" height="14" viewBox="0 0 14 14" fill="none"
        >
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl overflow-hidden
          bg-white dark:bg-void-825
          border border-ink-150 dark:border-void-775
          shadow-lg flex flex-col"
        >
          {/* Search input */}
          <div className="px-2 pt-2 pb-1.5 border-b border-ink-75 dark:border-void-825">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-450 dark:text-ink-550"
                width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={searchText}
                onChange={handleSearchChange}
                placeholder="Search spreadsheets..."
                className="w-full pl-7 pr-3 py-1.5 rounded-lg text-[13px]
                  bg-ink-50 dark:bg-void-825
                  border border-ink-100 dark:border-void-800
                  text-ink-875 dark:text-ink-200
                  focus:outline-none focus:border-ink-400 dark:focus:border-void-700
                  placeholder-ink-450 dark:placeholder-ink-550"
              />
            </div>
          </div>

          {/* Results */}
          <div className="max-h-52 overflow-y-auto">
            {loading && (
              <div className="px-3 py-4 text-center text-[12px] text-ink-500 dark:text-ink-600">
                Loading...
              </div>
            )}
            {!loading && error && (
              <div className="px-3 py-4 text-center">
                <p className="text-[12px] text-red-500 dark:text-red-400 mb-2">
                  Couldn't load spreadsheets.
                </p>
                <button
                  type="button"
                  onClick={() => fetchSheets(searchText)}
                  className="text-[12px] text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && spreadsheets.length === 0 && (
              <div className="px-3 py-4 text-center text-[12px] text-ink-500 dark:text-ink-600">
                {searchText ? "No spreadsheets match your search." : "No spreadsheets found."}
              </div>
            )}
            {!loading && !error && spreadsheets.map((s) => (
              <button
                key={s.id}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                className={[
                  "w-full text-left px-3 py-2.5 flex items-center gap-2.5 transition-colors",
                  "hover:bg-brand-50 dark:hover:bg-brand-900/30",
                  value === s.id ? "bg-brand-100 dark:bg-brand-950/60" : "",
                ].join(" ")}
              >
                {/* Sheets icon */}
                <svg className="flex-shrink-0 text-brand-600" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-8 13H7v-2h4v2zm0-4H7v-2h4v2zm0-4H7V6h4v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V6h4v2z"/>
                </svg>
                <span className="text-[13px] text-ink-875 dark:text-ink-200 truncate leading-snug">
                  {s.label}
                </span>
                {value === s.id && (
                  <svg className="flex-shrink-0 ml-auto text-brand-600 dark:text-brand-400"
                    width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5l3.5 3.5L11 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Footer hint */}
          {!loading && !error && !searchText && spreadsheets.length > 0 && (
            <div className="px-3 py-1.5 border-t border-ink-75 dark:border-void-825">
              <p className="text-[11px] text-ink-450 dark:text-ink-550">
                Showing latest 25 — type to search all
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/** Dropdown that lists all sheet tabs inside the selected spreadsheet. */
const GoogleSheetsSheetSelectField = ({ value, onChange, allValues }) => {
  const spreadsheetId = allValues?.spreadsheet_id;
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!spreadsheetId) { setSheets([]); return; }
    let mounted = true;
    setLoading(true);
    setError(false);
    getGoogleSheetTabsAPI(spreadsheetId)
      .then((data) => { if (mounted) setSheets(data.sheets ?? []); })
      .catch(() => { if (mounted) setError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [spreadsheetId]);

  if (!spreadsheetId) return <div className={`${INPUT_BASE} text-ink-500 dark:text-ink-600`}>Select a spreadsheet first</div>;
  if (loading)        return <div className={`${INPUT_BASE} text-ink-500 dark:text-ink-600`}>Loading sheets...</div>;
  if (error)          return <p className="text-[12px] text-red-500 dark:text-red-400">Couldn't load sheet tabs. Try again.</p>;
  if (!sheets.length) return <p className="text-[12px] text-ink-500 dark:text-ink-600">No sheets found in this spreadsheet.</p>;

  return (
    <div className="relative">
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={SELECT_BASE}>
        <option value="" disabled>Select a sheet tab...</option>
        {sheets.map((s) => (
          <option key={s.id} value={s.id}>{s.label}</option>
        ))}
      </select>
      <SelectChevron />
    </div>
  );
};

/**
 * Dynamic column builder — fetches header row from the selected sheet and renders
 * one variable_text input per column. The stored value shape is a plain object:
 * { "Column Name": "value or {{variable}}", ... }
 */
const GoogleSheetsColumnBuilderField = ({ value, onChange, allValues, variables }) => {
  const spreadsheetId = allValues?.spreadsheet_id;
  const sheetName     = allValues?.sheet_name;

  const [columns, setColumns]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(false);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    if (!spreadsheetId || !sheetName) { setColumns([]); return; }
    let mounted = true;
    setLoading(true);
    setError(false);
    getGoogleSheetColumnsAPI(spreadsheetId, sheetName)
      .then((data) => { if (mounted) setColumns(data.columns ?? []); })
      .catch(() => { if (mounted) setError(true); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  // fetchKey lets user manually refresh without changing sheet selection
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spreadsheetId, sheetName, fetchKey]);

  const handleColChange = (colName, colValue) => {
    onChange({ ...(value || {}), [colName]: colValue });
  };

  if (!spreadsheetId || !sheetName) {
    return (
      <p className="text-[12px] text-ink-450 dark:text-ink-550">
        Select a spreadsheet and sheet tab above to load columns.
      </p>
    );
  }

  if (loading) {
    return <div className={`${INPUT_BASE} text-ink-500 dark:text-ink-600`}>Loading columns...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[12px] text-red-500 dark:text-red-400">
          Couldn't load columns. Make sure the sheet has a header row.
        </p>
        <button
          type="button"
          onClick={() => setFetchKey((k) => k + 1)}
          className="self-start px-2.5 py-1 rounded-lg text-[12px]
            border border-ink-200 dark:border-void-775
            text-ink-700 dark:text-ink-450
            hover:bg-ink-50 dark:hover:bg-void-825
            transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!columns.length) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[12px] text-ink-500 dark:text-ink-600">
          No columns found. Make sure row 1 of the sheet contains header names.
        </p>
        <button
          type="button"
          onClick={() => setFetchKey((k) => k + 1)}
          className="self-start px-2.5 py-1 rounded-lg text-[12px]
            border border-ink-200 dark:border-void-775
            text-ink-700 dark:text-ink-450
            hover:bg-ink-50 dark:hover:bg-void-825
            transition-colors"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {columns.map((col) => (
        <div key={col} className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-ink-650 dark:text-ink-500">{col}</label>
          <VariableTextField
            field={{ placeholder: "Enter @ to add variables" }}
            value={(value || {})[col] ?? ""}
            onChange={(v) => handleColChange(col, v)}
            variables={variables}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => setFetchKey((k) => k + 1)}
        className="self-start mt-0.5 px-2.5 py-1 rounded-lg text-[12px]
          border border-ink-200 dark:border-void-775
          text-ink-500 dark:text-ink-600
          hover:bg-ink-50 dark:hover:bg-void-825
          hover:border-ink-300 dark:hover:border-void-725
          transition-colors"
      >
        ? Refresh columns
      </button>
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

// --- Variable picker shared hook ----------------------------------------------
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

/** Close a floating picker when the user clicks outside its container. */
const usePickerDismiss = (containerRef, isOpen, setOpen) => {
  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [isOpen, containerRef, setOpen]);
};

const VARIABLE_INSERT_BTN_CLASS =
  "flex-shrink-0 w-7 h-[38px] flex items-center justify-center rounded-lg " +
  "text-[11px] font-mono font-bold text-ink-500 dark:text-ink-550 " +
  "border border-ink-200 dark:border-void-775 " +
  "hover:text-brand-600 dark:hover:text-brand-400 " +
  "hover:border-brand-200 dark:hover:border-brand-800/50 " +
  "hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors";

/** Text input with @ variable insertion (shared by value builders). */
const VariableTextInput = ({ value, onChange, variables, placeholder, className = "" }) => {
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const insertVariable = useVariableInserter(inputRef, value ?? "", onChange);
  usePickerDismiss(containerRef, pickerOpen, setPickerOpen);

  return (
    <div ref={containerRef} className={`relative flex items-center gap-1 w-full ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value ?? ""}
        placeholder={placeholder ?? "value  or  {{var}}"}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_BASE} flex-1 text-[12px]`}
      />
      <button
        type="button"
        title="Insert variable"
        onMouseDown={(e) => { e.preventDefault(); setPickerOpen((o) => !o); }}
        className={VARIABLE_INSERT_BTN_CLASS}
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
  );
};

/**
 * Strips the node name prefix from a label to get just the field path.
 * e.g. "My Webhook.body.email" → "body.email"
 *      "HTTP Node · body" → "body"
 */
const getShortLabel = (label, nodeName) => {
  if (!nodeName || !label) return label;
  for (const sep of [".", " · ", " ? "]) {
    const prefix = `${nodeName}${sep}`;
    if (label.startsWith(prefix)) return label.slice(prefix.length);
  }
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
const VariablePicker = ({ variables, onPick, onClose, filterArrays = false }) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [systemVarsOpen, setSystemVarsOpen] = useState(false);
  const [systemVars, setSystemVars] = useState(null);
  const [selectedTimezone, setSelectedTimezone] = useState(() =>
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  );
  const [selectedFormat, setSelectedFormat] = useState("iso");
  const [customFormat, setCustomFormat] = useState("DD/MM/YYYY");

  /** Group variables by nodeId. Falls back to token prefix for legacy vars. */
  const groups = useMemo(() => {
    const map = new Map();
    const src = filterArrays ? variables.filter((v) => v.isArray) : variables;
    src.forEach((v) => {
      const nid      = v.nodeId   ?? v.token.split(".")[0];
      const nname    = v.nodeName ?? nid;
      const starter  = v.isStarter ?? false;
      if (!map.has(nid)) map.set(nid, { nodeId: nid, nodeName: nname, isStarter: starter, vars: [] });
      map.get(nid).vars.push(v);
    });
    return [...map.values()];
  }, [variables, filterArrays]);

  const WRAPPER =
    "absolute z-50 right-0 top-full mt-1 w-64 rounded-xl " +
    "bg-white dark:bg-void-825 " +
    "border border-ink-150 dark:border-void-775 " +
    "shadow-lg overflow-hidden flex flex-col";

  const fetchSystemVars = async () => {
    setSystemVarsOpen(true);
    if (!systemVars) {
      try {
        const data = await getSystemVariablesAPI();
        setSystemVars(data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  /* -- System Variables Panel -- */
  if (systemVarsOpen) {
    return (
      <div className={WRAPPER}>
        <div className="flex items-center gap-1.5 px-2 pt-2 pb-1.5 border-b border-ink-75 dark:border-void-825">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSystemVarsOpen(false); }}
            className="w-6 h-6 flex items-center justify-center rounded-md
              text-ink-400 dark:text-ink-550 hover:text-ink-650 dark:hover:text-ink-400
              hover:bg-ink-75 dark:hover:bg-void-800 transition-colors flex-shrink-0"
            aria-label="Back to nodes"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-[12px] font-semibold text-ink-750 dark:text-ink-300 truncate">
            Runtime Variables
          </span>
        </div>

        {!systemVars ? (
          <div className="px-3 py-6 text-center text-[12px] text-ink-500 dark:text-ink-600">
            Loading...
          </div>
        ) : (
          <div className="max-h-52 overflow-y-auto pb-1.5 pt-0.5 flex flex-col">
            <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-450 dark:text-ink-600">
              Metadata
            </div>
            <ul>
              {systemVars.variables.filter(v => v.group === "Metadata").map(v => (
                <li key={v.token}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); onPick(v.token); onClose(); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
                  >
                    <span className="block text-[12px] font-medium text-ink-875 dark:text-ink-200">{v.label}</span>
                    <span
                      className="block text-[11px] font-mono text-brand-600 dark:text-brand-400 truncate"
                      title={wrapVariableToken(v.token)}
                    >
                      {formatDisplayVariableToken(v.token)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-450 dark:text-ink-600">
              Date & Time
            </div>
            
            <div className="px-3 py-1.5 flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="relative flex-[3]">
                  <select
                    value={selectedTimezone}
                    onChange={(e) => setSelectedTimezone(e.target.value)}
                    className="w-full pl-2 pr-6 py-1.5 text-[12px] appearance-none rounded-lg bg-ink-50 dark:bg-void-850 border border-ink-150 dark:border-void-800 outline-none text-ink-875 dark:text-ink-300 cursor-pointer"
                  >
                    {TIMEZONE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-550">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                
                <div className="relative flex-[2]">
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full pl-2 pr-6 py-1.5 text-[12px] appearance-none rounded-lg bg-ink-50 dark:bg-void-850 border border-ink-150 dark:border-void-800 outline-none text-ink-875 dark:text-ink-300 cursor-pointer"
                  >
                    <option value="iso">ISO 8601</option>
                    <option value="date">Date (YYYY-MM-DD)</option>
                    <option value="time">Time (HH:MM:SS)</option>
                    <option value="unix">Unix Epoch</option>
                    <option value="custom">Custom...</option>
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-550">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
              
              {selectedFormat === "custom" && (
                <input
                  type="text"
                  value={customFormat}
                  onChange={(e) => setCustomFormat(e.target.value)}
                  placeholder="e.g. DD/MM/YYYY hh:mm A"
                  className="w-full px-2 py-1.5 text-[11px] rounded-lg bg-ink-50 dark:bg-void-850 border border-ink-150 dark:border-void-800 outline-none text-ink-875 dark:text-ink-300"
                />
              )}

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const fmt = selectedFormat === "custom" ? customFormat : selectedFormat;
                  const token = fmt === "iso"
                    ? `system.datetime.${selectedTimezone}`
                    : `system.datetime.${selectedTimezone}.${fmt}`;
                  onPick(token);
                  onClose();
                }}
                className="w-full text-center px-3 py-1.5 rounded-lg bg-ink-75 dark:bg-brand-900/30 text-ink-750 dark:text-ink-200 border border-ink-200 dark:border-brand-800/50 hover:bg-ink-150 dark:hover:bg-brand-900/45 transition-colors text-[12px] font-medium"
              >
                Insert Datetime Variable
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* -- Step 2: variables for the selected node -- */
  if (selectedNodeId !== null) {
    const group = groups.find((g) => g.nodeId === selectedNodeId);
    if (!group) { setSelectedNodeId(null); return null; }

    return (
      <div className={WRAPPER}>
        {/* Header row with back button */}
        <div className="flex items-center gap-1.5 px-2 pt-2 pb-1.5
          border-b border-ink-75 dark:border-void-825">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedNodeId(null); }}
            className="w-6 h-6 flex items-center justify-center rounded-md
              text-ink-400 dark:text-ink-550
              hover:text-ink-650 dark:hover:text-ink-400
              hover:bg-ink-75 dark:hover:bg-void-800
              transition-colors flex-shrink-0"
            aria-label="Back to nodes"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2L3.5 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <span className="text-[12px] font-semibold text-ink-750 dark:text-ink-300 truncate">
            {group.nodeName}
          </span>
        </div>

        <ul className="max-h-52 overflow-y-auto pb-1.5 pt-0.5">
          {[...group.vars]
            .sort((a, b) => (b.isRoot ? 1 : 0) - (a.isRoot ? 1 : 0))
            .map((v) => {
              const builtin = v.isBuiltin === true;
              return (
            <li key={v.token}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); onPick(v.token); onClose(); }}
                className={[
                  "w-full text-left px-3 py-2 flex flex-col gap-0.5 transition-colors",
                  builtin
                    ? "hover:bg-teal-50 dark:hover:bg-teal-950/40"
                    : "hover:bg-brand-50 dark:hover:bg-brand-900/30",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-[12px] font-medium truncate",
                    builtin
                      ? "text-teal-800 dark:text-teal-300"
                      : "text-ink-875 dark:text-ink-200",
                  ].join(" ")}
                >
                  {v.isRoot ? "body" : getShortLabel(v.label, group.nodeName)}
                </span>
                <span
                  className={[
                    "text-[11px] font-mono truncate",
                    builtin
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-brand-600 dark:text-brand-400",
                  ].join(" ")}
                  title={wrapVariableToken(v.token)}
                >
                  {formatDisplayVariableToken(v.token)}
                </span>
              </button>
            </li>
              );
            })}
        </ul>
      </div>
    );
  }

  /* -- Step 1: node list -- */
  return (
    <div className={WRAPPER}>
      {!variables.length ? (
        <div className="p-3 border-b border-ink-75 dark:border-void-825">
          <p className="text-[12px] text-ink-450 dark:text-ink-550 text-center select-none">
            No variables available yet.<br />
            Define fields in the webhook body.
          </p>
        </div>
      ) : (
        <>
          <p className="px-3 pt-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider
            text-ink-450 dark:text-ink-600">
            Pick a node
          </p>
          <ul className="max-h-52 overflow-y-auto pb-1.5">
            {groups.map((g) => (
              <li key={g.nodeId}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedNodeId(g.nodeId); }}
                  className="w-full text-left px-3 py-2 flex items-center justify-between gap-2
                    hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[12px] font-medium text-ink-875 dark:text-ink-200 truncate">
                      {g.nodeName}
                    </span>
                    {!g.isStarter && (
                      <span className="text-[11px] font-mono text-ink-400 dark:text-ink-550 truncate">
                        {getDisplayFuseNodeId(g.nodeId)}
                      </span>
                    )}
                  </div>
                  {/* Chevron right */}
                  <svg className="flex-shrink-0 text-ink-400 dark:text-ink-600"
                    width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M4.5 2L8.5 6l-4 4" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      
      <div className="border-t border-ink-75 dark:border-void-825 p-1.5">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); fetchSystemVars(); }}
          className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-2
            bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800/50
            hover:bg-brand-100 dark:hover:bg-brand-900/35 transition-colors"
        >
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[12px] font-semibold text-brand-700 dark:text-brand-300 truncate">
              Runtime Variables
            </span>
            <span className="text-[11px] text-brand-600 dark:text-brand-400 truncate">
              Datetime, Run ID, etc.
            </span>
          </div>
          <svg className="flex-shrink-0 text-brand-600 dark:text-brand-400"
            width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4.5 2L8.5 6l-4 4" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

/** Text input that supports `@` variable insertion via a picker button. */
const VariableTextField = ({ field, value, onChange, variables }) => {
  const inputRef     = useRef(null);
  const containerRef = useRef(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const insertVariable = useVariableInserter(inputRef, value, onChange);
  const filterArrays = field.filterArrays === true;

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
            text-ink-500 dark:text-ink-550
            border border-ink-200 dark:border-void-775
            hover:text-brand-600 dark:hover:text-brand-400
            hover:border-brand-200 dark:hover:border-brand-800/50
            hover:bg-brand-50 dark:hover:bg-brand-950/40
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
          filterArrays={filterArrays}
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
            text-ink-500 dark:text-ink-550
            border border-ink-200 dark:border-void-775
            hover:text-brand-600 dark:hover:text-brand-400
            hover:border-brand-200 dark:hover:border-brand-800/50
            hover:bg-brand-50 dark:hover:bg-brand-950/40
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

// --- BodyBuilderField ---------------------------------------------------------
/**
 * Recursive, visual-only body schema builder.
 *
 * Stored value shape:
 * {
 *   mode:     "visual",
 *   rootType: "object" | "array" | "string" | "number" | "boolean",
 *   fields:   FieldNode[],  // object root
 *   items:    { type, fields? },  // array root
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
const JSON_NESTED_FIELD_TYPES = ["string", "number", "boolean", "array", "object"];
const ROOT_JSON_TYPES = ["object", "array", "string", "number", "boolean"];
const JSON_NESTED_MAX_DEPTH = 4;
const JSON_ENVELOPE_FIELD_TYPES = new Set(["body_builder", "json_value_builder"]);
const coerceRootType = (raw) =>
  ROOT_JSON_TYPES.includes(raw) ? raw : "object";

const patchVisualEnvelope = (value, rootType, patch) =>
  ({ mode: "visual", rootType: coerceRootType(rootType ?? value?.rootType), ...patch });

const applyJsonEnvelopeRootType = (value, newRoot, { isValueBuilder = false } = {}) => {
  const current = value && typeof value === "object" ? value : { mode: "visual" };
  const next = { mode: "visual", rootType: newRoot };
  if (newRoot === "object") {
    next.fields = current.fields ?? [];
  } else if (newRoot === "array") {
    if (isValueBuilder) next.elements = current.elements ?? [];
    else next.items = current.items ?? { type: "string" };
  } else {
    next.value = current.value ?? "";
  }
  return next;
};

const JSON_ROOT_SELECT_CLASS =
  "w-full pl-2 pr-6 py-1 rounded-md text-[11px] font-mono appearance-none " +
  "text-ink-700 dark:text-ink-350 bg-white dark:bg-void-850 " +
  "border border-ink-200 dark:border-void-775 " +
  "focus:outline-none focus:border-ink-400 dark:focus:border-void-700 " +
  "transition-colors cursor-pointer";

/** Compact root-type dropdown beside the field title (no separate label). */
const JsonRootTypeDropdown = ({ value, onChange }) => (
  <div className="relative flex-shrink-0 w-[7.25rem]">
    <select
      value={coerceRootType(value)}
      onChange={(e) => onChange(e.target.value)}
      aria-label="JSON root type"
      className={JSON_ROOT_SELECT_CLASS}
    >
      {ROOT_JSON_TYPES.map((t) => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>
    <span
      aria-hidden
      className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-550"
    >
      <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
        <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  </div>
);

const NESTED_INDENT = "ml-5 pl-3 border-l border-ink-150 dark:border-void-800";

const RemoveFieldButton = ({ onClick, className = "", ariaLabel = "Remove field" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={
      "flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg " +
      "text-ink-450 dark:text-ink-600 " +
      "hover:text-[#e05c5c] dark:hover:text-[#c26060] " +
      "hover:bg-[#fef2f2] dark:hover:bg-[#2a1a1a] " +
      "transition-colors " +
      className
    }
  >
    <TbX size={15} strokeWidth={2} />
  </button>
);

/** Schema builder: array item type (+ nested object properties). Used in rows and at array root. */
const SchemaArrayItemsEditor = ({
  items,
  depth,
  showDescription,
  showEnum,
  onChange,
  className = "",
}) => {
  const itemType = items?.type ?? "string";
  const canNest = depth < JSON_NESTED_MAX_DEPTH;

  const handleItemsTypeChange = (newType) => {
    const next = { ...(items ?? {}), type: newType };
    if (newType === "object") next.fields = items?.fields ?? [];
    onChange(next);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-ink-450 dark:text-ink-550 whitespace-nowrap">
          Items type:
        </span>
        <div className="relative w-28">
          <select
            value={itemType}
            onChange={(e) => handleItemsTypeChange(e.target.value)}
            className={SELECT_BASE}
          >
            {JSON_NESTED_FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <SelectChevron />
        </div>
      </div>
      {itemType === "object" && canNest && (
        <SchemaFieldList
          fields={items?.fields ?? []}
          depth={depth + 1}
          label="Object properties"
          showDescription={showDescription}
          showEnum={showEnum}
          onChange={(newFields) =>
            onChange({ ...(items ?? {}), type: "object", fields: newFields })
          }
        />
      )}
    </div>
  );
};

/**
 * Renders one field row: [key input] [type select] [remove]
 * Expands below with nested content for "object" and "array" types.
 */
const SchemaFieldRow = ({ field, depth, onUpdate, onRemove }) => {
  const handleTypeChange = (newType) => {
    const updated = { ...field, type: newType };
    if (newType === "object") updated.fields = field.fields ?? [];
    if (newType === "array")  updated.items  = field.items  ?? { type: "string" };
    onUpdate(updated);
  };

  const canNest = depth < JSON_NESTED_MAX_DEPTH;

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
            {JSON_NESTED_FIELD_TYPES.map((t) => (
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
        <RemoveFieldButton onClick={onRemove} />
      </div>

      {field.type === "array" && (
        <SchemaArrayItemsEditor
          className={`${NESTED_INDENT} py-1.5`}
          items={field.items}
          depth={depth}
          showDescription={field.showDescription}
          showEnum={field.showEnum}
          onChange={(items) => onUpdate({ ...field, items })}
        />
      )}

      {field.type === "object" && canNest && (
        <div className={`${NESTED_INDENT} py-1.5`}>
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
        <span className="text-[12px] font-medium text-ink-650 dark:text-ink-500">
          {label}
        </span>
      )}
      {fields.length === 0 && (
        <p className="text-[11px] text-ink-450 dark:text-ink-550 pl-0.5">
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
          border border-ink-200 dark:border-void-775
          text-ink-700 dark:text-ink-450
          hover:bg-ink-50 dark:hover:bg-void-825
          hover:border-ink-300 dark:hover:border-void-725
          transition-colors"
      >
        + Add {depth === 0 ? "field" : "property"}
      </button>
    </div>
  );
};

const BodyBuilderField = ({ field, value, onChange }) => {
  const rootType = coerceRootType(value?.rootType);

  const commit = (patch) => onChange(patchVisualEnvelope(value, rootType, patch));

  return (
    <div className="flex flex-col gap-1">
      {rootType === "object" && (
        <SchemaFieldList
          fields={value?.fields ?? []}
          depth={0}
          showDescription={field.showDescription}
          showEnum={field.showEnum}
          onChange={(fields) => commit({ fields })}
        />
      )}
      {rootType === "array" && (
        <SchemaArrayItemsEditor
          className="ml-0.5"
          items={value?.items}
          depth={0}
          showDescription={field.showDescription}
          showEnum={field.showEnum}
          onChange={(items) => commit({ items })}
        />
      )}
    </div>
  );
};

// --- JsonValueBuilderField (value rows; envelope root type is on the label row) -
const ValueFieldRow = ({ field, depth, onUpdate, onRemove, variables }) => {
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

  const canNest = depth < JSON_NESTED_MAX_DEPTH;

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
            {JSON_NESTED_FIELD_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <SelectChevron />
        </div>

        <RemoveFieldButton onClick={onRemove} className="ml-auto" />
      </div>

      {/* Value row — shown for all types except "object" (nested fields handle it) */}
      {field.type !== "object" && field.type !== "array" && (
        <VariableTextInput
          className="mt-1"
          value={field.value ?? ""}
          variables={variables}
          placeholder={field.type === "boolean" ? "true / false" : undefined}
          onChange={(v) => onUpdate({ ...field, value: v })}
        />
      )}

      {field.type === "object" && canNest && (
        <div className={`${NESTED_INDENT} py-1.5 mt-1`}>
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
        <div className={`${NESTED_INDENT} py-1.5 mt-1`}>
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
        <p className="text-[11px] text-ink-450 dark:text-ink-550 pl-0.5">
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
          border border-ink-200 dark:border-void-775
          text-ink-700 dark:text-ink-450
          hover:bg-ink-50 dark:hover:bg-void-825
          hover:border-ink-300 dark:hover:border-void-725
          transition-colors"
      >
        + Add {isArray ? "item" : depth === 0 ? "field" : "property"}
      </button>
    </div>
  );
};

const JsonValueBuilderField = ({ field, value, onChange, variables }) => {
  const rootType = coerceRootType(value?.rootType);
  const commit = (patch) => onChange(patchVisualEnvelope(value, rootType, patch));

  return (
    <div className="flex flex-col gap-1">
      {rootType === "object" && (
        <ValueFieldList
          fields={value?.fields ?? []}
          depth={0}
          variables={variables}
          onChange={(fields) => commit({ fields })}
        />
      )}
      {rootType === "array" && (
        <ValueFieldList
          fields={value?.elements ?? []}
          depth={0}
          variables={variables}
          isArray
          onChange={(elements) => commit({ elements })}
        />
      )}
      {rootType !== "object" && rootType !== "array" && (
        <VariableTextInput
          value={value?.value ?? ""}
          variables={variables}
          placeholder={rootType === "boolean" ? "true / false" : undefined}
          onChange={(v) => commit({ value: v })}
        />
      )}
    </div>
  );
};

// --- KeyValueBuilderField ------------------------------------------------------
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
        className={`px-3 py-2.5 rounded-lg text-[13px] text-ink-875 dark:text-ink-200 bg-white dark:bg-void-850 border border-ink-200 dark:border-void-775 focus:outline-none focus:border-ink-400 dark:focus:border-void-700 transition-colors w-[35%] flex-shrink-0 font-mono`}
      />
      <div ref={containerRef} className="relative flex-1 flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={field.value ?? ""}
          placeholder="value or {{var}}"
          onChange={(e) => onUpdate({ ...field, value: e.target.value })}
          className={`px-3 py-2.5 rounded-lg text-[13px] text-ink-875 dark:text-ink-200 bg-white dark:bg-void-850 border border-ink-200 dark:border-void-775 focus:outline-none focus:border-ink-400 dark:focus:border-void-700 transition-colors flex-1`}
        />
        <button
          type="button"
          title="Insert variable"
          onMouseDown={(e) => { e.preventDefault(); setPickerOpen((o) => !o); }}
          className="flex-shrink-0 w-7 h-[38px] flex items-center justify-center rounded-lg
            text-[11px] font-mono font-bold
            text-ink-500 dark:text-ink-550
            border border-ink-200 dark:border-void-775
            hover:text-brand-600 dark:hover:text-brand-400
            hover:border-brand-200 dark:hover:border-brand-800/50
            hover:bg-brand-50 dark:hover:bg-brand-950/40
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
      <RemoveFieldButton onClick={onRemove} />
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
        <p className="text-[11px] text-ink-450 dark:text-ink-550 pl-0.5">
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
          border border-ink-200 dark:border-void-775
          text-ink-700 dark:text-ink-450
          hover:bg-ink-50 dark:hover:bg-void-825
          hover:border-ink-300 dark:hover:border-void-725
          transition-colors"
      >
        + Add item
      </button>
    </div>
  );
};

// --- VariableSelectorField ---------------------------------------------------
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
              ? "text-brand-600 dark:text-brand-400"
              : "text-ink-450 dark:text-ink-550 italic",
          ].join(" ")}
        >
          {value || "— click @ to pick a variable —"}
        </div>

        {/* Clear */}
        {value && (
          <RemoveFieldButton
            onClick={() => onChange("")}
            ariaLabel="Clear variable"
            className="h-[38px] w-7"
          />
        )}

        {/* Open picker */}
        <button
          type="button"
          title="Pick variable"
          onMouseDown={(e) => { e.preventDefault(); setPickerOpen((o) => !o); }}
          className="flex-shrink-0 w-8 h-[38px] flex items-center justify-center rounded-lg
            text-[12px] font-mono font-bold
            text-ink-500 dark:text-ink-550
            border border-ink-200 dark:border-void-775
            hover:text-brand-600 dark:hover:text-brand-400
            hover:border-brand-200 dark:hover:border-brand-800/50
            hover:bg-brand-50 dark:hover:bg-brand-950/40
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

// --- ConditionBuilderField ----------------------------------------------------
/**
 * Builds compound AND/OR conditions for the if/else node.
 *
 * Each condition row: [variable picker] [operator] [value?] [remove]
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
      bg-ink-25 dark:bg-void-850
      border border-ink-100 dark:border-void-825">

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
              text-ink-450 dark:text-ink-600
              border border-ink-150 dark:border-void-800
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
            placeholder="value..."
            onChange={(e) => update({ value: e.target.value })}
            className={`${INPUT_BASE} flex-1`}
          />
        )}
      </div>

      {/* Live preview */}
      {cond.variable && operator && (
        <div className="px-2.5 py-1.5 rounded-lg
          bg-brand-50 dark:bg-brand-950/40
          border border-brand-200 dark:border-brand-900/50
          text-[11px] font-mono text-brand-600 dark:text-brand-400 break-all leading-snug">
          {cond.variable} <span className="font-bold">{operator}</span>
          {!isUnary && cond.value ? ` "${cond.value}"` : ""}
        </div>
      )}
    </div>
  );
};

const DEFAULT_SWITCH_CASE = (index) => ({
  id: `case_${index}`,
  label: `Case ${index + 1}`,
  condition: normaliseConditionValue(null),
});

const normaliseSwitchCases = (raw) => {
  if (!Array.isArray(raw) || raw.length === 0) {
    return [DEFAULT_SWITCH_CASE(0), DEFAULT_SWITCH_CASE(1)];
  }
  return raw.map((c, index) => ({
    id: c.id || `case_${index}`,
    label: c.label || `Case ${index + 1}`,
    condition: normaliseConditionValue(c.condition),
  }));
};

const nextSwitchCaseId = (cases) => {
  let max = -1;
  for (const c of cases) {
    const match = /^case_(\d+)$/.exec(c.id || "");
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `case_${max + 1}`;
};

const SwitchCasesBuilderField = ({ field, value, onChange, variables }) => {
  const cases = normaliseSwitchCases(value);

  const setCases = (next) => onChange(next);

  const updateCase = (index, patch) => {
    setCases(cases.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const addCase = () => {
    const id = nextSwitchCaseId(cases);
    setCases([
      ...cases,
      {
        id,
        label: `Case ${cases.length + 1}`,
        condition: normaliseConditionValue(null),
      },
    ]);
  };

  const removeCase = (index) => {
    if (cases.length <= 1) return;
    setCases(cases.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-3">
      {cases.map((c, index) => (
        <div
          key={c.id}
          className="rounded-xl border border-ink-100 dark:border-void-825
            bg-ink-25 dark:bg-void-850 p-3 flex flex-col gap-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-450 dark:text-ink-550 flex-shrink-0">
              Case {index + 1}
            </span>
            <input
              type="text"
              value={c.label}
              onChange={(e) => updateCase(index, { label: e.target.value })}
              placeholder="Branch label"
              className={`${INPUT_BASE} flex-1 min-w-0 text-[13px]`}
            />
            {cases.length > 1 && (
              <RemoveFieldButton
                onClick={() => removeCase(index)}
                ariaLabel="Remove case"
                className="w-8 h-8 border border-ink-150 dark:border-void-800 hover:border-[#fcc]"
              />
            )}
          </div>
          <p className="text-[11px] font-mono text-ink-400 dark:text-ink-550">
            Output handle: <span className="text-brand-600 dark:text-brand-400">{c.id}</span>
          </p>
          <ConditionBuilderField
            field={{ ...field, label: "When" }}
            value={c.condition}
            onChange={(cond) => updateCase(index, { condition: cond })}
            variables={variables}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addCase}
        className="flex items-center gap-1.5 self-start px-3 py-1.5 rounded-lg text-[12px]
          text-brand-600 dark:text-brand-400
          border border-brand-200 dark:border-brand-900/50
          hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        Add case
      </button>

      <p className="text-[11px] text-ink-450 dark:text-ink-550 leading-snug">
        Cases run top to bottom; the first match routes the workflow. Connect the{" "}
        <span className="font-medium">Default</span> handle when no case matches.
      </p>
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
              <div className="flex-1 h-px bg-ink-100 dark:bg-void-825" />
              <div className="flex rounded-lg overflow-hidden border border-ink-200 dark:border-void-775">
                {["and", "or"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => updateCombinator(c)}
                    className={[
                      "px-3 py-1 text-[11px] font-bold uppercase tracking-widest transition-colors",
                      group.combinator === c
                        ? "bg-brand-600 text-white"
                        : "text-ink-450 dark:text-ink-550 hover:bg-ink-75 dark:hover:bg-void-875",
                    ].join(" ")}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="flex-1 h-px bg-ink-100 dark:bg-void-825" />
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
          text-brand-600 dark:text-brand-400
          border border-brand-200 dark:border-brand-900/50
          hover:bg-brand-50 dark:hover:bg-brand-950/40
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
const FieldInput = ({ field, value, onChange, variables = [], allValues = {} }) => {
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
    case "switch_cases_builder":
      return <SwitchCasesBuilderField field={field} value={value} onChange={onChange} variables={variables} />;
    case "json_value_builder":  return <JsonValueBuilderField   field={field} value={value} onChange={onChange} variables={variables} />;
    case "key_value_builder":   return <KeyValueBuilderField    field={field} value={value} onChange={onChange} variables={variables} />;
    case "checkbox":            return <CheckboxField           field={field} value={value} onChange={onChange} />;
    case "webex_room_select":   return <WebexRoomSelectField     field={field} value={value} onChange={onChange} />;
    case "webex_person_select": return <WebexPersonSelectField   field={field} value={value} onChange={onChange} />;
    case "github_repo_select":  return <GithubRepoSelectField    field={field} value={value} onChange={onChange} />;
    case "github_branch_select":return <GithubBranchSelectField  field={field} value={value} onChange={onChange} variables={variables} allValues={allValues} />;
    case "google_sheets_spreadsheet_select": return <GoogleSheetsSpreadsheetSelectField value={value} onChange={onChange} />;
    case "google_sheets_sheet_select":       return <GoogleSheetsSheetSelectField       value={value} onChange={onChange} allValues={allValues} />;
    case "google_sheets_column_builder":     return <GoogleSheetsColumnBuilderField     value={value} onChange={onChange} allValues={allValues} variables={variables} />;
    case "select":
    default:                    return <SelectField             field={field} value={value} onChange={onChange} />;
  }
};

// --- FormBuilder ---------------------------------------------------------------
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
    if (key === "watch_target" && val !== "repo") {
      delete next.repo_name;
      delete next.branch_name;
    }
    if (key === "repo_name") {
      delete next.branch_name;
    }
    if (key === "spreadsheet_id") {
      delete next.sheet_name;
      delete next.column_data;
    }
    if (key === "sheet_name") {
      delete next.column_data;
    }
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* -- Quick preset buttons ------------------------------------------- */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePreset(preset)}
              className="px-3 py-1.5 rounded-lg text-[12px]
                border border-ink-200 dark:border-void-775
                text-ink-700 dark:text-ink-450
                hover:bg-ink-50 dark:hover:bg-void-825
                hover:border-ink-300 dark:hover:border-void-725
                transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* -- Form sections --------------------------------------------------- */}
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="flex flex-col gap-3">
          {/* Section heading */}
          {section.title && (
            <p className="text-[13px] font-semibold text-ink-750 dark:text-ink-300">
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
                {/* Field label (+ JSON root picker for envelope builders) */}
                <div className="flex items-center justify-between gap-3 min-h-[1.5rem]">
                  <label className="text-[12px] font-medium text-ink-650 dark:text-ink-500 min-w-0">
                    {field.label}
                    {field.required && (
                      <span className="text-[#e05] ml-0.5">*</span>
                    )}
                  </label>
                  {JSON_ENVELOPE_FIELD_TYPES.has(field.type) && (
                    <JsonRootTypeDropdown
                      value={values[field.key]?.rootType}
                      onChange={(newRoot) =>
                        handleFieldChange(
                          field.key,
                          applyJsonEnvelopeRootType(values[field.key], newRoot, {
                            isValueBuilder: field.type === "json_value_builder",
                          }),
                        )
                      }
                    />
                  )}
                </div>

                {/* Input */}
                <FieldInput
                  field={field}
                  value={values[field.key]}
                  onChange={(val) => handleFieldChange(field.key, val)}
                  variables={variables}
                  allValues={values}
                />

                {/* Hint below the input (e.g. "MM/DD/YYYY") */}
                {field.hint && (
                  <span className="text-[11px] text-ink-450 dark:text-ink-550">
                    {field.hint}
                  </span>
                )}

                {/* Contextual note after the field block */}
                {field.after_hint && (
                  <span className="text-[12px] leading-relaxed text-ink-500 dark:text-ink-550 mt-0.5">
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
