import { ZodErrorMap } from "zod";

export const error_map: ZodErrorMap = (issue, ctx) => {
  console.log("zod errormap", issue, ctx);
  let message = ctx.defaultError;

  switch (issue.code) {
    case "invalid_string":
      message = "Neveljaven email";
      break;
  }

  return {
    message,
  };
};
