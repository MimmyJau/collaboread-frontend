import { useRouter } from "next/router";
import { useState } from "react";

import { useCreateAnnotation, useFetchBookmark } from "hooks/api";
import useAuth from "hooks/auth";
import { useGetUrl } from "hooks/pages";
import Article from "components/Article.js";
import TableOfContents from "components/TableOfContents.js";
import {
  getRangeFromSelection,
  isClickingNonHighlightedAreaInArticle,
  isSelectionCollapsed,
  isSelectionInElementById,
  removeAllHoverClasses,
} from "utils";
import Comments from "components/Comments.js";

const Reader = (props) => {
  const { book, path } = useGetUrl();
  const { user } = useAuth();
  const [focusedHighlightId, setFocusedHighlightId] = useState();
  const [unauthorizedSelection, setUnauthorizedSelection] = useState(false);
  const createAnnotation = useCreateAnnotation(path);

  function handleMouseUp(e) {
    // Use inverted if statements to reduce nesting
    // Source: https://softwareengineering.stackexchange.com/a/18454
    setUnauthorizedSelection(false);
    if (isSelectionCollapsed()) {
      if (isClickingNonHighlightedAreaInArticle(e)) {
        // NOTE: May not want to set focusedHighlight to null
        setFocusedHighlightId(null);
        removeAllHoverClasses();
      }
      return;
    }
    if (isSelectionInElementById("Comments")) {
      return;
    }
    if (!isSelectionInElementById("content-highlightable")) {
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

  return (
    <div
      className="grid grid-cols-6 gap-1 h-full overflow-hidden"
      onMouseUp={(e) => handleMouseUp(e)}
    >
      <TableOfContents className="hidden md:flex md:flex-col col-start-1 col-span-1 overflow-y-auto px-3 pb-10" />
      <Article
        className="col-start-1 col-span-6 md:col-start-2 md:col-span-3 md:place-self-end px-2 overflow-y-auto h-full w-full"
        setFocus={setFocusedHighlightId}
      />
      <Comments
        unauthorizedSelection={unauthorizedSelection}
        className="hidden md:grid col-start-5 col-span-2 overflow-y-auto h-full"
        focusedHighlightId={focusedHighlightId}
      />
    </div>
  );
};

export default Reader;
