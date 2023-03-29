import { useRouter } from "next/router";
import { useState } from "react";
import {
  useFetchArticleHtml,
  useFetchAnnotations,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
} from "hooks";
import Article from "components/Article.js";
import {
  getRangeFromSelection,
  highlightSelection,
} from "components/Article.js";
import Comments from "components/Comments.js";

function addClassToElements(elements, className) {
  for (const element of elements) {
    element.classList.add(className);
  }
}

function removeClassFromElements(elements, className) {
  for (const element of elements) {
    element.classList.remove(className);
  }
}

function getAllHoveredHighlights() {
  return document.getElementsByClassName("bg-yellow-400");
}

function addHoverClassToRelatedHighlights(annotationId) {
  const relatedHighlights = getRelatedHighlights(annotationId);
  addClassToElements(relatedHighlights, "bg-yellow-400");
}

function removeAllHoverClasses() {
  // We use Array.from() since geElementsByClassName returns a live collection.
  // Source: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection
  const hoveredHighlights = Array.from(getAllHoveredHighlights());
  removeClassFromElements(hoveredHighlights, "bg-yellow-400");
}

function extractAnnotationIdFromEvent(e) {
  return e.target.dataset.annotationId || "";
}

function getRelatedHighlights(annotationId) {
  return document.querySelectorAll(
    `.highlight[data-annotation-id="${annotationId}"]`
  );
}

function syncHoverBehavior(e, setFocusedHighlightId) {
  removeAllHoverClasses();

  const annotationId = extractAnnotationIdFromEvent(e);
  if (annotationId) {
    setFocusedHighlightId(annotationId);
    addHoverClassToRelatedHighlights(annotationId);
  }
}

function wrapHtml(rawHtml) {
  if (!rawHtml) return;
  return `<div id="content-highlightable">` + rawHtml + `</div>`;
}

function isSelectionInArticle() {
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

function doesHighlightOverlapWithAnnotations(newHighlight, annotations) {
  for (const oldAnnotation of annotations) {
    if (doHighlightsOverlap(newHighlight, oldAnnotation.highlight))
      return oldAnnotation;
  }
  return false;
}

function mergeHighlights(newHighlight, oldAnnotation) {
  const oldHighlight = oldAnnotation.highlight;
  const highlightStart = Math.min(
    newHighlight[0].characterRange.start,
    oldHighlight[0].characterRange.start
  );
  const highlightEnd = Math.max(
    newHighlight[0].characterRange.end,
    oldHighlight[0].characterRange.end
  );
  return {
    ...oldAnnotation,
    highlight: [
      {
        ...oldAnnotation.highlight[0],
        characterRange: {
          start: highlightStart,
          end: highlightEnd,
        },
      },
    ],
  };
}

const Reader = (props) => {
  const router = useRouter();
  const { articleUuid } = router.query;
  const createAnnotation = useCreateAnnotation(articleUuid);
  const updateAnnotation = useUpdateAnnotation(articleUuid);
  const deleteAnnotation = useDeleteAnnotation(articleUuid);
  const [focusedHighlightId, setFocusedHighlightId] = useState();
  const {
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    data: dataArticle,
    error: errorArticle,
  } = useFetchArticleHtml(articleUuid);
  const {
    isLoading: isLoadingAnnotations,
    isError: isErrorAnnotations,
    data: dataAnnotations,
    error: errorAnnotations,
  } = useFetchAnnotations(articleUuid);

  function highlightAndSaveSelection() {
    if (document.getSelection().isCollapsed) return;
    if (!isSelectionInArticle()) return;
    const newHighlight = getRangeFromSelection(document.getSelection());
    const overlappingAnnotation = doesHighlightOverlapWithAnnotations(
      newHighlight,
      dataAnnotations
    );
    if (overlappingAnnotation) {
      const mergedHighlight = mergeHighlights(
        newHighlight,
        overlappingAnnotation
      );
      updateAnnotation.mutate(mergedHighlight);
    } else {
      const highlight = highlightSelection(
        crypto.randomUUID(),
        deleteAnnotation,
        setFocusedHighlightId
      );
      createAnnotation.mutate(highlight);
    }
  }

  if (isLoadingArticle) {
    return;
  }
  if (isErrorArticle) {
    return <span>{error.message}</span>;
  }
  return (
    <div
      className="grid grid-cols-3 gap-1"
      onMouseOver={(e) => syncHoverBehavior(e, setFocusedHighlightId)}
      onMouseUp={() => highlightAndSaveSelection()}
    >
      <span>{focusedHighlightId}</span>
      <Article
        className="col-start-1 col-span-2 place-self-end"
        html={wrapHtml(dataArticle.articleHtml)}
        fetchedAnnotations={dataAnnotations}
        setFocusedHighlightId={setFocusedHighlightId}
      />
      <Comments
        className="col-start-3"
        focusedHighlightId={focusedHighlightId}
        fetchedAnnotations={dataAnnotations}
      />
    </div>
  );
};

export default Reader;
