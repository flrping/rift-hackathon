interface TabSelectorProps {
  activeTab: "build" | "skill";
  onTabChange: (
    tab: "build" | "skill",
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
}

const TabSelector = ({ activeTab, onTabChange }: TabSelectorProps) => {
  return (
    <div className="relative flex flex-row gap-1 rounded-xl border border-neutral-200 bg-neutral-100/70 p-1 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/70">
      <button
        className={`relative z-10 flex w-full cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
          activeTab === "build"
            ? "bg-rose-400 text-white shadow-lg dark:bg-rose-500"
            : "text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-300"
        }`}
        onClick={(event) => onTabChange("build", event)}
      >
        <span>Build</span>
      </button>

      <button
        className={`relative z-10 flex w-full cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
          activeTab === "skill"
            ? "bg-rose-400 text-white shadow-lg dark:bg-rose-500"
            : "text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800/50 dark:hover:text-neutral-300"
        }`}
        onClick={(event) => onTabChange("skill", event)}
      >
        <span>Skills</span>
      </button>
    </div>
  );
};

export default TabSelector;
