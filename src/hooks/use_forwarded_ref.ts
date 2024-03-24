import { type ForwardedRef, useEffect, useRef } from "react";

// https://stackoverflow.com/questions/73015696/whats-the-difference-between-reacts-forwardedref-and-refobject
export default function useForwardedRef<T>(ref: ForwardedRef<T>) {
  const innerRef = useRef<T | null>(null);

  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(innerRef.current);
    } else {
      // ref.current = innerRef.current;
      innerRef.current = ref.current;
    }
  });

  return innerRef;
}
