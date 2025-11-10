"use client";

import React from "react";
import { formatQueueType, formatPlaystyleType } from "~/util/formatNames";

type Highlight = { badge?: string | null; title?: string | null };
type Achievement = {
  title: string;
  icon?: string | null;
};

interface ShowcaseCardProps {
  year: number;
  champion: string;
  skinNum: number;
  summonerGameName: string;
  summonerTagLine?: string | null;
  playstyleType?: string | null;
  highlights?: Highlight[] | null;
  achievements?: Achievement[] | null;
  queueType?: string | null;
  className?: string;
  statistics?: {
    favoriteChampion?: string | null;
    favoriteLane?: string | null;
    favoriteItem?: string | null;
  } | null;
  percentileStats?: Array<{ label: string; percentile: number }> | null;
}

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex?.replace?.("#", "") ?? "000000";
  const bigint = parseInt(clean.length === 3 ? clean.repeat(2) : clean, 16);
  if (Number.isNaN(bigint)) return `rgba(0, 0, 0, ${alpha})`;
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ShowcaseCard = ({
  year,
  champion = "Aatrox",
  skinNum = 0,
  summonerGameName,
  summonerTagLine,
  playstyleType,
  highlights,
  achievements,
  queueType,
  className,
  statistics,
  percentileStats,
}: ShowcaseCardProps) => {
  const safeChampion =
    typeof champion !== "string" || champion.trim().length === 0
      ? "Aatrox"
      : champion;
  const safeSkinNum =
    typeof skinNum !== "number" || !Number.isFinite(skinNum) ? 0 : skinNum;
  return (
    <div
      className={`relative overflow-hidden rounded-lg p-6 ${className ?? ""}`}
      style={{
        backgroundImage: `url(https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${safeChampion}_${safeSkinNum}.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        border: `1px solid ${hexToRgba("#0a0a0a", 0.2)}`,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: hexToRgba("#0a0a0a", 0.3),
        }}
      />
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300">Rift Rewind {year}</p>
          <p className="text-2xl font-bold text-white">
            {summonerGameName}
            {summonerTagLine ? ` #${summonerTagLine}` : ""}
          </p>
          {[playstyleType, queueType].some(Boolean) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {playstyleType && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  Playstyle: {formatPlaystyleType(playstyleType)}
                </span>
              )}
              {queueType && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  Queue: {formatQueueType(queueType)}
                </span>
              )}
            </div>
          )}
          {(percentileStats?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {percentileStats?.slice(0, 3).map((p, idx) => (
                <span
                  key={`${p.label}-${idx}`}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur"
                  title={p.label}
                >
                  Top {Math.max(0, Math.min(100, Math.round(p.percentile)))}%{" "}
                  {p.label}
                </span>
              ))}
            </div>
          )}
          {statistics && (
            <div className="mt-3 flex flex-wrap gap-2">
              {statistics.favoriteChampion && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  Favorite: {statistics.favoriteChampion}
                </span>
              )}
              {statistics.favoriteLane && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  Lane: {statistics.favoriteLane}
                </span>
              )}
              {statistics.favoriteItem && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  Item: {statistics.favoriteItem}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {(highlights?.length ?? 0) > 0 || (achievements?.length ?? 0) > 0 ? (
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-6">
          {(highlights?.length ?? 0) > 0 && (
            <div>
              <p className="text-sm text-slate-300">Highlights</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {highlights?.map((h, idx) => (
                  <li
                    key={idx}
                    className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur"
                    title={h.title ?? ""}
                  >
                    {(h.badge ?? "") + (h.title ? ` ${h.title}` : "")}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(achievements?.length ?? 0) > 0 && (
            <div className="mt-3">
              <p className="text-sm text-slate-300">Achievements</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {achievements?.map((a, idx) => (
                  <li
                    key={idx}
                    className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur"
                    title={a.title}
                  >
                    {(a.icon ?? "") + (a.title ? ` ${a.title}` : "")}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ShowcaseCard;
