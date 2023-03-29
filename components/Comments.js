import { useRouter } from "next/router";
import { useState } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { useUpdateAnnotation } from "hooks";

const printJson = (editor) => {
  return JSON.stringify(editor.getJSON());
};

const printHtml = (editor) => {
  return editor.getHTML();
};

const CommentEditor = (props) => {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: "What is your interpretation of this passage?",
        }),
      ],
      content: props.content || "",
      onUpdate: ({ editor }) => {
        props.onChange.html(editor.getHTML());
        props.onChange.json(JSON.stringify(editor.getJSON()));
      },
    },
    [props.annotationUuid]
  );

  return <EditorContent editor={editor} />;
};

const Comment = (props) => {
  const [editorHtml, setEditorHtml] = useState(props.annotation.commentHtml);
  const [editorJson, setEditorJson] = useState(props.annotation.commentJson);
  const router = useRouter();
  const { articleUuid } = router.query;
  const updateAnnotation = useUpdateAnnotation(articleUuid);

  function updateComment(annotationUuid, commentHtml, commentJson) {
    const newAnnotation = {
      ...props.annotation,
      commentHtml: commentHtml,
      commentJson: commentJson,
    };
    updateAnnotation.mutate(newAnnotation);
  }

  return (
    <div>
      <CommentEditor
        annotationUuid={props.annotation.uuid}
        content={props.annotation.commentHtml}
        onChange={{ html: setEditorHtml, json: setEditorJson }}
      />
      <button
        type="submit"
        onClick={() => {
          updateComment(props.annotation.uuid, editorHtml, editorJson);
        }}
      >
        Submit
      </button>
    </div>
  );
};

const Comments = (props) => {
  const annotationUuid = props.focusedHighlightId;
  const annotations = props.fetchedAnnotations;

  if (!annotationUuid) {
    return;
  } else {
    const focusedAnnotation = annotations.find(
      (annotation) => annotation.uuid === annotationUuid
    );
    return (
      <div className={`${props.className}`}>
        <Comment annotation={focusedAnnotation} />
      </div>
    );
  }
};

export default Comments;
