import { useRouter } from "next/router";
import { useEffect } from "react";

import { useFetchAnnotations, useFetchArticle, useFetchBookmark } from "hooks";
import { highlightFetchedAnnotations, renderBookmark } from "utils";

export function useGetUrl() {
  const slugs = useRouter().query.slug || [];
  const book = slugs[0];
  const section = slugs[slugs.length - 1];
  const path = slugs.join("/");
  return { book, section, path };
}

export function useRenderBookmark(ref) {
  const { book, path } = useGetUrl();
  const { data, error, status: bookmarkStatus } = useFetchBookmark(book);
  const { status: articleStatus } = useFetchArticle(path);

  useEffect(() => {
    if (bookmarkStatus !== "success" || articleStatus !== "success") return;
    if (data === null) return;
    const isBookmarkInThisSection = data.article === path;
    if (isBookmarkInThisSection) {
      renderBookmark(data.highlight);
    }
  }, [path, bookmarkStatus, articleStatus]);
}

export function useRenderHighlights(ref) {
  const { path } = useGetUrl();
  const { data, status: annotationStatus } = useFetchAnnotations(path);
  const { status: articleStatus } = useFetchArticle(path);

  // We need to include `data` as a dependency because of the
  // case  where user creates a new highlight ; the data will
  // change but the path and annotationStatus will not.
  useEffect(() => {
    if (annotationStatus !== "success" || articleStatus !== "success") return;
    highlightFetchedAnnotations(data);
  }, [path, data, annotationStatus, articleStatus]);
}
