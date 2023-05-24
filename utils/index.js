import rangy from "rangy";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-textrange";
import "rangy/lib/rangy-highlighter";

function getHighlightableRoot() {
  return document.getElementById("content-highlightable");
}

// Returns a Range object based on selection. Like highlightSelection,
// it requires that the selection already exist. This is a weird API.
export function getRangeFromSelection(selection) {
  const highlightableRoot = getHighlightableRoot();
  return rangy.getSelection().saveCharacterRanges(highlightableRoot);
}

//Given a range object, convert it to a selection.
function setSelectionFromRange(range) {
  const highlightableRoot = getHighlightableRoot();
  return rangy.getSelection().restoreCharacterRanges(highlightableRoot, range);
}

function unselectSelection() {
  rangy.getSelection().collapseToEnd();
}

/**
 * Contains the main logic for actually adding span tags for highlighting.
 *
 * It requires that the selection already exist. This is a weird API.
 * The selection should occur in this function instead of outside.
 *
 * Additionally, return object is bizarre. Right now after creating a highlight
 * we then POST it to API. However, this leads to two flows, one from fetched
 * annotations (that goes back -> front) and one for user-created annotations
 * (that goes front -> back). We should unify these flows.
 *
 * I would also like to refactor deleteAnnotation so it doesn't have to be prop
 * drilled so deeply. I don't think we can do this with context. Perhaps we can
 * do this instead with useRef. Wait actually it's not required at all...
 *
 * @param {string} annotationUuid: Property allowing us to reference
 * @param {function} deleteAnnotation: Function to delete annotation
 * @param {Document} doc: New param to specific document to use
 * returns {object} { uuid: annotationUuid, highlight: range }
 */
function highlightSelection(annotationUuid = crypto.randomUUID()) {
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

// Take remote annotations and adds their highlights to current DOM window.
// We want to modify this function so that it works on our virtual DOM object.
export function highlightFetchedAnnotations(annotations) {
  if (!annotations || annotations.length === 0) return;
  const highlightableRoot = getHighlightableRoot();
  annotations.forEach((annotation, index) => {
    setSelectionFromRange(annotation.highlight);
    highlightSelection(annotation.uuid);
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

function doAnyHighlightsOverlap(newHighlight, annotations) {
  for (const oldAnnotation of annotations) {
    if (doHighlightsOverlap(newHighlight, oldAnnotation.highlight))
      return oldAnnotation;
  }
  return false;
}

export function isSelectionCollapsed() {
  return document.getSelection().isCollapsed;
}

function isSelectionOverlapping(annotations) {
  const range = getRangeFromSelection(document.getSelection());
  return doAnyHighlightsOverlap(range, annotations);
}

function isSelectionInArticle() {
  const selection = document.getSelection();
  const selectionRange = selection.getRangeAt(0);
  const content = document.getElementById("content-highlightable");
  return content.contains(selectionRange.commonAncestorContainer);
}

export function isSelectionValid(annotations) {
  return !isSelectionOverlapping(annotations) && isSelectionInArticle();
}

function isMouseInArticle(e) {
  return document.getElementById("article").contains(e.target);
}

function isMouseInHighlight(e) {
  return e.target.classList.contains("highlight");
}

export function isClickingEmptyArea(e) {
  return isMouseInArticle(e) && !isMouseInHighlight(e);
}
