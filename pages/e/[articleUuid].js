import { useRouter } from "next/router";
import Tiptap from "components/Tiptap";
import NavBar from "components/NavBar";
import { useFetchArticleHtml } from "hooks";
import { fetchArticleHtml } from "@/api";

export default function Page() {
  const { articleUuid } = useRouter().query;
  const fetchArticleHtml = useFetchArticleHtml(articleUuid);
  const {
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    data: dataArticle,
    error: errorArticle,
  } = useFetchArticleHtml(articleUuid);

  if (isLoadingArticle) {
    return;
  }
  if (isErrorArticle) {
    return <span>{error.message}</span>;
  }
  return (
    <>
      <NavBar />
      <Tiptap content={dataArticle.articleHtml} />
    </>
  );
}
