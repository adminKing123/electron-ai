import { useState } from "react";
import FilesPage from "./Files";
import { IoApps } from "react-icons/io5";
import { FaRadio } from "react-icons/fa6";
import { BsRobot } from "react-icons/bs";
import { BsStars } from "react-icons/bs";
import ROUTES from "../router/routes";
import { Link } from "react-router-dom";

const MoreApps = () => {
  const [open, setOpen] = useState(false);

  const APPS = [
    {
      Icon: FaRadio,
      name: "Aura RJ",
      description: "AI Driven Radio App",
      to: ROUTES.AURA_RJ,
    },
    {
      Icon: BsRobot,
      name: "Código",
      description: "AI Powered Code Editor",
      to: ROUTES.CODIGO,
    },
    {
      Icon: BsStars,
      name: "Aura Parlante",
      description: "AI Powered Live Chat",
      to: ROUTES.LIVE_CHAT_WITH_AI,
    }
  ];

  return (
    <div className="mt-6">
      <div className="flex items-start flex-wrap gap-3">
        <button
          onClick={() => setOpen(!open)}
          className={`border ${open ? "border-[#daa500] dark:border-[#daa500] text-[#daa500] dark:text-[#daa500]" : "border-[#E1E1E1] dark:border-[#2F2F2F] text-black dark:text-white"} hover:bg-[#fafafa] hover:dark:bg-[#2F2F2F] px-2.5 py-1 text-xs rounded-2xl flex items-center justify-between text-nowrap gap-2 transistion-colors duration-200`}
        >
          <div>
            <IoApps />
          </div>
          <p>More Apps</p>
        </button>
        {open && (
          <>
            {APPS.map((app, index) => (
              <Link
                key={index}
                to={app.to}
                className={`border border-[#E1E1E1] dark:border-[#2F2F2F] text-black dark:text-white hover:bg-[#fafafa] hover:dark:bg-[#2F2F2F] px-2.5 py-1 text-xs rounded-2xl flex items-center justify-between text-nowrap gap-2 transistion-colors duration-200`}
              >
                <div>
                  <app.Icon />
                </div>
                <p>{app.name}</p>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

const LibraryPage = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[892px] px-5 mx-auto">
        <div className="mt-6">
          <h3 className="text-2xl text-black dark:text-white font-semibold">
            Library
          </h3>
        </div>
        <MoreApps />
        {/* <FilesPage /> */}
      </div>
    </div>
  );
};

export default LibraryPage;
