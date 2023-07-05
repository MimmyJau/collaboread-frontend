import { useRouter } from "next/router";
import { useEffect } from "react";

import { useFetchAnnotations, useFetchBookmark } from "hooks";
import { highlightFetchedAnnotations, addBookmarkToArticle } from "utils";

const useGetUrl = () => {
  const slugs = useRouter().query.slug || [];
  const book = slugs[0];
  const section = slugs[slugs.length - 1];
  const path = slugs.join("/");
  return { book, section, path };
};

const useRenderBookmark = () => {
  const { book, path } = useGetUrl();
  const { isLoading, isError, data, error, status } = useFetchBookmark(book);

  useEffect(() => {
    if (status !== "success") return;
    const isBookmarkInThisSection = data.article === path;
    if (isBookmarkInThisSection) {
      addBookmarkToArticle(data.highlight);
    }
  }, [path, status]);
};

const useRenderHighlights = () => {
  const { path } = useGetUrl();
  const { isLoading, isError, data, error, status } = useFetchAnnotations(path);

  useEffect(() => {
    if (status === "success") {
      highlightFetchedAnnotations(data);
    }
export { useRenderBookmark, useRenderHighlights };
  }, [path, data, status]);
}
