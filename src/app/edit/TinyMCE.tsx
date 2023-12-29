'use client'

import { env } from "~/env";
import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditorType } from 'tinymce';
import { useEffect, useRef, useState } from 'react';
import { create_or_update_article } from '~/app/actions'
import { useSearchParams } from "next/navigation";
import { Flex, TextInput, } from "@mantine/core";

export default function TinyMCE() {
    const initial_value = 'This is the initial content of the editor';
    const editor_ref = useRef<TinyMCEEditorType | null>(null);
    const submit_button_ref = useRef<HTMLButtonElement>(null);
    const search_params = useSearchParams()
    const [pathname, setPathname] = useState<string>("");
    const [title, setTitle] = useState<string>("");

    useEffect(() => {
        if (search_params.get("action") !== "edit") return;
        setPathname(search_params.get("pathname") ?? "")
    }, [search_params])

    return (
        <form
            onSubmit={async (event) => {
                event.preventDefault();
                //  const form_data = new FormData(event.currentTarget);
                console.log("executing")

                const res = await create_or_update_article({
                    content: editor_ref.current?.getContent(),
                    pathname: pathname,
                    title
                })

                console.log(res)
            }}
            style={{ width: '100%', height: '100%' }}
        >
            <Flex>
                <TextInput
                    name="pathname"
                    placeholder="Path"
                    value={pathname}
                    onChange={(event) => setPathname(event.currentTarget.value)}
                />
                <TextInput
                    name="title"
                    placeholder="Title"
                    value={title}
                    onChange={(event) => setTitle(event.currentTarget.value)}
                />
                <button hidden type="submit" name="submitbtn" ref={submit_button_ref} />
            </Flex>

            <Editor
                apiKey={env.NEXT_PUBLIC_TINYMCE_API_KEY}
                initialValue={initial_value}
                onInit={(_, editor) => editor_ref.current = editor}
                init={{
                    setup: (editor) => {
                        editor.ui.registry.addButton('save2', {
                            text: 'Save',
                            onAction: () => {
                                if (!submit_button_ref.current) return;
                                submit_button_ref.current.click();
                            },
                        })
                    },
                    width: '100%',
                    height: '100%',
                    plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
                    // plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                    toolbar: 'save2 undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                    image_title: true,
                    images_file_types: 'jpg,jpeg,png,gif,svg,mp4',
                    automatic_uploads: true,
                    file_picker_types: 'file image media',
                    images_upload_url: '/api/file',
                    paste_data_images: true,
                    image_description: true,
                    images_upload_base_path: '/fs', // this is dynamic to page route                
                    importcss_append: true,
                    content_css: '/css/tinymce.css',
                    // extended_valid_elements: "figure figcaption",
                    image_caption: true,
                }}
            />
        </form>
    )
}