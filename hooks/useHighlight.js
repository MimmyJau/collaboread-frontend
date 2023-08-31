import { useEffect, useState } from "react";

import rangy from "rangy";
import "rangy/lib/rangy-classapplier";
import "rangy/lib/rangy-textrange";
import "rangy/lib/rangy-highlighter";

import { useGetUrl } from "hooks/pages";
import { useFetchAnnotations, useFetchArticle } from "hooks/api";

const highlightCountClasses = [
  "highlight_count_0",
  "highlight_count_1",
  "highlight_count_2",
  "highlight_count_3",
  "highlight_count_4",
];

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

function addHighlightCount(el) {
  let numberOfHighlights = 0;
  for (const className of el.classList) {
    if (className.startsWith("highlight-")) {
      numberOfHighlights += 1;
    }
  }
  numberOfHighlights = Math.min(4, numberOfHighlights);
  el.classList.add(highlightCountClasses[numberOfHighlights]);
}

function unselectSelection() {
  rangy.getSelection().collapseToEnd();
}

const useHighlight = () => {
  const [highlighter, setHighlighter] = useState(null);
  const { path } = useGetUrl();
  const { data: annotations, status: annotationStatus } =
    useFetchAnnotations(path);
  const { status: articleStatus } = useFetchArticle(path);

  useEffect(() => {
    rangy.init();
    const highlighter = rangy.createHighlighter();
    setHighlighter(highlighter);
  }, []);

  useEffect(() => {
    if (annotationStatus !== "success" || articleStatus !== "success") return;
    console.log("rendering");
    render(annotations);
    // We need to include `annotations` as a dependency because of the
    // case where user creates a new highlight ; the annotations will
    // change but the path and annotationStatus will not.
  }, [path, annotations, annotationStatus, articleStatus]);

  function highlightSelection(annotationUuid = crypto.randomUUID()) {
    const range = convertSelectionToRange(document.getSelection());
    // Source: https://github.com/timdown/rangy/issues/417#issuecomment-440244884
    const className = "highlight-" + annotationUuid;
    highlighter.addClassApplier(
      rangy.createClassApplier(className, {
        ignoreWhiteSpace: true,
        onElementCreate: (el) => {
          el.classList.add("highlight");
          el.dataset.annotationId = annotationUuid;
        },
        tagNames: ["span"],
      })
    );
    highlighter.highlightSelection(className, { exclusive: false });
    const elList = document.getElementsByClassName(className);
    for (const el of elList) {
      addHighlightCount(el);
    }

    return { uuid: annotationUuid, highlight: range };
  }

  function render(annotations) {
    if (!annotations || annotations.length === 0) return;
    const highlightableRoot = getHighlightableRoot();
    annotations.forEach((annotation, index) => {
      convertRangeToSelection(annotation.highlight);
      highlightSelection(annotation.uuid);
    });
    unselectSelection();
  }

  function create() {
    console.log("creating");
    return;
  }

  function clear() {
    console.log("clearing");
    return;
  }

  return {
    create: create,
    clear: clear,
  };
};

export default useHighlight;
