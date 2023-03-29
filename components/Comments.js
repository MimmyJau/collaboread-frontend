import { useState } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { useUpdateAnnotation } from "hooks";

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
  return;
  const [editorState, setEditorState] = useState();
  const markID = props.focusedHighlightId;
  const addComment = useUpdateAnnotation();

  if (!markID) {
    return;
  } else {
    return (
      <div className={`${props.className}`}>
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

export default Comments;
