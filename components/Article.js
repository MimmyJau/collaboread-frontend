import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useDeleteAnnotation, useFetchBookmark } from "hooks";
import {
  addHoverClassToRelatedHighlights,
  highlightFetchedAnnotations,
  removeAllHoverClasses,
  addBookmarkToArticle,
} from "utils";

const NavButton = ({ text, href }) => {
  return (
    <Link
      href={href}
      className="bg-gray-100 rounded-lg text-blue-500 px-3 py-2 hover:bg-yellow-300 hover:text-pink-600"
    >
      {text}
    </Link>
  );
};

const PrevAndNextSection = (props) => {
  return (
    <div className="flex flex-row justify-between p-2 w-full">
      {props.prevHref ? (
        <NavButton text="Prev" href={props.prevHref} />
      ) : (
        <div></div>
      )}
      {props.nextHref ? (
        <NavButton text="Next" href={props.nextHref} />
      ) : (
        <div></div>
      )}
    </div>
  );
};

function extractAnnotationIdFromEvent(e) {
  return e.target.dataset.annotationId || "";
}

const useRenderBookmark = (book) => {
  const { isLoading, isError, data, error, status } = useFetchBookmark(book);

  useEffect(() => {
    if (status === "success") {
      addBookmarkToArticle(data.highlight);
    }
  }, [status]);
};

const useGetUrl = () => {
  const slugs = useRouter().query.slug || [];
  const book = slugs[0];
  const section = slugs[slugs.length - 1];
  const full = slugs;
  return { book, section, full };
};

const Article = (props) => {
  const setFocus = props.setFocus;
  const { book } = useGetUrl();
  useRenderBookmark(book);

  useEffect(() => {
    highlightFetchedAnnotations(props.fetchedAnnotations);
  }, [props.html, props.fetchedAnnotations]);

  function syncHoverBehavior(e) {
    if (e.buttons !== 0) return;
    const annotationId = extractAnnotationIdFromEvent(e);
    if (annotationId) {
      removeAllHoverClasses();
      setFocus(annotationId);
      addHoverClassToRelatedHighlights(annotationId);
    }
  }

  return (
    <div
      className={`flex flex-col items-center ${props.className}`}
      onMouseOver={(e) => syncHoverBehavior(e, setFocus)}
    >
      <PrevAndNextSection prevHref={props.prev} nextHref={props.next} />
      <div id="article" className="prose w-full">
        <div id="content-highlightable">
          <div dangerouslySetInnerHTML={{ __html: props.html }} />
        </div>
      </div>
      <PrevAndNextSection prevHref={props.prev} nextHref={props.next} />
    </div>
  );
};

export default Article;
