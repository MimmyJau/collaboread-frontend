import { useRouter } from "next/router";
import { memo, useEffect, useState } from "react";
import { Interweave } from "interweave";

import { useDeleteAnnotation } from "hooks";
import { highlightFetchedAnnotations } from "utils";

const MemoInterweave = memo(Interweave);

const Article = (props) => {
  const slug = useRouter().query.slug || [];
  const rootSlug = slug[0];
  const deleteAnnotation = useDeleteAnnotation(rootSlug);

  useEffect(() => {
    highlightFetchedAnnotations(
      props.fetchedAnnotations,
      deleteAnnotation,
      props.setFocusedHighlightId
    );
  }, [props.fetchedAnnotations]);

  return (
    <div id="article" className={`prose ${props.className}`}>
      <MemoInterweave content={props.html} />
    </div>
  );
};

export default Article;
