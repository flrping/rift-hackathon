import React from "react";

interface FadeContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
}

const FadeContainer = ({ isLoading, children }: FadeContainerProps) => {
  return (
    <div className="relative min-h-screen bg-slate-900">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-white"></div>
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
