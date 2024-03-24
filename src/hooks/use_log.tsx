import { useEffect } from "react";

export default function useLog(item: unknown, message?: string) {
  useEffect(() => {
    if (typeof message === "string") console.log(message, item);
    else console.log(item);
  }, [item, message]);
}
