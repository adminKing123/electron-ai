import { GoArrowUpRight } from "react-icons/go";
import { IoChevronForward } from "react-icons/io5";
import { FaGithub } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaWhatsapp } from "react-icons/fa";
import Header from "../Header";

export default function InitialState({ onStart }) {
  return (
    <main>
      <div className="h-[calc(100dvh-0px)] overflow-auto">
        <Header type="aura-rj" />
        <section id="intro" className="bg-[#303030] py-32">
          <div className="max-w-xl px-5 mx-auto">
            <h1 className="text-black dark:text-white text-5xl text-center font-semibold">
              Introducing AuraRJ
            </h1>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                className="bg-white text-white dark:text-black px-5 font-medium py-2 text-sm rounded-3xl flex items-center gap-1"
                onClick={onStart}
              >
                Try AuraRJ <GoArrowUpRight className="text-base" />
              </button>
              <button
                className="text-white dark:text-white px-5 font-medium py-2 text-sm rounded-3xl flex items-center gap-1"
                onClick={onStart}
              >
                Visit Arhythm <IoChevronForward className="text-base" />
              </button>
            </div>
            <div className="mt-10">
              <p className="text-black dark:text-white text-justify">
                AuraRJ is an AI radio jockey that creates a real-time radio show
                from your listening taste, talking, reacting, and playing songs
                as if the station was made only for you.
              </p>
            </div>
          </div>
        </section>

        <section id="what-actually-happens" className="py-10">
          <div className="max-w-xl px-5 mx-auto">
            <div>
              <h1 className="text-black dark:text-white text-2xl font-semibold">
                What actually happens?
              </h1>
              <div className="mt-5">
                <p className="text-black dark:text-white text-justify">
                  When a session starts, Aura connects to your Arhythm profile
                  and builds a live show around your taste. It speaks between
                  tracks, sets the mood, and continues the flow — just like a
                  real radio host.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li className="text-black dark:text-white text-justify mt-3">
                    No playlists.
                  </li>
                  <li className="text-black dark:text-white text-justify mt-3">
                    No manual selection.
                  </li>
                  <li className="text-black dark:text-white text-justify mt-3">
                    A continuous hosted experience.
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <h1 className="text-black dark:text-white text-2xl font-semibold">
                The session flow
              </h1>
              <div className="mt-5">
                <ul className="list-disc list-inside space-y-1">
                  <li className="text-black dark:text-white text-justify mt-3">
                    You join a session
                  </li>
                  <li className="text-black dark:text-white text-justify mt-3">
                    Aura reads your music taste from Arhythm
                  </li>
                  <li className="text-black dark:text-white text-justify mt-3">
                    It selects a track that fits the moment
                  </li>
                  <li className="text-black dark:text-white text-justify mt-3">
                    Talks before the track
                  </li>
                  <li className="text-black dark:text-white text-justify mt-3">
                    Plays the track
                  </li>
                  <li className="text-black dark:text-white text-justify mt-3">
                    Continues the show
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="max-w-xl px-5 mx-auto">
            <h1 className="text-black dark:text-white text-2xl font-semibold text-center">
              Contact Us
            </h1>
            <div className="flex items-center justify-center gap-5 mt-3">
              <button className="dark:text-white text-xl">
                <FaLinkedin />
              </button>
              <button className="dark:text-white text-xl">
                <FaWhatsapp />
              </button>
              <button className="dark:text-white text-xl">
                <FaGithub />
              </button>
              <button className="dark:text-white text-xl">
                <SiGmail />
              </button>
              <button className="dark:text-white text-xl">
                <FaXTwitter />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
