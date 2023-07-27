import rangy from "rangy";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-textrange";
import "rangy/lib/rangy-highlighter";

// Basically the new architecture is that bookmarker is a singleton
// that I use as the main parameter for all the hooks AND serves
// as the main interface to the rangy library.

// Bookmark here should represent a way of transforming the range
// data in react-query into something you can see in DOM.
// In another sense, the bookmark represents what's on the DOM.

// Needed so it only runs in client (not in NextJS)
if (typeof window !== "undefined") {
  // This code will only run on the client
  rangy.init();
  var bookmarker = rangy.createHighlighter();
  const bookmarkClass = rangy.createClassApplier("bookmark");
  bookmarker.addClassApplier(bookmarkClass);
}

function getHighlightableRoot() {
  return document.getElementById("content-highlightable");
}

function clearBookmarks() {
  bookmarker.removeAllHighlights();
}

function convertRangeToSelection(range) {
  const root = getHighlightableRoot();
  rangy.getSelection().restoreCharacterRanges(root, range);
}

function convertSelectionToRange(selection) {
  if (!selection) {
    selection = document.getSelection();
  }
  const root = getHighlightableRoot();
  return rangy.getSelection().saveCharacterRanges(root);
}

// The point of this function is to try a bunch of different ranges.
function unCollapseCollapsedRange(range) {
  // Get range (must be non-empty for highlighter to work)
  const root = getHighlightableRoot();
  const innerText = rangy.innerText(root);
  if (range[0].characterRange.end === innerText.length) {
    range[0].characterRange.start = range[0].characterRange.end - 1;
  } else {
    range[0].characterRange.end = range[0].characterRange.start + 1;
  }
  return range;
}

function getAdjacentRange(range) {
  if (!range) {
    range = convertSelectionToRange();
  }
  if (range[0].characterRange.start === 0) {
    return null;
  }
  range[0].characterRange.start -= 1;
  range[0].characterRange.end -= 1;
  return range;
}

function unselectSelection() {
  rangy.getSelection().collapseToEnd();
}

function highlightSelection() {
  const highlight = bookmarker.highlightSelection("bookmark", {
    exclusive: false,
    containerElementId: "content-highlightable",
  });
  unselectSelection();
  return highlight;
}

// bookmark.render(range???) to put it on the page, used by useRenderBookmark hook
// Step 1: Clear any existing highlights
// Step 2: Get range
// Step 3: Set selection from range
// Step 4: Apply highlight
function render(collapsedRange = convertSelectionToRange()) {
  clearBookmarks();
  let range = unCollapseCollapsedRange(collapsedRange);
  convertRangeToSelection(range);
  let highlight;
  // We don't know a priori if range will actually render anything to screen.
  // Rangy has some nuance on how it applies classes to whitespace.
  // So we loop here, trying adjacent ranges until something sticks.
  do {
    highlight = highlightSelection();
    if (!highlight.length) {
      range = getAdjacentRange(range);
      convertRangeToSelection(range);
    }
  } while (!highlight.length);
}

// bookmark.getRange() to use by updateBookmark hook

// The addition of import and export basically makes IIFE  obsolete.
const bookmark = {
  render: render,
  getRange: null,
};

export default bookmark;
