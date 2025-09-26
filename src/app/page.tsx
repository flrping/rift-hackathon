"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-[5rem]">
        Rift Rewind Hackathon
      </h1>
      <p className="mt-2 text-2xl text-slate-200">
        Enter your League of Legends summoner name and tagline to get started.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 rounded-lg bg-slate-700/50 p-6 backdrop-blur">
        <form
          onSubmit={handleSubmit}
          className="flex flex-row items-center gap-2"
        >
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-lg bg-slate-700 px-4 py-2 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
            className="rounded-lg bg-slate-700 px-4 py-2 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder={`#${region.toUpperCase()}`}
            value={tagline}
            required
            onChange={(e) => setTagline(e.target.value)}
            className="rounded-lg bg-slate-700 px-4 py-2 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!name || !tagline}
            className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold transition-colors hover:bg-indigo-600 disabled:bg-slate-600"
          >
            Go
          </button>
        </form>
      </div>
    </main>
  );
}
