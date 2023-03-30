import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Interweave } from "interweave";
import rangy from "rangy";
import "rangy/lib/rangy-highlighter";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-textrange";
import { useCreateAnnotation, useDeleteAnnotation } from "hooks";

function getHighlightableRoot() {
  return document.getElementById("content-highlightable");
}

function getRangeFromSelection(selection) {
  const highlightableRoot = getHighlightableRoot();
  return rangy.getSelection().saveCharacterRanges(highlightableRoot);
}

function setSelectionFromRange(range) {
  const highlightableRoot = getHighlightableRoot();
  return rangy.getSelection().restoreCharacterRanges(highlightableRoot, range);
}

function unselectSelection() {
  rangy.getSelection().collapseToEnd();
}

function highlightSelection(
  annotationUuid = crypto.randomUUID(),
  deleteAnnotation,
  setFocusedHighlightId
) {
  const range = getRangeFromSelection(document.getSelection());
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
          deleteAnnotation.mutate(annotationUuid);
          setFocusedHighlightId(null);
        };
      },
      tagNames: ["span"],
    })
  );
  highlighter.highlightSelection("bg-yellow-300");

  return { uuid: annotationUuid, highlight: range };
}

function unhighlightSelection() {
  const highlighter = rangy.createHighlighter();
  highlighter.unhighlightSelection();
}

function highlightFetchedAnnotations(
  annotations,
  deleteAnnotation,
  setFocusedHighlightId
) {
  if (!annotations || annotations.length === 0) return;
  const highlightableRoot = getHighlightableRoot();
  annotations.forEach((annotation, index) => {
    setSelectionFromRange(annotation.highlight);
    highlightSelection(
      annotation.uuid,
      deleteAnnotation,
      setFocusedHighlightId
    );
  });
  unselectSelection();
}

/**
 * Unhighlighting a selection leaves behind span tags that are not
 *     associated with any highlights. This function removes those tags.
 * - Source 1: https://stackoverflow.com/a/9848612/
 * - Source 2: https://stackoverflow.com/a/4232971/
 * @param {string} annotationUuid
 * @returns {void}
 */
function removeHangingSpanTags(annotationUuid) {
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

function clearHighlight(annotationUuid, range) {
  setSelectionFromRange(range);
  unhighlightSelection();
  removeHangingSpanTags(annotationUuid);
}

const Article = (props) => {
  const { articleUuid } = useRouter().query;
  const deleteAnnotation = useDeleteAnnotation(articleUuid);

  useEffect(() => {
    highlightFetchedAnnotations(
      props.fetchedAnnotations,
      deleteAnnotation,
      props.setFocusedHighlightId
    );
  }, [props.fetchedAnnotations]);

  return (
    <div className={`prose article ${props.className}`}>
      <Interweave content={props.html} />
    </div>
  );
};

export { getRangeFromSelection, highlightSelection };
export default Article;
