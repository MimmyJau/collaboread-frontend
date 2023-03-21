import { useRouter } from "next/router";
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
  id = crypto.randomUUID() // Each highlight has a unique ID so that we sync :hover behaviour.
) {
  // Source: https://github.com/timdown/rangy/issues/417#issuecomment-440244884
  rangy.init();
  const highlighter = rangy.createHighlighter();
  highlighter.addClassApplier(
    rangy.createClassApplier("bg-yellow-300", {
      ignoreWhiteSpace: true,
      onElementCreate: (el) => {
        el.classList.add("highlight");
        el.dataset.annotationId = id;
        el.onclick = () => removeHighlight(id);
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
    crypto.randomUUID(),
    highlights
  );
  const highlightableRoot = getHighlightableRoot();
  // saveCharacterRanges() saves range relative to normalized text
  const range = rangy.getSelection().saveCharacterRanges(highlightableRoot);
  range.id = id;
  return range;
}

function highlightFetchedSelection(annotations) {
  if (!annotations) return;
  const highlightableRoot = getHighlightableRoot();
  annotations.forEach((annotation, index) => {
    const highlight = annotation.highlight;
    let selection = rangy.getSelection();
    selection = selection.restoreCharacterRanges(highlightableRoot, highlight);
    applyHighlighter(selection, annotation.uuid);
    rangy.getSelection().collapseToEnd(); // To remove selection after adding highlight
  });
}

function removeHighlight(id) {
  /*
  const highlighter = rangy.createHighlighter();
  const highlightableRoot = getHighlightableRoot();
  const selection = rangy
    .getSelection()
    .restoreCharacterRanges(highlightableRoot, JSON.parse(highlights[id]));
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
  */
  // Remove highlight from DOM and send react-query mutate to delete from backend
  console.log("removing" + id + "!");
}

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

function saveHighlight(props, range) {
  props.highlights[range.id] = JSON.stringify(range);
  props.setHighlights({
    ...props.highlights,
    [range.id]: JSON.stringify(range),
  });
}

const HighlightRangeButton = (props) => {
  const addHighlight = useAddHighlight();
  const { uuid } = useRouter().query;
  const articleUuid = uuid;

  return (
    <button
      onClick={() => {
        const range = highlightUserSelection(props);
        saveHighlight(props, range);
        addHighlight.mutate({
          uuid: range.id,
          highlight: range,
          articleUuid: articleUuid,
        });
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
        highlightFetchedSelection(props.highlights);
      }}
    >
      Insert Highlight!
    </button>
  );
};

const fetchedHTML = `
  <div id="content-highlightable" class="prose"><p>Sup my dudes <strong>we are here</strong> in the dumbest <em>place</em> in the <strong><em>world</em></strong>. I'm so dumb lol.</p><ul><li><p>Because I'm smart</p></li><li><p>I'm not a genius</p></li><li><p>Third point.</p></li></ul><p>And that's the end of that lol.</p></div>
`;

const Article = (props) => {
  const highlights = props.highlights;
  const setHighlights = props.setHighlights;
  useEffect(() => {
    highlightFetchedSelection(highlights);
  }, [highlights]);

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
  const remoteHighlights = props.annotations;

  return (
    <div
      id="reader"
      className="flex flex-row mt-2"
      onMouseOver={(e) => syncHoverBehavior(e, setFocusedHighlightID)}
    >
      <Article
        html={props.articleHtml}
        highlights={remoteHighlights}
        setHighlights={setHighlights}
      />
      <Comments focusedHighlightID={focusedHighlightID} />
    </div>
  );
};

export default Reader;
