'use client'

import { env } from "~/env";
import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';
import { save } from '~/app/actions'

export default function TinyMCE() {
    const initialValue = 'This is the initial content of the editor';
    const editorRef = useRef(null);
    const formRef = useRef<HTMLTextAreaElement>(null);
    const submitButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <form
            action={save}
            style={{ width: '100%', height: '100%' }}
        >
            <textarea hidden ref={formRef} name="content"></textarea>
            <button hidden ref={submitButtonRef} type="submit" name="submitbtn">Save</button>

            <Editor
                apiKey={env.NEXT_PUBLIC_TINYMCE_API_KEY}
                initialValue={initialValue}
                onInit={(evt, editor) => editorRef.current = editor}
                init={{
                    setup: (editor) => {
                        editor.ui.registry.addButton('save2', {
                            text: 'Save',
                            onAction: () => {
                                if (!formRef.current || !submitButtonRef.current) return
                                formRef.current.innerHTML = editor.getContent()
                                submitButtonRef.current.click()
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