import { useEffect, useState } from "react";

import Pagination from "components/Pagination";
import { useFetchArticle } from "hooks/api";
import useAuth from "hooks/auth";
import useBookmark from "hooks/useBookmark";
import useHighlight from "hooks/useHighlight";
import { useGetUrl, useRenderHighlights } from "hooks/pages";
import {
  addHoverClassToRelatedHighlights,
  isClickingNonHighlightedAreaInArticle,
  isSelectionCollapsed,
  removeAllHoverClasses,
} from "utils";

function extractAnnotationIdFromEvent(e) {
  return e.target.dataset.annotationId || "";
}

const Article = (props) => {
  const { user } = useAuth();
  const { book, path } = useGetUrl();
  const { data: article, status } = useFetchArticle(path);
  const Bookmark = useBookmark();
  const Highlight = useHighlight();
  // useRenderHighlights();

  function syncHoverBehavior(e) {
    if (e.buttons !== 0) return;
    const annotationId = extractAnnotationIdFromEvent(e);
    if (annotationId) {
      removeAllHoverClasses();
      props.setFocus(annotationId);
      addHoverClassToRelatedHighlights(annotationId);
    }
  }

  function handleMouseUp(e) {
    if (!isSelectionCollapsed()) return;
    if (!isClickingNonHighlightedAreaInArticle(e)) return;
    if (!user) return;
    Bookmark.update();
    removeAllHoverClasses();
  }

  if (status !== "success") return;
  return (
    <div
      className={`flex flex-col items-center ${props.className}`}
      onMouseOver={(e) => syncHoverBehavior(e, props.setFocus)}
    >
      <Pagination prevHref={article.prev} nextHref={article.next} />
      <div
        id="article"
        className="prose w-full"
        onMouseUp={(e) => handleMouseUp(e)}
      >
        <div id="content-highlightable">
          <div dangerouslySetInnerHTML={{ __html: article.articleHtml }} />
        </div>
      </div>
      <Pagination prevHref={article.prev} nextHref={article.next} />
    </div>
  );
};

export default Article;
