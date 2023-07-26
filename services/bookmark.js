// import rangy from "rangy";
// import "rangy/lib/rangy-classapplier";
// import "rangy/lib/rangy-textrange";
// import "rangy/lib/rangy-highlighter";
const rangy = require("rangy");
require("rangy/lib/rangy-classapplier");
require("rangy/lib/rangy-textrange");
require("rangy/lib/rangy-highlighter");

if (typeof window !== "undefined") {
  // This code will only run on the client
  rangy.init();
  var bookmarker = rangy.createHighlighter("TextRange");
  const bookmarkClass = rangy.createClassApplier("bookmark");
  bookmarker.addClassApplier(bookmarkClass);
}

// Basically the new architecture is that bookmarker is a singleton
// that I use as the main parameter for all the hooks AND serves
// as the main interface to the rangy library.

// Bookmark here should represent a way of transforming the range
// data in react-query into something you can see in DOM.
// In another sense, the bookmark represents what's on the DOM.

// Private:
const DISTANCE_TO_MOVE = 1;

function clearBookmarks() {
  bookmarker.removeAllHighlights();
}

function convertRangeToSelection(range) {
  const root = document.getElementById("content-highlightable");
  rangy.getSelection().restoreCharacterRanges(root, range);
}

// The point of this function to have the bookmark not be inside the word,
// even if the user clicks inside the word directly.
function modifySelection() {
  // This collapses the selection and moves it to the end of the word.
  rangy.getSelection().move("word", DISTANCE_TO_MOVE);
  // This expands the selection to include the space / punctuation following the word.
  rangy.getSelection().expand("word");
}

function highlightSelection() {
  const highlight = bookmarker.highlightSelection("bookmark", {
    exclusive: false,
    containerElementId: "content-highlightable",
  });
  unselectSelection();
  return highlight;
}

// Public:
// bookmark.render(range???) to put it on the page, used by useRenderBookmark hook
// Step 0: Clear any existing highlights
// Step 1: Get range
// Step 2: Set selection from range
// Step 3: Modify selection (expand to include whole word).
// Step 4: Apply highlight
function render(range) {
  console.log("bookmarker", bookmarker);
  clearBookmarks();
  convertRangeToSelection(range);
  modifySelection();
  highlightSelection();
}

// bookmark.getRange() to use by updateBookmark hook

// The addition of import and export basically makes IIFE  obsolete.
const bookmark = {
  render: render,
  getRange: null,
};

export default bookmark;
