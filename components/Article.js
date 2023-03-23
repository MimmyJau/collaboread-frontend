import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Interweave } from "interweave";
import rangy from "rangy";
import "rangy/lib/rangy-highlighter";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-textrange";

import { useAddHighlight, useRemoveHighlight } from "hooks";

function getRangeFromSelection(selection) {
  rangy.init();
  const highlightableRoot = getHighlightableRoot();
  return rangy.getSelection().saveCharacterRanges(highlightableRoot);
}

function onHighlightCreate(el) {}

function applyHighlighter(
  selection = document.getSelection(),
  annotationUuid = crypto.randomUUID(),
  removeHighlight
) {
  const range = getRangeFromSelection(selection);
  // Source: https://github.com/timdown/rangy/issues/417#issuecomment-440244884
  const highlighter = rangy.createHighlighter();
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
      tagNames: ["span"],
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

export default Article;
