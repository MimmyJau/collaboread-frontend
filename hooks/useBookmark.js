import { useEffect, useState } from "react";

import rangy from "rangy";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-textrange";
import "rangy/lib/rangy-highlighter";

import {
  useCreateBookmark,
  useFetchArticle,
  useFetchBookmark,
} from "hooks/api";
import { useGetUrl } from "hooks/pages";

/* These helper functions could go into
 * a class that inherits from rangy.
 */

function getHighlightableRoot() {
  return document.getElementById("content-highlightable");
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

function newRange() {
  if (!range) {
    range = rangy.createRange().toCharacterRange();
  }
  return [
    {
      characterRange: range,
    },
  ];
}

// The only thing we expose is the getter function since
// updating the bookmark is triggered by user event (aka clicking).
// Rendering the bookmark and creating a new bookmark is behaviour
// we want done automatically, so we don't need to expose anything.
// As a result, the behaviour is encapsulated in a useEffect hook.
const useBookmark = () => {
  const [bookmarker, setBookmarker] = useState(null);

  const { book, path } = useGetUrl();
  const createBookmark = useCreateBookmark(book);
  const { status: articleStatus } = useFetchArticle(path);
  const { data: bookmark, status: bookmarkStatus } = useFetchBookmark(book);

  // Rangy needs to be on client to work, so we need to use useEffect
  useEffect(() => {
    rangy.init();
    const bookmarker = rangy.createHighlighter();
    const bookmarkClass = rangy.createClassApplier("bookmark");
    bookmarker.addClassApplier(bookmarkClass);
    setBookmarker(bookmarker);
  }, []);

  //  This hooks will either render existing bookmark or
  //  create a new bookmark automatically.
  useEffect(() => {
    if (bookmarkStatus !== "success" || articleStatus !== "success") return;
    if (bookmark === null) {
      const bookmark = newBookmark();
      createBookmark.mutate(bookmark);
      return;
    }
    const isBookmarkInThisSection = bookmark.article === path;
    if (isBookmarkInThisSection) {
      render(bookmark.highlight);
    }
    // We need to include `data` as a dependency because of the
    // case where user creates a new bookmark ; the data will
    // change but the path and bookmarkStatus will not.
  }, [path, bookmark, bookmarkStatus, articleStatus]);

  function clearBookmarks() {
    bookmarker.removeAllHighlights();
  }

  function highlightSelection() {
    const highlight = bookmarker.highlightSelection("bookmark", {
      exclusive: false,
      containerElementId: "content-highlightable",
    });
    unselectSelection();
    return highlight;
  }

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

  function newBookmark(range) {
    return {
      book: book,
      article: path,
      highlight: newRange(),
    };
  }

  function getBookmark() {
    return {
      uuid: bookmark.uuid,
      book: book,
      article: path,
      highlight: convertSelectionToRange(),
    };
  }

  return {
    get bookmark() {
      return getBookmark();
    },
  };
};

export default useBookmark;
