"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function SiteNavbar() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const shouldBeDark = theme === "dark" || (!theme && prefersDark);
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <nav className="bg-white dark:bg-neutral-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div
          className="cursor-pointer text-xl font-bold text-rose-500"
          onClick={() => router.push("/")}
        >
          RIFTFORGED
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-neutral-700"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg
              className="h-5 w-5 text-gray-900 dark:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 text-gray-900 dark:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
    </nav>
  );
}
