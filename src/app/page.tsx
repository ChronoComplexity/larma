"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "@/components/LoginModal";
import { PlayButton } from "@/components/PlayButton";

import { motion } from "motion/react";
import Link from "next/link";
import SceneBackground from "@/components/SceneBackground";
import { useState } from "react";
import Image from "next/image";

const MotionImage = motion(Image);

const IMG_DOGS = "/images/dog_sitting.png";
const IMG_TREE = "/images/tree.png";

const PLAY_CIRCLE_FILL = "var(--light-green)";
const PLAY_TRIANGLE_FILL = "var(--dark-green)";

const images = [IMG_DOGS, IMG_TREE];

export default function Home() {
  const { openLoginModal, setOpenLoginModal } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentImage = images[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div
      className={`opening-page fixed inset-0 flex flex-col items-center justify-center bg-white ${
        openLoginModal ? "" : "overflow-hidden"
      }`}
    >
      {/* 1. FULL SCREEN CANVAS 
          Removed fixed aspect ratios. Using w-screen h-screen to fill everything.
      */}
      <div className="opening-page__canvas relative h-screen w-screen overflow-hidden">
        {/* NOTE: Ensure SceneBackground uses "object-cover" internally 
           to avoid bars on the actual background image. 
        */}
        <SceneBackground>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-transparent">
            <div className="pointer-events-none relative size-full flex-shrink-0 overflow-hidden">
              {/* Floating Animated Element */}
              <motion.div
                initial={{ y: "20vh", x: 0 }}
                animate={{
                  y: "20vh",
                  x: "5vh",
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "mirror",
                }}
                className="absolute z-10 h-[12vh] w-[12vh]"
              >
                <MotionImage
                  src={currentImage}
                  alt="Animated scene element"
                  width={500}
                  height={300}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="size-full object-contain"
                />
              </motion.div>

              <button
                type="button"
                onClick={nextImage}
                className="pointer-events-auto absolute top-4 left-4 bg-black text-white px-3 py-1 rounded z-50"
              >
                Next Image
              </button>

              <PlayButton />

              <LoginModal
                open={openLoginModal}
                onClose={() => setOpenLoginModal(false)}
              />

              {/* 2. CHARACTER GROUP (Text + Dog)
                  Using 'vh' ensures they stay together and fit on the screen height-wise.
              */}
              <div className="absolute left-[52%] top-[12%] flex flex-col items-center w-[40vh] pointer-events-none">
                <p className="w-full whitespace-nowrap text-center font-[family-name:var(--font-irish-grover)] text-[18vh] leading-none not-italic text-black">
                  larma
                </p>

                <div
                  className="flex h-[32vh] w-full items-end justify-center mt-[-10%]"
                  aria-hidden
                >
                  <img
                    alt="Dog"
                    className="h-full w-full object-contain object-bottom"
                    src={IMG_DOGS}
                  />
                </div>
              </div>

              {/* 3. TREE
                  Anchored to the left-bottom, sized by height.
              */}
              <div
                className="pointer-events-none absolute left-[5%] bottom-[5%] h-[55vh] w-[40vh]"
                aria-hidden
              >
                <img
                  alt="Tree"
                  className="h-full w-full object-contain object-bottom"
                  src={IMG_TREE}
                />
              </div>

              {/* 4. CENTER PLAY BUTTON 
                  Always centered and sized relative to screen height.
              */}
              <Link
                href="/home-page"
                aria-label="Play"
                className="pointer-events-auto absolute left-1/2 top-[42%] block h-[18vh] aspect-square -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-105"
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
              </Link>
            </div>
          </div>
        </SceneBackground>
      </div>
    </div>
  );
}
