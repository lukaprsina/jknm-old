"use client";

import React from "react";

// Require Editor CSS files.
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";

import FroalaEditorComponent from "react-froala-wysiwyg";

export default function FroalaPage() {
  return <FroalaEditorComponent tag="textarea" />;
}
