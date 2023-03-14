import { useRouter } from "next/router";
import Reader from "components/Reader";

import { useGetArticleHtml } from "hooks";

function wrapHtml(rawHtml) {
  if (!rawHtml) return;
  return `<div id="content-highlightable" class="prose">` + rawHtml + `</div>`;
}

export default function Page() {
  const router = useRouter();
  const { uuid } = router.query;
  const { isLoading, isError, data, error } = useGetArticleHtml(uuid);

  if (isLoading) {
    return <span>Is Loading</span>;
  }
  if (isError) {
    return <span>{error.message}</span>;
  }
  return <Reader articleHtml={wrapHtml(data.articleHtml)} />;
}
