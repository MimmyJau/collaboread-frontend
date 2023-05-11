import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const Editor = ({
  annotationUuid,
  content,
  onChange,
  placeholder,
  setEditor,
  style,
}) => {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: placeholder || "",
        }),
      ],
      content: content || "",
      editorProps: {
        attributes: {
          class:
            style ||
            "py-2 px-1 bg-white rounded border border-white focus:outline-none focus:border focus:border-green-700",
        },
      },
      onUpdate: ({ editor }) => {
        onChange.html(editor.getHTML());
        onChange.json(JSON.stringify(editor.getJSON()));
        onChange.text(editor.getText());
      },
    },
    [annotationUuid]
  );

  useEffect(() => {
    setEditor(editor);
  }, [editor, setEditor]);

  return <EditorContent editor={editor} />;
};

export default Editor;
