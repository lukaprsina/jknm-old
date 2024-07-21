import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./blocknote"), { ssr: false });

export default function App() {
  return (
    <div>
      <Editor />
    </div>
  );
}
