import { useRouter } from "next/router";
import { Editor } from "components/ArticleEditor";
import NavBar from "components/NavBar";
import { useFetchArticle } from "hooks/api";
import { useGetUrl } from "hooks/pages";

export default function Page() {
  const { path } = useGetUrl();
  const { data: article, status } = useFetchArticle(path);

  if (status !== "success") return null;
  console.log(article.articleHtml);
  return (
    <>
      <NavBar />
      <Editor content={article.articleHtml} />
    </>
  );
}
