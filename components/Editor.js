import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

const Editor = (props) => {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: props.placeholder || "",
        }),
      ],
      content: props.content || "",
      editorProps: {
        attributes: {
          class:
            props.style ||
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

export default Editor;
