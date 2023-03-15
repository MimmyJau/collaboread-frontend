import { useRouter } from "next/router";

import Reader from "components/Reader";
import { useGetArticleHtml, useGetAnnotations } from "hooks";

function wrapHtml(rawHtml) {
  if (!rawHtml) return;
  return `<div id="content-highlightable" class="prose">` + rawHtml + `</div>`;
}

export default function Page() {
  const router = useRouter();
  const { uuid } = router.query;
  const {
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    data: dataArticle,
    error: errorArticle,
  } = useGetArticleHtml(uuid);
  const {
    isLoading: isLoadingAnnotations,
    isError: isErrorAnnotations,
    data: dataAnnotations,
    error: errorAnnotations,
  } = useGetAnnotations(uuid);

  if (isLoadingArticle) {
    return <span>Is Loading</span>;
  }
  if (isErrorArticle) {
    return <span>{error.message}</span>;
  }
  return (
    <Reader
      articleHtml={wrapHtml(dataArticle.articleHtml)}
      annotations={dataAnnotations}
    />
  );
}
