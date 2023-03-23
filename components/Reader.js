import { useState } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import Article from "components/Article.js";
import { useAddComment } from "hooks";

function syncHoverBehavior(e, setFocusedHighlightID) {
  function removeHover() {
    // We use Array.from() since geElementsByClassName returns a live collection.
    // Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection
    const relatedHighlights = document.getElementsByClassName("bg-yellow-400");
    for (const mark of Array.from(relatedHighlights)) {
      mark.classList.remove("bg-yellow-400");
    }
  }

  function getAnnotationId(e) {
    return e.target.dataset.annotationId || false;
  }

  removeHover();
  const annotationId = getAnnotationId(e);

  if (annotationId) {
    setFocusedHighlightID(annotationId);
    const relatedHighlights = document.querySelectorAll(
      `.highlight[data-annotation-id="${annotationId}"]`
    );
    for (const mark of relatedHighlights) {
      mark.classList.add("bg-yellow-400");
    }
  }
}

const CommentEditor = (props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder:
          "This is interesting because... This isn't clear to me because...",
      }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      props.onChange(editor.getHTML());
    },
  });

  return <EditorContent editor={editor} />;
};

const Comments = (props) => {
  const [editorState, setEditorState] = useState();
  const markID = props.focusedHighlightID;
  const addComment = useAddComment();

  if (!markID) {
    return;
  } else {
    return (
      <div>
        <p>{markID}</p>
        <CommentEditor onChange={setEditorState} />
        <button
          type="submit"
          onClick={() => {
            console.log(markID, editorState);
            addComment.mutate(markID, editorState);
          }}
        >
          Submit
        </button>
      </div>
    );
  }
};

const Reader = (props) => {
  const [focusedHighlightID, setFocusedHighlightID] = useState();
  const remoteHighlights = props.annotations;

  return (
    <div
      id="reader"
      className="flex flex-row mt-2"
      onMouseOver={(e) => syncHoverBehavior(e, setFocusedHighlightID)}
    >
      <Article html={props.articleHtml} highlights={remoteHighlights} />
      <Comments focusedHighlightID={focusedHighlightID} />
    </div>
  );
};

export default Reader;
