import { ZodError } from "zod";

export type ServerErrorProps = {
    serverError?: string | undefined;
    validationErrors?: Partial<Record<"url" | "_root", string[]>> | undefined
}

export class ServerError extends Error {
    serverError?: ServerErrorProps["serverError"]
    validationErrors?: ServerErrorProps["validationErrors"]

    constructor(message: string, { serverError, validationErrors }: ServerErrorProps) {
        super(message + ", " + JSON.stringify({ serverError, validationErrors }));
        this.serverError = serverError
        this.validationErrors = validationErrors
    }

    toString() {
        return JSON.stringify({
            message: this.message,
            serverError: this.serverError,
            validationErrors: this.validationErrors
        });
    }
}