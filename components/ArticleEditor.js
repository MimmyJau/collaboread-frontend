import { useRouter } from "next/router";
import { useEditor, EditorContent } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import BulletList from "@tiptap/extension-bullet-list";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import Superscript from "@tiptap/extension-superscript";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";

import { lowlight } from "lowlight/lib/core";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";

lowlight.registerLanguage("js", js);
lowlight.registerLanguage("ts", ts);

import { useUpdateArticle } from "hooks/api";

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

const addImage = (editor) => {
  const url = window.prompt("URL");
  if (url) {
    editor.chain().focus().setImage({ src: url }).run();
  }
};

const toggleLink = (editor) => {
  const url = window.prompt("URL");
  if (url) {
    editor.chain().focus().toggleLink({ href: url, target: "_blank" }).run();
  }
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
  const slugList = useRouter().query.slugs || [];
  const slug = slugList.join("/");
  const updateArticle = useUpdateArticle(slug);
  return (
    <div className="flex flex-col sticky z-10 top-0 bg-white">
      <div className="flex">
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
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        />
        <MenuButton
          name="h2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <MenuButton
          name="Highlight"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />
        <MenuButton
          name="Blockquotes"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <MenuButton
          name="Bullets"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <MenuButton
          name="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
        <MenuButton
          name="Code block"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <MenuButton name="Link" onClick={() => toggleLink(editor)} />
        <MenuButton
          name="Unlink"
          onClick={() => editor.chain().focus().unsetLink().run()}
        />
        <MenuButton name="Image" onClick={() => addImage(editor)} />
        <MenuButton
          name="Superscript"
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        />
      </div>
      <div className="flex">
        <MenuButton
          name="Insert Table"
          onClick={() => {
            editor
              .chain()
              .focus()
              .insertTable({ rows: 2, cols: 1, withHeaderRow: true })
              .run();
          }}
        />
        <MenuButton
          name="Delete Col"
          onClick={() => editor.chain().focus().deleteColumn().run()}
        />
        <MenuButton
          name="Delete Table"
          onClick={() => editor.chain().focus().deleteTable().run()}
        />
      </div>
      <div className="flex">
        <MenuButton name="JSON" onClick={() => printJson(editor)} />
        <MenuButton name="HTML" onClick={() => printHtml(editor)} />
        <MenuButton name="Text" onClick={() => printText(editor)} />
        <MenuButton
          name="Save"
          onClick={() =>
            updateArticle.mutate({
              html: editor.getHTML(),
              json: editor.getJSON(),
              text: editor.getText(),
            })
          }
        />
      </div>
    </div>
  );
};

const Editor = (props) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Highlight,
      Link.configure({ openOnClick: false }),
      ListItem,
      Image,
      Superscript,
      Table.configure({
        HTMLAttributes: {
          class: "gray-table",
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: props.content || "",
    editorProps: {
      attributes: {
        class:
          props.className ||
          "prose bg-white rounded border border-gray-200 overflow-y-scroll focus:outline-none focus:border focus:border-gray-400 hover:border hover:border-gray-300",
      },
    },
  });

  return (
    <div className="flex flex-col w-screen">
      <MenuToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export { Editor };
