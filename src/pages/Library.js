import FilesPage from "./Files";
import { FaRadio } from "react-icons/fa6";
import ROUTES from "../router/routes";
import { Link } from "react-router-dom";
import AnalyticsSummaryBar from "../components/Analytics/AnalyticsSummaryBar";

/** App shortcuts — always visible, no toggle required. */
const APPS = [
  {
    Icon: FaRadio,
    name: "Aura RJ",
    description: "AI Driven Radio",
    to: ROUTES.AURA_RJ,
    color: "#7c3aed",
  },
];

const AppCard = ({ app }) => (
  <Link
    to={app.to}
    className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-[#E1E1E1] dark:border-[#2F2F2F]
      bg-white dark:bg-[#141414] hover:bg-[#fafafa] dark:hover:bg-[#1e1e1e]
      transition-colors w-full max-w-[220px]"
  >
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: app.color + "20" }}
    >
      <app.Icon className="text-sm" style={{ color: app.color }} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-black dark:text-white leading-tight">
        {app.name}
      </p>
      <p className="text-[10px] text-[#888] dark:text-[#666] mt-0.5">
        {app.description}
      </p>
    </div>
  </Link>
);

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-semibold text-[#aaa] dark:text-[#555] uppercase tracking-widest mb-3">
    {children}
  </p>
);

const LibraryPage = () => (
  <div className="h-full overflow-y-auto">
    <div className="max-w-[892px] px-5 mx-auto pb-12">

      {/* ── Page header ── */}
      <div className="mt-6 mb-7">
        <h3 className="text-2xl text-black dark:text-white font-semibold">Library</h3>
        <p className="text-xs text-[#aaa] dark:text-[#666] mt-0.5">
          Your files, apps &amp; usage
        </p>
      </div>

      {/* ── Apps ── */}
      <section className="mb-7">
        <SectionLabel>Apps</SectionLabel>
        <div className="flex gap-2 flex-wrap">
          {APPS.map((app) => (
            <AppCard key={app.to} app={app} />
          ))}
        </div>
      </section>

      {/* ── Usage summary ── */}
      <section className="mb-7">
        <AnalyticsSummaryBar />
      </section>

      {/* ── Files ── */}
      <section>
        <SectionLabel>Files</SectionLabel>
        <FilesPage />
      </section>

    </div>
  </div>
);

export default LibraryPage;
