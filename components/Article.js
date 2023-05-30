import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useDeleteAnnotation } from "hooks";
import { highlightFetchedAnnotations, removeAllHoverClasses } from "utils";

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

function addClassToElements(elements, className) {
  for (const element of elements) {
    element.classList.add(className);
  }
}

function getRelatedHighlights(annotationId) {
  return document.querySelectorAll(
    `.highlight[data-annotation-id="${annotationId}"]`
  );
}

function addHoverClassToRelatedHighlights(annotationId) {
  const relatedHighlights = getRelatedHighlights(annotationId);
  addClassToElements(relatedHighlights, "bg-yellow-400");
}

function extractAnnotationIdFromEvent(e) {
  return e.target.dataset.annotationId || "";
}

const Article = (props) => {
  const slug = useRouter().query.slug || [];
  const rootSlug = slug[0];
  const setFocus = props.setFocus;

  useEffect(() => {
    highlightFetchedAnnotations(props.fetchedAnnotations);
  }, [props.html, props.fetchedAnnotations]);

  function syncHoverBehavior(e) {
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
      <PrevAndNextSection
        prevHref={props.prev?.join("/")}
        nextHref={props.next?.join("/")}
      />
      <div id="article" className="prose">
        <div dangerouslySetInnerHTML={{ __html: props.html }} />
      </div>
      <PrevAndNextSection
        prevHref={props.prev?.join("/")}
        nextHref={props.next?.join("/")}
      />
    </div>
  );
};

export default Article;
