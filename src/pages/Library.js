import FilesPage from "./Files";
import { FaRadio } from "react-icons/fa6";
import { TbBolt } from "react-icons/tb";
import { LuArrowUpRight } from "react-icons/lu";
import ROUTES from "../router/routes";
import { Link } from "react-router-dom";
import AnalyticsSummaryBar from "../components/Analytics/AnalyticsSummaryBar";
import SectionHeader from "../components/Common/SectionHeader";

/** App shortcuts — always visible, no toggle required. */
const APPS = [
  {
    Icon: TbBolt,
    name: "Fuse",
    description: "Connect flows & route to apps",
    to: ROUTES.FUSE,
    color: "#e87c10",
  },
  {
    Icon: FaRadio,
    name: "Comet RJ",
    description: "AI Driven Radio",
    to: ROUTES.COMET_RJ,
    color: "#7c3aed",
  },
];

const AppCard = ({ app }) => (
  <Link
    to={app.to}
    className="group flex items-center gap-3.5 p-4 rounded-2xl
      border border-ink-150 dark:border-ink-800
      bg-white dark:bg-ink-850
      hover:border-brand-200 dark:hover:border-brand-900
      hover:shadow-[0_4px_20px_-8px_rgba(124,58,237,0.25)]
      transition-[border-color,box-shadow]"
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: app.color + "1f" }}
    >
      <app.Icon className="text-[17px]" style={{ color: app.color }} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[14px] font-semibold text-ink-975 dark:text-white leading-tight">
        {app.name}
      </p>
      <p className="text-[12px] text-ink-500 dark:text-ink-500 mt-1 truncate">
        {app.description}
      </p>
    </div>
    <LuArrowUpRight
      className="w-4 h-4 flex-shrink-0 text-ink-400 dark:text-ink-600
        group-hover:text-brand-600 dark:group-hover:text-brand-400
        group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all"
    />
  </Link>
);

const LibraryPage = () => (
  <div className="h-full overflow-y-auto">
    <div className="max-w-[1080px] px-5 md:px-8 mx-auto pb-16">

      {/* ── Page header ── */}
      <div className="pt-8 md:pt-10 pb-8 mb-8 border-b border-ink-100 dark:border-ink-800">
        <h1 className="text-[26px] md:text-[30px] font-bold tracking-tight text-ink-975 dark:text-white">
          Library
        </h1>
        <p className="text-[14px] text-ink-500 dark:text-ink-500 mt-1">
          Your files, apps &amp; usage in one place
        </p>
      </div>

      <div className="flex flex-col gap-10">
        {/* ── Apps ── */}
        <section>
          <SectionHeader title="Apps" description="Jump into Comet AI tools" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {APPS.map((app) => (
              <AppCard key={app.to} app={app} />
            ))}
          </div>
        </section>

        {/* ── Usage summary ── */}
        <section>
          <AnalyticsSummaryBar />
        </section>

        {/* ── Files ── */}
        <section>
          <FilesPage />
        </section>
      </div>

    </div>
  </div>
);

export default LibraryPage;
