import React from "react";
import Image from "next/image";

function Sponsors() {
  const sponsors = [
    {
      title: "Google",
      icon: "/sponsors/google.svg",
      href: "https://google.com",
    },
    {
      title: "NVIDIA",
      icon: "/sponsors/nvidia-wordmark-dark.svg",
      href: "https://www.nvidia.com",
    },
    {
      title: "Amazon Web Services",
      icon: "/sponsors/aws_dark.svg",
      href: "https://aws.amazon.com",
    },
    {
      title: "Microsoft",
      icon: "/sponsors/microsoft.svg",
      href: "https://www.microsoft.com",
    },
    {
      title: "OpenAI",
      icon: "/sponsors/openai_wordmark_dark.svg",
      href: "https://openai.com",
    },
    {
      title: "Meta",
      icon: "/sponsors/meta.svg",
      href: "https://about.meta.com",
    },
  ];

  return (
    <div className="relative w-full min-h-screen pb-26">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10"></div>

      <div className="mx-4 h-20 w-60 text-2xl flex items-center justify-center gap-2 pt-34">
        <span className="bg-neutral-300 h-1 w-12"></span>
        <span className="text-white flex items-center justify-center">
          Sponsorships
        </span>
      </div>

      <div className="m-12 h-auto w-full text-5xl md:text-7xl font-bold tracking-tighter">
        <span className="text-white">Meet our partners who make </span>
        <br />
        <span className="text-neutral-500">exceptional events possible</span>
      </div>

      <div className="flex flex-col items-center justify-center py-12 px-8">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
            {sponsors.map((item, index) => (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-neutral-900 rounded-2xl p-6 flex flex-col gap-3 items-center justify-center hover:bg-neutral-800 transition-all duration-300 border border-neutral-800 hover:border-blue-600 hover:scale-105 aspect-video"
              >
                <div className="relative h-16 w-full flex items-center justify-center">
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={200}
                    height={64}
                    className="object-contain h-full w-auto"
                  />
                </div>
                <div className="text-blue-400 text-xl font-semibold text-center">
                  {item.title}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none z-20"></div>
    </div>
  );
}

export default Sponsors;