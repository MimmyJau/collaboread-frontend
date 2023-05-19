import rangy from "rangy";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-textrange";
import "rangy/lib/rangy-highlighter";

function getHighlightableRoot() {
  return document.getElementById("content-highlightable");
}

export function getRangeFromSelection(selection) {
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

export function highlightSelection(
  annotationUuid = crypto.randomUUID(),
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

export function highlightFetchedAnnotations(
  annotations,
  setFocusedHighlightId
) {
  if (!annotations || annotations.length === 0) return;
  const highlightableRoot = getHighlightableRoot();
  annotations.forEach((annotation, index) => {
    setSelectionFromRange(annotation.highlight);
    highlightSelection(annotation.uuid, setFocusedHighlightId);
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

export function clearHighlight(annotationUuid, range) {
  setSelectionFromRange(range);
  unhighlightSelection();
  removeHangingSpanTags(annotationUuid);
}

export function isSelectionInArticle() {
  const selection = document.getSelection();
  const selectionRange = selection.getRangeAt(0);
  const content = document.getElementById("content-highlightable");
  return content.contains(selectionRange.commonAncestorContainer);
}

function isXInBetweenYAndZ(x, y, z) {
  return x >= y && x <= z;
}

function doHighlightsOverlap(h1, h2) {
  const h1s = h1[0].characterRange.start;
  const h1e = h1[0].characterRange.end;
  const h2s = h2[0].characterRange.start;
  const h2e = h2[0].characterRange.end;
  return isXInBetweenYAndZ(h1s, h2s, h2e) || isXInBetweenYAndZ(h2s, h1s, h1e);
}

export function doesHighlightOverlapWithAnnotations(newHighlight, annotations) {
  for (const oldAnnotation of annotations) {
    if (doHighlightsOverlap(newHighlight, oldAnnotation.highlight))
      return oldAnnotation;
  }
  return false;
}
