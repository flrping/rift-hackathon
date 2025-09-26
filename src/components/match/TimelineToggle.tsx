interface TimelineToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

const TimelineToggle = ({ isOpen, onToggle }: TimelineToggleProps) => {
  return (
    <div className="flex items-center justify-end lg:ms-auto lg:justify-center">
      <button
        onClick={onToggle}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-slate-600/50 bg-slate-700/50 text-slate-300 transition-colors hover:bg-slate-600/50 hover:text-slate-100"
      >
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>
  );
};

export default TimelineToggle;
