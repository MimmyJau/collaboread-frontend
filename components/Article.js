import { useRouter } from "next/router";
import Link from "next/link";
import { memo, useEffect, useState } from "react";
import { Interweave } from "interweave";

import { useDeleteAnnotation } from "hooks";
import { highlightFetchedAnnotations } from "utils";

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

function updateVirtualDom(article, annotations) {
  return article;
}

const Article = (props) => {
  const slug = useRouter().query.slug || [];
  const rootSlug = slug[0];
  const [virtualDom, setVirtualDom] = useState(props.html);
  const deleteAnnotation = useDeleteAnnotation(rootSlug);

  useEffect(() => {
    highlightFetchedAnnotations(
      props.fetchedAnnotations,
      deleteAnnotation,
      props.setFocusedHighlightId
    );
  }, [props.fetchedAnnotations]);

  /**
   * Main useEffect:
   * Responsible for updating virtualDOM of article.
   * Update triggered whenever article or annotations change.
   */
  useEffect(() => {
    const newVirtualDom = updateVirtualDom(
      props.html,
      props.fetchedAnnotations
    );
    setVirtualDom(props.html);
  }, [props.html, props.fetchedAnnotations]);

  return (
    <div className={`flex flex-col items-center ${props.className}`}>
      <PrevAndNextSection
        prevHref={props.prev?.join("/")}
        nextHref={props.next?.join("/")}
      />
      <div id="article" className="prose">
        <MemoInterweave content={virtualDom} />
      </div>
      <PrevAndNextSection
        prevHref={props.prev?.join("/")}
        nextHref={props.next?.join("/")}
      />
    </div>
  );
};

export default Article;
