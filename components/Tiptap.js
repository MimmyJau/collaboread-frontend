import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";

const printJson = (editor) => {
  console.log(editor.getJSON());
  console.log(JSON.stringify(editor.getJSON()));
};

const printHtml = (editor) => {
  console.log(editor.getHTML());
};

const printText = (editor) => {
  console.log(editor.getText());
};

const MenuToolbar = ({ editor }) => {
  return (
    <>
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        Bold
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>
        Italics
      </button>
      <button onClick={() => editor.chain().focus().toggleHighlight().run()}>
        Highlight
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
        toggleBulletList
      </button>
      <button onClick={() => printJson(editor)}>JSON</button>
      <button onClick={() => printHtml(editor)}>HTML</button>
      <button onClick={() => printText(editor)}>Text</button>
    </>
  );
};

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit, Highlight, BulletList, ListItem],
    content:
      "<p>Hi this is a test document for collaboread. It consists of <strong>bold text</strong>, <em>italics text</em>, and combined <strong><em>bold and italics</em></strong>. It also consists of the following bullet points:</p><ul><li><p>This is the first bullet point. It might have some <em>styled text</em>.</p></li><li><p>This is the second bullet point, it might not have any textx.</p></li><li><p>This is the third and last bullet point. It's important that we can highlight across bullet points :)</p></li></ul><p>This is the last paragraph. Hope you enjoyed!</p>",
  });

  return (
    <div className="prose">
      <MenuToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
