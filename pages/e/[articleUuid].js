import { useRouter } from "next/router";
import Tiptap from "components/Tiptap";
import NavBar from "components/NavBar";
import { useFetchArticle } from "hooks";

export default function Page() {
  const { articleUuid } = useRouter().query;
  const fetchArticle = useFetchArticle(articleUuid);
  const {
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    data: dataArticle,
    error: errorArticle,
  } = useFetchArticle(articleUuid);

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
