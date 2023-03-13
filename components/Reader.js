import { useEffect, useState } from "react";

import { Interweave } from "interweave";
import rangy from "rangy";
import "rangy/lib/rangy-highlighter";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-textrange";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { useAddHighlight, useAddComment } from "hooks";

function applyHighlighter(
  selection = document.getSelection(),
  id = "markID-" + crypto.randomUUID(), // Each highlight has a unique ID so that we sync :hover behaviour.
  highlights // Pass highlights state so we can delete highlight later.
) {
  // Source: https://github.com/timdown/rangy/issues/417#issuecomment-440244884
  rangy.init();
  const highlighter = rangy.createHighlighter();
  highlighter.addClassApplier(
    rangy.createClassApplier("bg-yellow-300", {
      ignoreWhiteSpace: true,
      onElementCreate: (el) => {
        el.classList.add(id);
        el.onclick = () => removeHighlight(highlights, id);
      },
      tagNames: ["span", "a"],
    })
  );
  highlighter.highlightSelection("bg-yellow-300");

  return id;
}

function getHighlightableRoot() {
  return document.getElementById("content-highlightable");
}

function highlightUserSelection({ highlights }) {
  const id = applyHighlighter(
    document.getSelection(),
    "markID-" + crypto.randomUUID(),
    highlights
  );
  const highlightableRoot = getHighlightableRoot();
  const range = rangy.getSelection().saveCharacterRanges(highlightableRoot);
  range.id = id;
  return range;
}

function highlightFetchedSelection({ highlights }) {
  const highlightableRoot = getHighlightableRoot();
  for (const id in highlights) {
    const highlight = highlights[id];
    const selection = rangy
      .getSelection()
      .restoreCharacterRanges(highlightableRoot, highlight);
    applyHighlighter(selection, id, highlights);
  }

  rangy.getSelection().collapseToEnd(); // To remove selection after adding highlight
}

function removeHighlight(highlights, id) {
  const highlighter = rangy.createHighlighter();
  const highlightableRoot = getHighlightableRoot();
  const selection = rangy
    .getSelection()
    .restoreCharacterRanges(highlightableRoot, highlights[id]);
  highlighter.unhighlightSelection();

  // Remove remaining span tags
  // Source 1: https://stackoverflow.com/a/9848612/
  // Source 2: https://stackoverflow.com/a/4232971/
  const highlightFragments = document.querySelectorAll("." + id);
  highlightFragments.forEach((el) => {
    const pa = el.parentNode;
    while (el.firstChild) {
      pa.insertBefore(el.firstChild, el);
    }
    pa.removeChild(el);
  });
}

function syncHoverBehavior(e, setFocusedHighlightID) {
  function removeHover() {
    // We use Array.from() since geElementsByClassName returns a live collection.
    // Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection
    const relatedMarks = document.getElementsByClassName("bg-yellow-400");
    for (const mark of Array.from(relatedMarks)) {
      mark.classList.remove("bg-yellow-400");
    }
  }

  function getMarkID(e) {
    const classList = e.target.classList;
    for (const className of classList) {
      if (className.includes("markID")) {
        return className;
      }
    }
    return false;
  }

  removeHover();
  const markID = getMarkID(e);

  if (markID) {
    setFocusedHighlightID(markID);
    const relatedMarks = document.getElementsByClassName(markID);
    for (const mark of relatedMarks) {
      mark.classList.add("bg-yellow-400");
    }
  }
}

function saveRange(props, range) {
  props.highlights[range.id] = range;
  props.setHighlights({
    ...props.highlights,
    [range.id]: range,
  });
}

const HighlightRangeButton = (props) => {
  const addHighlight = useAddHighlight();

  return (
    <button
      onClick={() => {
        const range = highlightUserSelection(props);
        saveRange(props, range);
        addHighlight.mutate(range.id, range);
      }}
    >
      Highlight Range!
    </button>
  );
};

const InsertHighlightButton = (props) => {
  return (
    <button
      onClick={() => {
        highlightFetchedSelection(props);
      }}
    >
      Insert Highlight!
    </button>
  );
};

const fetchedHTML = `
  <div id="content-highlightable" class="prose"><p>Sup my dudes <strong>we are here</strong> in the dumbest <em>place</em> in the <strong><em>world</em></strong>. I'm so dumb lol.</p><ul><li><p>Because I'm smart</p></li><li><p>I'm not a genius</p></li><li><p>Third point.</p></li></ul><p>And that's the end of that lol.</p></div>
`;

const Document = (props) => {
  const highlights = props.highlights;
  const setHighlights = props.setHighlights;

  return (
    <div>
      <Interweave content={props.html} />
      <div>
        <HighlightRangeButton
          highlights={highlights}
          setHighlights={setHighlights}
        />
      </div>
      <div>
        <InsertHighlightButton highlights={highlights} />
      </div>
    </div>
  );
};

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
  const [highlights, setHighlights] = useState({});
  const [focusedHighlightID, setFocusedHighlightID] = useState();

  return (
    <div
      id="reader"
      className="flex flex-row mt-2"
      onMouseOver={(e) => syncHoverBehavior(e, setFocusedHighlightID)}
    >
      <Document
        html={props.documentHtml}
        highlights={highlights}
        setHighlights={setHighlights}
      />
      <Comments focusedHighlightID={focusedHighlightID} />
    </div>
  );
};

export default Reader;
