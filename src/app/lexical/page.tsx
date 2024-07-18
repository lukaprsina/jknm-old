import Editor from "./editor";
import Nodes from "./nodes";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import theme from "./theme";

function App(): JSX.Element {
  return (
    <LexicalComposer
      initialConfig={{
        namespace: "Playground",
        nodes: Nodes,
        onError: (error: Error) => {
          throw error;
        },
        theme: theme,
      }}
    >
      <Editor />
    </LexicalComposer>
  );
}
