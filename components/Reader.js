import { useRouter } from "next/router";
import { useState } from "react";
import {
  useFetchArticle,
  useFetchAnnotations,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
} from "hooks";
import useAuth from "hooks/auth";
import Article from "components/Article.js";
import TableOfContents from "components/TableOfContents.js";
import {
  getRangeFromSelection,
  isSelectionValid,
  isSelectionCollapsed,
  isClickingEmptyArea,
} from "utils";
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
  const annotationId = extractAnnotationIdFromEvent(e);
  if (annotationId) {
    removeAllHoverClasses();
    setFocusedHighlightId(annotationId);
    addHoverClassToRelatedHighlights(annotationId);
  }
}

function wrapHtml(rawHtml) {
  if (!rawHtml) return;
  return `<div id="content-highlightable">` + rawHtml + `</div>`;
}

const Reader = (props) => {
  const slug = useRouter().query.slug || []; // Initially returns undefined
  const sectionSlug = slug[slug.length - 1];
  const createAnnotation = useCreateAnnotation(sectionSlug);
  const deleteAnnotation = useDeleteAnnotation(sectionSlug);
  const [focusedHighlightId, setFocusedHighlightId] = useState();
  const {
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    data: article,
    error: errorArticle,
  } = useFetchArticle(sectionSlug);
  const {
    isLoading: isLoadingAnnotations,
    isError: isErrorAnnotations,
    data: annotations,
    error: errorAnnotations,
  } = useFetchAnnotations(sectionSlug);
  const { user } = useAuth();
  const [unauthorizedSelection, setUnauthorizedSelection] = useState(false);

  function handleMouseUp(e) {
    // Use inverted if statements to reduce nesting
    // Source: https://softwareengineering.stackexchange.com/a/18454
    setUnauthorizedSelection(false);
    if (isSelectionCollapsed()) {
      if (isClickingEmptyArea(e)) {
        setFocusedHighlightId(null);
        removeAllHoverClasses();
      }
      return;
    }
    if (!isSelectionValid(annotations)) {
      document.getSelection().collapse(null);
      return;
    }
    if (!user) {
      setUnauthorizedSelection(true);
      return;
    }
    const range = getRangeFromSelection(document.getSelection());
    createAnnotation.mutate(range[0], {
      onSuccess: (data) => {
        setFocusedHighlightId(data.uuid);
      },
    });
  }

  if (isLoadingArticle || isErrorArticle) return;
  return (
    <div
      className="grid grid-cols-6 gap-1 h-full overflow-hidden"
      onMouseOver={(e) => syncHoverBehavior(e, setFocusedHighlightId)}
      onMouseUp={(e) => handleMouseUp(e)}
    >
      <TableOfContents className="hidden md:grid col-start-1 col-span-1 overflow-y-auto px-3 pb-10" />
      <Article
        className="col-start-1 col-span-6 md:col-start-2 md:col-span-3 md:place-self-end px-2 overflow-y-auto h-full w-full"
        html={wrapHtml(article.articleHtml)}
        fetchedAnnotations={annotations}
        setFocusedHighlightId={setFocusedHighlightId}
        prev={article.prev}
        next={article.next}
      />
      <Comments
        unauthorizedSelection={unauthorizedSelection}
        className="hidden md:grid col-start-5 col-span-2 overflow-y-auto h-full"
        focusedHighlightId={focusedHighlightId}
        fetchedAnnotations={annotations}
      />
    </div>
  );
};

export default Reader;
