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
  imagesGenerated: 0,
  costUsd: 0,
  // 'text' | 'image' — overwritten on first aggregation; never summed.
  generationType: "text",
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

    // Convert the Firestore by_model map (safe keys with dots→underscores) back
    // to real Comet model IDs using the stored model_id field on each entry.
    const rawByModel = data.by_model ?? {};
    const byModel = {};
    Object.entries(rawByModel).forEach(([, stats]) => {
      const realId = stats.model_id || "unknown";
      byModel[realId] = {
        count:           stats.count            ?? 0,
        inputTokens:     stats.input_tokens     ?? 0,
        outputTokens:    stats.output_tokens    ?? 0,
        totalTokens:     stats.total_tokens     ?? 0,
        imagesGenerated: stats.images_generated ?? 0,
        costUsd:         stats.cost_usd         ?? 0,
        // 'text' | 'image' — stored as a plain string on the Firestore doc.
        // Lets the dashboard know 0 tokens on an image model is correct.
        generationType:  stats.generation_type  ?? "text",
      };
    });

    return {
      chatId:           docSnap.id,
      byModel,
      inputTokens:      tokens.input  ?? 0,
      outputTokens:     tokens.output ?? 0,
      totalTokens:      tokens.total  ?? 0,
      imagesGenerated:  data.total_images_generated ?? 0,
      costUsd:          data.total_cost_usd   ?? 0,
      generationCount:  data.generation_count ?? 0,
      createdAt:        data.created_at ? new Date(data.created_at) : null,
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
 * @param {string|null}  options.model        - Comet model ID filter; null = all models
 * @returns {{
 *   totalChats: number,
 *   inputTokens: number,
 *   outputTokens: number,
 *   totalTokens: number,
 *   totalImagesGenerated: number,
 *   totalCostUsd: number,
 *   byModel: Record<string, object>,
 *   daily: Array
 * }}
 */
export const computeAnalytics = (rawUsage, { days = 0, model: modelFilter = null } = {}) => {
  const empty = {
    totalChats: 0, inputTokens: 0, outputTokens: 0,
    totalTokens: 0, totalImagesGenerated: 0, totalCostUsd: 0, byModel: {}, daily: [],
  };

  if (!rawUsage || rawUsage.length === 0) return empty;

  const cutoff    = days > 0 ? startOfDay(subDays(new Date(), days - 1)) : null;
  const chartDays = days > 0 ? days : 30;

  let totalChats = 0, inputTokens = 0, outputTokens = 0, totalTokens = 0,
      totalImagesGenerated = 0, totalCostUsd = 0;
  /** @type {Record<string, ReturnType<typeof emptyModelStats>>} */
  const byModel = {};
  /** @type {Record<string, { tokens: number, inputTokens: number, outputTokens: number, cost: number, chats: number }>} */
  const dailyMap = {};

  rawUsage.forEach((chat) => {
    const {
      byModel: chatByModel = {},
      inputTokens: chatInp, outputTokens: chatOut, totalTokens: chatTotal,
      imagesGenerated: chatImgs,
      costUsd: chatCost, createdAt,
    } = chat;

    // ── Date filter ──────────────────────────────────────────────────────
    if (cutoff && createdAt && createdAt < cutoff) return;

    // ── Model filter — only include chats that used this model ───────────
    if (modelFilter && !chatByModel[modelFilter]) return;

    // When a model filter is active, attribute only that model's share of
    // tokens/cost to the totals; otherwise use the full chat-level figures.
    let inp, out, total, cost, imgs;
    if (modelFilter) {
      const ms = chatByModel[modelFilter];
      inp   = ms.inputTokens;
      out   = ms.outputTokens;
      total = ms.totalTokens;
      cost  = ms.costUsd;
      imgs  = ms.imagesGenerated;
    } else {
      inp   = chatInp;
      out   = chatOut;
      total = chatTotal;
      cost  = chatCost;
      imgs  = chatImgs;
    }

    totalChats           += 1;
    inputTokens          += inp;
    outputTokens         += out;
    totalTokens          += total;
    totalImagesGenerated += imgs ?? 0;
    totalCostUsd         += cost;

    // ── Per-model aggregation — iterate each model used in this chat ──────
    Object.entries(chatByModel).forEach(([modelId, stats]) => {
      if (!byModel[modelId]) byModel[modelId] = emptyModelStats();
      byModel[modelId].chats           += stats.count           ?? 0;
      byModel[modelId].inputTokens     += stats.inputTokens     ?? 0;
      byModel[modelId].outputTokens    += stats.outputTokens    ?? 0;
      byModel[modelId].totalTokens     += stats.totalTokens     ?? 0;
      byModel[modelId].imagesGenerated += stats.imagesGenerated ?? 0;
      byModel[modelId].costUsd         += stats.costUsd         ?? 0;
      // generation_type is a label, not a counter — overwrite is safe since
      // the same model ID always has the same type.
      byModel[modelId].generationType   = stats.generationType  ?? "text";
    });

    // ── Daily aggregation (keyed YYYY-MM-DD by chat createdAt) ───────────
    if (createdAt) {
      const dayKey = format(createdAt, "yyyy-MM-dd");
      if (!dailyMap[dayKey]) {
        dailyMap[dayKey] = { tokens: 0, inputTokens: 0, outputTokens: 0, cost: 0, chats: 0 };
      }
      dailyMap[dayKey].tokens       += total;
      dailyMap[dayKey].inputTokens  += inp;
      dailyMap[dayKey].outputTokens += out;
      dailyMap[dayKey].cost         += cost;
      dailyMap[dayKey].chats        += 1;
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

  return { totalChats, inputTokens, outputTokens, totalTokens, totalImagesGenerated, totalCostUsd, byModel, daily };
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
