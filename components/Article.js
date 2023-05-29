import { useRouter } from "next/router";
import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { Interweave } from "interweave";

import { useDeleteAnnotation } from "hooks";
import {
  clearHighlight,
  highlightFetchedAnnotations,
  removeAllHoverClasses,
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

const MemoInterweave = memo(Interweave);

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
  const sectionSlug = slug[slug.length - 1];
  const [virtualDom, setVirtualDom] = useState(props.html);
  const setFocus = props.setFocus;

  useEffect(() => {
    setVirtualDom(props.html);
    highlightFetchedAnnotations(props.fetchedAnnotations);
    return () => {
      if (!props.fetchedAnnotations) return;
      clearAllHighlights();
    };
  }, [props.html, props.fetchedAnnotations]);

  function clearAllHighlights() {
    for (const annotation of props.fetchedAnnotations) {
      clearHighlight(annotation.uuid, annotation.highlight);
    }
  }

  /**
   * Main useEffect:
   * Responsible for updating virtualDOM of article.
   * Update triggered whenever article or annotations change.
   */
  useEffect(() => {
    setVirtualDom(props.html);
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
      <button onClick={clearAllHighlights}>Clear All Highlights</button>
      <div id="article" className="prose">
        <Interweave content={props.html} />
      </div>
      <PrevAndNextSection
        prevHref={props.prev?.join("/")}
        nextHref={props.next?.join("/")}
      />
    </div>
  );
};

export default Article;
