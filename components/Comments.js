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
      editorProps: {
        attributes: {
          class:
            "py-2 px-1 bg-white rounded border border-gray-200 focus:outline-none focus:border focus:border-gray-400 hover:border hover:border-gray-300",
        },
      },
      onUpdate: ({ editor }) => {
        props.onChange.html(editor.getHTML());
        props.onChange.json(JSON.stringify(editor.getJSON()));
      },
    },
    [props.annotationUuid]
  );

  return <EditorContent editor={editor} />;
};

const SaveCommentButton = (props) => {
  return (
    <button
      disabled={!props.enabled}
      className="px-2 py-1 text-sm font-semibold text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
      onClick={() => {
        props.updateComment();
      }}
    >
      {!props.enabled ? "Saved" : "Save"}
    </button>
  );
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
    <div
      className="p-2 border rounded bg-gray-50 focus-within:bg-gray-100 focus:bg-gray-100"
      tabIndex="0"
      onClick={() => {
        document
          .querySelector(
            `.highlight[data-annotation-id="${props.annotation.uuid}"]`
          )
          .scrollIntoView({ behavior: "smooth", block: "center" });
      }}
    >
      <CommentEditor
        annotationUuid={props.annotation.uuid}
        content={props.annotation.commentHtml}
        onChange={{ html: setEditorHtml, json: setEditorJson }}
      />
      <div className="flex flex-row pt-2 justify-end">
        <SaveCommentButton
          enabled={editorHtml !== props.annotation.commentHtml}
          updateComment={() =>
            updateComment(props.annotation.uuid, editorHtml, editorJson)
          }
        />
      </div>
    </div>
  );
};

const Comments = (props) => {
  if (!props.fetchedAnnotations) return;
  const annotationUuid = props.focusedHighlightId;
  const annotations = props.fetchedAnnotations;

  const focusedAnnotation = props.fetchedAnnotations.find(
    (annotation) => annotation.uuid === annotationUuid
  );
  if (focusedAnnotation) {
    return (
      <div className={`${props.className} p-2`}>
        <Comment annotation={focusedAnnotation} />
      </div>
    );
  }
};

export default Comments;
