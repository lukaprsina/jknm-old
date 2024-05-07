"use client";

import Image, { StaticImageData } from "next/image";

import p0 from "~/../public/parallax/0.png";
import p1 from "~/../public/parallax/1.png";
import p2 from "~/../public/parallax/2.png";
import p3 from "~/../public/parallax/3.png";
import p4 from "~/../public/parallax/4.png";
import p5 from "~/../public/parallax/5.png";
import p6 from "~/../public/parallax/6.png";
import p7 from "~/../public/parallax/7.png";
import { useContext } from "react";

const PARLLAX_LAYERS = 7; // its 8

export default function Parallax({ children }: { children: React.ReactNode }) {
  return (
    <div
      onClick={(e) => e.preventDefault()}
      style={{
        perspective: `${100}px`,
        marginLeft: `${-window.innerWidth / 2}px`,
      }}
      className="absolute bottom-0 left-1/2 right-0 top-0 z-40 h-screen w-full overflow-y-auto overflow-x-hidden"
    >
      <ParallaxImage image={p0} index={0} />
      <ParallaxImage image={p1} index={1} />
      <ParallaxImage image={p2} index={2} />
      <ParallaxImage image={p3} index={3} />
      <ParallaxImage image={p4} index={4} />
      <ParallaxImage image={p5} index={5} />
      <ParallaxImage image={p6} index={6} />
      <ParallaxImage image={p7} index={7} />
      <div
        // style={{ height: `${2000}px` }}
        className="absolute left-0 right-0 top-[543px] z-50 block bg-zinc-950"
      >
        {children}
      </div>
    </div>
  );
}

function ParallaxImage({
  image,
  index,
}: {
  image: StaticImageData;
  index: number;
}) {
  const x = (PARLLAX_LAYERS - index) / 2;

  return (
    <div
      className="absolute  bottom-0 left-0 right-0 top-0"
      style={{
        transform: `translateZ(${-100 * x * 1}px) scale(${(x + 1) * 1})`,
        // transformOrigin: "65% 70%"
      }}
    >
      {/* <img
                src={image.src}
                // manjka bottom-0
                className="block absolute"
            /> */}
      <Image
        src={image}
        alt={`parallax layer ${index}`}
        className="absolute" // bottom-0
        sizes="100vh"
        placeholder="blur"
        style={{
          objectFit: "contain",
        }}
      />
    </div>
  );
}
