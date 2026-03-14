"use client";

/* Figma: UniHack2 Opening Page - Real (node-id=1-3). Responsive: %-based layout, full width. */
const IMG_BG = "/images/sky_bright.png";
const IMG_MOUNTAIN =
  "https://www.figma.com/api/mcp/asset/667c79f3-bad8-4f0e-acc7-70106e7b6239";
const IMG_DOGS =
  "https://www.figma.com/api/mcp/asset/78192275-a9df-4389-83bd-8287ff7ff289";
const IMG_GROUND = "/images/ground.png";
const IMG_PLAY_CIRCLE =
  "https://www.figma.com/api/mcp/asset/7ac2d2a4-81ef-4353-b71e-c97471a724ee";
const IMG_PLAY_TRIANGLE =
  "https://www.figma.com/api/mcp/asset/73d450d4-8b06-4c33-9026-4740253999e9";

export default function Home() {
  return (
    <div className="opening-page fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-white">
      <div className="opening-page__canvas relative flex-shrink-0 overflow-hidden">
        {/* Sky — full width, top ~67% of canvas */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-[66.76%] w-full overflow-hidden opacity-90 shadow-[0px_4px_200px_0px_rgba(0,0,0,0.15)]"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-cover object-top"
            src={IMG_BG}
          />
        </div>

        {/* Overlay */}
        <div
          className="pointer-events-none absolute left-[16.09%] top-[29.91%] h-[59.44%] w-[50.16%] opacity-30"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full max-w-none object-cover"
            src={IMG_MOUNTAIN}
          />
        </div>

        {/* Ground — full width, bottom ~33% */}
        <div
          className="pointer-events-none absolute left-0 top-[66.76%] h-[33.24%] w-full overflow-hidden"
          aria-hidden
        >
          <img
            alt=""
            className="absolute inset-0 size-full object-cover [object-position:50%_22%]"
            src={IMG_GROUND}
          />
        </div>

        {/* Title — scales with viewport width */}
        <p
          className="absolute left-1/2 top-[10.74%] w-full -translate-x-1/2 whitespace-nowrap text-center font-[family-name:var(--font-irish-grover)] text-[13.33vw] leading-none not-italic text-black md:text-[clamp(80px,13vw,256px)]"
          data-node-id="1:7"
        >
          larma
        </p>

        {/* Play button */}
        <a
          href="#play"
          aria-label="Play"
          className="absolute left-[44.53%] top-[38.33%] block h-[19.44%] w-[10.94%] cursor-pointer transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#aa3bff]"
          data-node-id="1:8"
        >
          <img
            alt=""
            className="absolute inset-0 block size-full object-contain"
            src={IMG_PLAY_CIRCLE}
          />
          {/* Triangle (play icon) — centered with slight right nudge for optical balance */}
          <span className="absolute inset-0 flex items-center justify-center [transform:translateX(4%)]" aria-hidden>
            <img
              alt=""
              className="h-[48%] w-[48%] rotate-90 object-contain object-center"
              src={IMG_PLAY_TRIANGLE}
            />
          </span>
        </a>
      </div>
    </div>
  );
}
