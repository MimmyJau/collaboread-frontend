import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'

const printJSON = (editor) => {
  console.log(editor.getJSON())
}

const printHTML = (editor) => {
  console.log(editor.getHTML())
}

const printText = (editor) => {
  console.log(editor.getText())
}

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
      <button onClick={() => printJSON(editor)}>
        JSON
      </button>
      <button onClick={() => printHTML(editor)}>
        HTML
      </button>
      <button onClick={() => printText(editor)}>
        Text
      </button>
    </>
  )
}

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight,
    ],
    content: '<p>Hello World! 🌎</p><p></p><p>and this</p><p></p><p>but that</p>',
  })

  return (
    <>
      <MenuToolbar editor={editor}/>
      <EditorContent editor={editor} />
    </>
  )
}

export default Tiptap
