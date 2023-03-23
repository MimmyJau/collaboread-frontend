import { useRouter } from "next/router";

import Reader from "components/Reader";
import { useFetchArticleHtml, useFetchAnnotations } from "hooks";

function wrapHtml(rawHtml) {
  if (!rawHtml) return;
  return `<div id="content-highlightable" class="prose">` + rawHtml + `</div>`;
}

export default function Page() {
  const router = useRouter();
  const { articleUuid } = router.query;
  const {
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    data: dataArticle,
    error: errorArticle,
  } = useFetchArticleHtml(articleUuid);
  const {
    isLoading: isLoadingAnnotations,
    isError: isErrorAnnotations,
    data: dataAnnotations,
    error: errorAnnotations,
  } = useFetchAnnotations(articleUuid);

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
