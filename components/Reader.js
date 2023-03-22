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

import { useAddHighlight, useAddComment, useRemoveHighlight } from "hooks";

function applyHighlighter(
  selection = document.getSelection(),
  annotationUuid = crypto.randomUUID(), // Each highlight has a unique ID so that we sync :hover behaviour.
  removeHighlight
) {
  // Source: https://github.com/timdown/rangy/issues/417#issuecomment-440244884
  rangy.init();
  const highlighter = rangy.createHighlighter();
  const highlightableRoot = getHighlightableRoot();
  const range = rangy.getSelection().saveCharacterRanges(highlightableRoot);
  highlighter.addClassApplier(
    rangy.createClassApplier("bg-yellow-300", {
      ignoreWhiteSpace: true,
      onElementCreate: (el) => {
        el.classList.add("highlight");
        el.dataset.annotationId = annotationUuid;
        el.onclick = () => {
          clearHighlight(annotationUuid, range);
          removeHighlight.mutate(annotationUuid);
        };
      },
      tagNames: ["span", "a"],
    })
  );
  highlighter.highlightSelection("bg-yellow-300");

  return { uuid: annotationUuid, highlight: range };
}

function getHighlightableRoot() {
  return document.getElementById("content-highlightable");
}

function highlightUserSelection({
  articleUuid,
  addHighlight,
  removeHighlight,
}) {
  const annotationFragment = applyHighlighter(
    document.getSelection(),
    crypto.randomUUID(),
    removeHighlight
  );
  addHighlight.mutate({ ...annotationFragment, articleUuid: articleUuid });
}

function highlightFetchedSelection(annotations, removeHighlight) {
  if (!annotations) return;
  const highlightableRoot = getHighlightableRoot();
  annotations.forEach((annotation, index) => {
    const highlight = annotation.highlight;
    const selection = rangy
      .getSelection()
      .restoreCharacterRanges(highlightableRoot, highlight);
    applyHighlighter(selection, annotation.uuid, removeHighlight);
    rangy.getSelection().collapseToEnd(); // To remove selection after adding highlight
  });
}

function clearHighlight(annotationUuid, range) {
  const highlighter = rangy.createHighlighter();
  const highlightableRoot = getHighlightableRoot();
  const selection = rangy
    .getSelection()
    .restoreCharacterRanges(highlightableRoot, range);
  highlighter.unhighlightSelection();

  // Remove remaining span tags
  // Source 1: https://stackoverflow.com/a/9848612/
  // Source 2: https://stackoverflow.com/a/4232971/
  const highlightFragments = document.querySelectorAll(
    `.highlight[data-annotation-id="${annotationUuid}"]`
  );
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

const HighlightRangeButton = (props) => {
  return (
    <button
      onClick={() => {
        const range = highlightUserSelection(props);
      }}
    >
      Highlight Range!
    </button>
  );
};

const Article = (props) => {
  const highlights = props.highlights;
  const { articleUuid } = useRouter().query;
  const addHighlight = useAddHighlight(articleUuid);
  const removeHighlight = useRemoveHighlight(articleUuid);

  useEffect(() => {
    highlightFetchedSelection(highlights, removeHighlight);
  }, [highlights]);

  return (
    <div>
      <Interweave content={props.html} />
      <div>
        <HighlightRangeButton
          articleUuid={articleUuid}
          addHighlight={addHighlight}
          removeHighlight={removeHighlight}
        />
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
  const [focusedHighlightID, setFocusedHighlightID] = useState();
  const remoteHighlights = props.annotations;

  return (
    <div
      id="reader"
      className="flex flex-row mt-2"
      onMouseOver={(e) => syncHoverBehavior(e, setFocusedHighlightID)}
    >
      <Article html={props.articleHtml} highlights={remoteHighlights} />
      <Comments focusedHighlightID={focusedHighlightID} />
    </div>
  );
};

export default Reader;
