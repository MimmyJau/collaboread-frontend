import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useFetchAnnotations, useFetchArticle } from "hooks/api";
import { highlightFetchedAnnotations } from "utils";

export function useGetUrl() {
  const slugs = useRouter().query.slug || [];
  const book = slugs[0];
  const section = slugs[slugs.length - 1];
  const path = slugs.join("/");
  return { book, section, path };
}

export function useRenderHighlights() {
  const { path } = useGetUrl();
  const { data, status: annotationStatus } = useFetchAnnotations(path);
  const { status: articleStatus } = useFetchArticle(path);

  // We need to include `data` as a dependency because of the
  // case where user creates a new highlight ; the data will
  // change but the path and annotationStatus will not.
  useEffect(() => {
    if (annotationStatus !== "success" || articleStatus !== "success") return;
    highlightFetchedAnnotations(data);
  }, [path, data, annotationStatus, articleStatus]);
}
