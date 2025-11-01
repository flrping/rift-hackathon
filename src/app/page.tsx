"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SiteFooter } from "~/components/SiteFooter";
import { SiteNavbar } from "~/components/SiteNavbar";

export default function Home() {
  const router = useRouter();
  const [region, setRegion] = useState("NA1");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(`/summoners/${region}/${name}-${tagline}`);
  };

  return (
    <>
      <SiteNavbar />
      <main className="relative flex min-h-[100vh] flex-col items-center justify-center overflow-hidden bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-white">
        {/* Subtle background accent */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_rgba(244,114,182,0.05),_transparent_70%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(244,114,182,0.08),_transparent_70%)]" />

        <div className="z-10 flex flex-col items-center justify-center px-6 text-center">
          {/* Header */}
          <h1 className="text-6xl font-extrabold tracking-tight text-rose-600 dark:text-rose-500 sm:text-[5rem]">
            RIFTFORGED
          </h1>
          <p className="mt-2 text-xl text-neutral-700 dark:text-neutral-300">
            Insights forged just for you.
          </p>

          {/* Subtitle */}
          <p className="mt-10 max-w-xl text-lg font-normal text-neutral-600 dark:text-neutral-400">
            Enter your League of Legends summoner name and tagline to start your AI-powered match rewind.
          </p>

          {/* Form Card */}
          <div className="mt-6 w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-colors dark:border-neutral-700 dark:bg-neutral-800/60">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-black placeholder-neutral-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
              >
                <option value="NA1">North America</option>
                <option value="EUW1">Europe West</option>
                <option value="EUN1">Europe Nordic & East</option>
                <option value="KR">Korea</option>
                <option value="JP1">Japan</option>
                <option value="BR1">Brazil</option>
                <option value="LA1">Latin America North</option>
                <option value="LA2">Latin America South</option>
                <option value="OC1">Oceania</option>
                <option value="TR1">Turkey</option>
                <option value="RU">Russia</option>
                <option value="PH2">Philippines</option>
                <option value="SG2">Singapore</option>
                <option value="TH2">Thailand</option>
                <option value="TW2">Taiwan</option>
                <option value="VN2">Vietnam</option>
              </select>

              <input
                type="text"
                placeholder="Summoner Name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-black placeholder-neutral-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
              />
              <input
                type="text"
                placeholder={`#${region.toUpperCase()}`}
                value={tagline}
                required
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-black placeholder-neutral-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-100 dark:placeholder-neutral-400"
              />

              <button
                type="submit"
                disabled={!name || !tagline}
                className="w-full rounded-lg bg-rose-600 px-6 py-2 font-semibold text-white transition-all hover:bg-rose-700 focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:bg-rose-800/20 sm:w-auto dark:focus:ring-rose-700"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
