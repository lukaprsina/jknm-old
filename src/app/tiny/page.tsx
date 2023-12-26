import { createRef } from "react";
import TinyMCE from "./TinyMCE";

export default async function Tiny() {
    async function upload(formData: FormData) {
        'use server'
        console.log(formData)
    }

    return (
        <TinyMCE upload={upload} />
    )
}