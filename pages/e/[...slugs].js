import { useRouter } from "next/router";
import { Editor } from "components/ArticleEditor";
import NavBar from "components/NavBar";
import { useFetchArticle } from "hooks";

export default function Page() {
  const slugs = useRouter().query.slugs || [];
  const slug = slugs[slugs.length - 1];
  const fetchArticle = useFetchArticle(slug);
  const { isLoading, isError, data, error } = useFetchArticle(slug);

  if (isLoading) {
    return;
  }
  if (isError) {
    return;
  }
  return (
    <>
      <NavBar />
      <Editor content={data.articleHtml} />
    </>
  );
}
