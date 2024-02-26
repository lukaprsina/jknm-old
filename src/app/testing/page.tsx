"use client"

import { Button } from "~/components/ui/button";
import { make_or_return_draft } from "../actions";

export default function Testing() {
    return (
        <Button
            onClick={() => make_or_return_draft({ url: "test" })}
        >
            Test
        </Button>
    )
}