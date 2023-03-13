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
      "<p>Sup my dudes <strong>we are here</strong> in the dumbest <em>place</em> in the <strong><em>world</em></strong>. I'm so dumb lol.</p><ul><li><p>Because I'm smart</p></li><li><p>I'm not a genius</p></li><li><p>Third point.</p></li></ul><p>And that's the end of that lol.</p>",
  });

  return (
    <div className="prose">
      <MenuToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
