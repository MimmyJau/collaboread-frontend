import { useRouter } from "next/router";
import { useState } from "react";

import {
  useFetchArticle,
  useFetchAnnotations,
  useCreateAnnotation,
  useDeleteAnnotation,
} from "hooks";
import useAuth from "hooks/auth";
import Article from "components/Article.js";
import TableOfContents from "components/TableOfContents.js";
import {
  getRangeFromSelection,
  isClickingEmptyArea,
  isSelectionValid,
  isSelectionCollapsed,
  isSelectionInElementById,
  removeAllHoverClasses,
  createOrUpdateBookmark,
} from "utils";
import Comments from "components/Comments.js";

const Reader = (props) => {
  const slugList = useRouter().query.slug || []; // Initially returns undefined
  const slug = slugList.join("/");
  const createAnnotation = useCreateAnnotation(slug);
  const deleteAnnotation = useDeleteAnnotation(slug);
  const [focusedHighlightId, setFocusedHighlightId] = useState();
  const {
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    data: article,
    error: errorArticle,
  } = useFetchArticle(slug);
  const {
    isLoading: isLoadingAnnotations,
    isError: isErrorAnnotations,
    data: annotations,
    error: errorAnnotations,
  } = useFetchAnnotations(slug);
  const { user } = useAuth();
  const [unauthorizedSelection, setUnauthorizedSelection] = useState(false);

  function handleMouseUp(e) {
    // Use inverted if statements to reduce nesting
    // Source: https://softwareengineering.stackexchange.com/a/18454
    setUnauthorizedSelection(false);
    if (isSelectionCollapsed()) {
      if (isClickingEmptyArea(e)) {
        setFocusedHighlightId(null);
        // NOTE: May not want to set focusedHighlight to null
        // Add bookmark
        createOrUpdateBookmark();
        removeAllHoverClasses();
      }
      return;
    }
    if (isSelectionInElementById("Comments")) {
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
      onMouseUp={(e) => handleMouseUp(e)}
    >
      <TableOfContents className="hidden md:flex md:flex-col col-start-1 col-span-1 overflow-y-auto px-3 pb-10" />
      <Article
        className="col-start-1 col-span-6 md:col-start-2 md:col-span-3 md:place-self-end px-2 overflow-y-auto h-full w-full"
        html={article.articleHtml}
        fetchedAnnotations={annotations}
        prev={article.prev}
        next={article.next}
        setFocus={setFocusedHighlightId}
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
