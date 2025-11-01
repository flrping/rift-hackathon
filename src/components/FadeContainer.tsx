import React from "react";

interface FadeContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
  bgColor?: string;
}

const FadeContainer = ({
  isLoading,
  children,
  bgColor,
}: FadeContainerProps) => {
  return (
    <div className={`relative min-h-screen ${bgColor}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-white dark:border-neutral-700 dark:border-t-neutral-100"></div>
        </div>
      )}
      <div
        className={`transition-opacity duration-500 ease-in-out ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
};

export default FadeContainer;
