import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Interweave } from "interweave";

import { useDeleteAnnotation } from "hooks";
import { highlightFetchedAnnotations } from "utils";

const Article = (props) => {
  const { articleUuid } = useRouter().query;
  const deleteAnnotation = useDeleteAnnotation(articleUuid);

  useEffect(() => {
    highlightFetchedAnnotations(
      props.fetchedAnnotations,
      deleteAnnotation,
      props.setFocusedHighlightId
    );
  }, [props.fetchedAnnotations]);

  return (
    <div id="article" className={`prose ${props.className}`}>
      <Interweave content={props.html} />
    </div>
  );
};

export default Article;
