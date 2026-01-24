import React from "react";

function Sponsors() {
  return (
    <div id="sponsors" className="relative w-full min-h-[60vh] md:min-h-[70vh] pb-16 md:pb-26">
      <div className="mx-4 sm:mx-6 md:mx-8 h-20 w-auto max-w-xs text-xl sm:text-2xl flex items-center justify-center gap-2 pt-20 sm:pt-28 md:pt-34">
        <span className="bg-neutral-300 h-1 w-8 sm:w-12"></span>
        <span className="text-white flex items-center justify-center whitespace-nowrap">
          Sponsorships
        </span>
      </div>

        <div className="max-w-4xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight text-justify">
            <span className="text-neutral-500">Meet our </span>
            <span className="text-white">Partners</span>
          </h2>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-16 sm:py-20 md:py-24 px-4 sm:px-6 md:px-8">
        <div className="w-full max-w-4xl text-center">
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-3xl border border-neutral-800 p-12 sm:p-16 md:p-20">
            <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-400 mb-4">
              🚀
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Coming Soon
            </h3>
            <p className="text-neutral-400 text-lg sm:text-xl max-w-md mx-auto">
              We&apos;re working on exciting partnerships. Stay tuned for announcements!
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20"></div>
    </div>
  );
}

export default Sponsors;