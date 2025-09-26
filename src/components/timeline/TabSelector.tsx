interface TabSelectorProps {
  activeTab: "build" | "skill";
  onTabChange: (
    tab: "build" | "skill",
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
}

const TabSelector = ({ activeTab, onTabChange }: TabSelectorProps) => {
  return (
    <div className="relative flex flex-row gap-1 rounded-xl border border-slate-700/50 bg-slate-900/70 p-1 backdrop-blur-sm">
      <button
        className={`relative z-10 flex w-full cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
          activeTab === "build"
            ? "bg-slate-600 text-white shadow-lg"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"
        }`}
        onClick={(event) => onTabChange("build", event)}
      >
        <span>Build</span>
      </button>

      <button
        className={`relative z-10 flex w-full cursor-pointer items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
          activeTab === "skill"
            ? "bg-slate-600 text-white shadow-lg"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"
        }`}
        onClick={(event) => onTabChange("skill", event)}
      >
        <span>Skills</span>
      </button>
    </div>
  );
};

export default TabSelector;
