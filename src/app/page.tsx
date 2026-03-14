"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "@/components/LoginModal";

import { motion } from "motion/react";
import Link from "next/link";
import SceneBackground from "@/components/SceneBackground";
import { useState } from "react";
import Image from "next/image";
import { PlayButton } from "@/components/PlayButton";

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
      <div className="opening-page__canvas relative h-screen w-screen overflow-hidden">
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
              <LoginModal
                open={openLoginModal}
                onClose={() => setOpenLoginModal(false)}
              />
              {/* CHARACTER GROUP (Text + Dog) */}
              <div className="absolute left-[52%] top-[10%] flex flex-col items-center w-[40vh] pointer-events-none">
                <p className="w-full whitespace-nowrap text-center font-[family-name:var(--font-irish-grover)] text-[18vh] leading-none text-black">
                  larma
                </p>

                <div className="flex h-[32vh] w-full items-end justify-center mt-[-10%]">
                  <img
                    alt="Dog"
                    className="h-full w-full object-contain object-bottom"
                    src={IMG_DOGS}
                  />
                </div>
              </div>
              {/* TREE */}
              <div className="pointer-events-none absolute left-[5%] bottom-[5%] h-[55vh] w-[40vh]">
                <img
                  alt="Tree"
                  className="h-full w-full object-contain object-bottom"
                  src={IMG_TREE}
                />
              </div>
              {/** Replace with PLAY BUTTON LATER */}
              <Link
                href="/home-page"
                aria-label="Play"
                className="pointer-events-auto absolute left-1/2 top-[45%] block -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                style={{
                  height: "clamp(4rem, 15vh, 8rem)",
                  width: "clamp(4rem, 15vh, 8rem)",
                }}
              >
                <svg
                  viewBox="0 0 100 100"
                  className="block size-full drop-shadow-lg"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="50" cy="50" r="50" fill={PLAY_CIRCLE_FILL} />
                  <path d="M42 30 L42 70 L72 50 Z" fill={PLAY_TRIANGLE_FILL} />
                </svg>
              </Link>
            </div>
          </div>
        </SceneBackground>
      </div>
    </div>
  );
}
