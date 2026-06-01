import { collection, getDocs } from "firebase/firestore";
import { format, subDays, startOfDay } from "date-fns";
import { db } from "../../firebase";
import useUserStore from "../../store/useUserStore";

/** Returns a zeroed per-model stats object. */
const emptyModelStats = () => ({
  chats: 0,
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  costUsd: 0,
});

/**
 * Fetch all chat-level usage documents from the user's personal usage collection.
 *
 * Firestore path:  users/{uid}/usage  (one document per chat)
 *
 * Each document mirrors the shape of a chat but contains only usage/cost
 * fields, and is written independently of the real chats collection — so
 * deleting a chat has zero effect on these records.
 *
 * @returns {Promise<Array<{
 *   chatId: string,
 *   model: string,
 *   inputTokens: number,
 *   outputTokens: number,
 *   totalTokens: number,
 *   costUsd: number,
 *   generationCount: number,
 *   createdAt: Date|null
 * }>>}
 */
export const fetchUserUsageRaw = async () => {
  const user = useUserStore.getState().user;
  if (!user) return [];

  const snapshot = await getDocs(
    collection(db, "users", user.uid, "usage")
  );

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    const tokens = data.total_tokens ?? {};
    return {
      chatId:          docSnap.id,
      model:           data.model ?? "unknown",
      inputTokens:     tokens.input  ?? 0,
      outputTokens:    tokens.output ?? 0,
      totalTokens:     tokens.total  ?? 0,
      costUsd:         data.total_cost_usd   ?? 0,
      generationCount: data.generation_count ?? 0,
      createdAt:       data.created_at ? new Date(data.created_at) : null,
    };
  });
};

/**
 * Pure function — compute aggregated analytics from a raw usage array.
 *
 * Accepts optional date-range and model filters applied entirely in-memory
 * so callers can re-compute on filter changes with zero additional reads.
 *
 * Daily chart buckets chats by their `createdAt` date.  For all-time views
 * the chart covers the last 30 calendar days.
 *
 * @param {Array}        rawUsage             - Output of fetchUserUsageRaw()
 * @param {object}       options
 * @param {number}       options.days         - Last N calendar days; 0 = all time
 * @param {string|null}  options.model        - AURA model ID filter; null = all models
 * @returns {{
 *   totalChats: number,
 *   inputTokens: number,
 *   outputTokens: number,
 *   totalTokens: number,
 *   totalCostUsd: number,
 *   byModel: Record<string, object>,
 *   daily: Array
 * }}
 */
export const computeAnalytics = (rawUsage, { days = 0, model: modelFilter = null } = {}) => {
  const empty = {
    totalChats: 0, inputTokens: 0, outputTokens: 0,
    totalTokens: 0, totalCostUsd: 0, byModel: {}, daily: [],
  };

  if (!rawUsage || rawUsage.length === 0) return empty;

  const cutoff    = days > 0 ? startOfDay(subDays(new Date(), days - 1)) : null;
  const chartDays = days > 0 ? days : 30;

  let totalChats = 0, inputTokens = 0, outputTokens = 0, totalTokens = 0, totalCostUsd = 0;
  /** @type {Record<string, ReturnType<typeof emptyModelStats>>} */
  const byModel = {};
  /** @type {Record<string, { tokens: number, inputTokens: number, outputTokens: number, cost: number, chats: number }>} */
  const dailyMap = {};

  rawUsage.forEach(({ model, inputTokens: inp, outputTokens: out, totalTokens: total, costUsd, createdAt }) => {
    // ── Date filter ─────────────────────────────────────────────────────
    if (cutoff && createdAt && createdAt < cutoff) return;
    // ── Model filter ─────────────────────────────────────────────────────
    if (modelFilter && model !== modelFilter) return;

    totalChats    += 1;
    inputTokens   += inp;
    outputTokens  += out;
    totalTokens   += total;
    totalCostUsd  += costUsd;

    // ── Per-model aggregation ─────────────────────────────────────────────
    if (!byModel[model]) byModel[model] = emptyModelStats();
    byModel[model].chats        += 1;
    byModel[model].inputTokens  += inp;
    byModel[model].outputTokens += out;
    byModel[model].totalTokens  += total;
    byModel[model].costUsd      += costUsd;

    // ── Daily aggregation (keyed YYYY-MM-DD by chat createdAt) ───────────
    if (createdAt) {
      const dayKey = format(createdAt, "yyyy-MM-dd");
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { tokens: 0, inputTokens: 0, outputTokens: 0, cost: 0, chats: 0 };
      }
      dailyMap[dayKey].tokens      += total;
      dailyMap[dayKey].inputTokens += inp;
      dailyMap[dayKey].outputTokens+= out;
      dailyMap[dayKey].cost        += costUsd;
      dailyMap[dayKey].chats       += 1;
    }
  });

  // Build a contiguous date array covering the last `chartDays` days; fill gaps with zeros.
  const daily = Array.from({ length: chartDays }, (_, i) => {
    const d   = subDays(new Date(), chartDays - 1 - i);
    const key = format(d, "yyyy-MM-dd");
    return {
      date:  key,
      label: format(d, "MMM d"),
      ...(dailyMap[key] ?? { tokens: 0, inputTokens: 0, outputTokens: 0, cost: 0, chats: 0 }),
    };
  });

  return { totalChats, inputTokens, outputTokens, totalTokens, totalCostUsd, byModel, daily };
};

/**
 * Convenience: fetch all usage docs and compute all-time aggregates with no filter.
 * Used by AnalyticsSummaryBar for the compact Library-page usage pill row.
 *
 * @returns {Promise<ReturnType<typeof computeAnalytics>>}
 */
export const getUserAnalyticsAPI = async () => {
  const raw = await fetchUserUsageRaw();
  return computeAnalytics(raw);
};
