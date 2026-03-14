"use client";

import { useAuth } from "@/contexts/AuthContext";

const PLAY_CIRCLE_FILL = "#569629";
const PLAY_TRIANGLE_FILL = "#2d4f15";

export function PlayButton() {
  const { setOpenLoginModal } = useAuth();

  return (
    <button
      type="button"
      onClick={() => setOpenLoginModal(true)}
      aria-label="Play"
      className="absolute left-[44.53%] top-[38.33%] block h-[19.44%] w-[10.94%] cursor-pointer transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa3bff]"
      data-node-id="1:8"
    >
      <svg
        viewBox="0 0 100 100"
        className="block size-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="50" cy="50" r="50" fill={PLAY_CIRCLE_FILL} />
        <path d="M40 26 L40 74 L74 50 Z" fill={PLAY_TRIANGLE_FILL} />
      </svg>
    </button>
  );
}
