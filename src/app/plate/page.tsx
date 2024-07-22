import dynamic from "next/dynamic";
import React from "react";

const Editor = dynamic(() => import("./editor"), { ssr: false });

export default function Plate() {
  return (
    <div className="pt-[58px]">
      <Editor />
    </div>
  );
}
