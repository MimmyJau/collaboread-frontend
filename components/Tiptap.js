import { useRouter } from "next/router";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Paragraph from "@tiptap/extension-paragraph";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";

import { useUpdateArticle } from "hooks";

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

const MenuButton = ({ name, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 mr-1 bg-gray-100 rounded hover:bg-gray-200 hover:text-blue-500"
    >
      {name}
    </button>
  );
};

const MenuToolbar = ({ editor }) => {
  const { articleUuid } = useRouter().query;
  const updateArticle = useUpdateArticle(articleUuid);
  return (
    <div className="sticky z-10 top-0 bg-white">
      <MenuButton
        name="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <MenuButton
        name="Italics"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <MenuButton
        name="h1"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      />
      <MenuButton
        name="h2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <MenuButton
        name="h3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />
      <MenuButton
        name="h4"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      />
      <MenuButton
        name="Highlight"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      />
      <MenuButton
        name="Bullets"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <MenuButton name="JSON" onClick={() => printJson(editor)} />
      <MenuButton name="HTML" onClick={() => printHtml(editor)} />
      <MenuButton name="Text" onClick={() => printText(editor)} />
      <MenuButton
        name="Save"
        onClick={() =>
          updateArticle.mutate({
            html: editor.getHTML(),
            json: editor.getJSON(),
          })
        }
      />
    </div>
  );
};

const Tiptap = (props) => {
  const editor = useEditor({
    extensions: [StarterKit, Highlight, BulletList, ListItem],
    content:
      props.content ||
      "<p>Hi this is a test document for collaboread. It consists of <strong>bold text</strong>, <em>italics text</em>, and combined <strong><em>bold and italics</em></strong>. It also consists of the following bullet points:</p><ul><li><p>This is the first bullet point. It might have some <em>styled text</em>.</p></li><li><p>This is the second bullet point, it might not have any textx.</p></li><li><p>This is the third and last bullet point. It's important that we can highlight across bullet points :)</p></li></ul><p>This is the last paragraph. Hope you enjoyed!</p>",
    editorProps: {
      attributes: {
        class:
          props.className ||
          "prose bg-white rounded border border-gray-200 overflow-y-scroll focus:outline-none focus:border focus:border-gray-400 hover:border hover:border-gray-300",
      },
    },
  });

  return (
    <div className="flex w-screen">
      <div className="">
        <MenuToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
