import ky from "ky-universal";
import { useQuery, useMutation } from "@tanstack/react-query";

function fetchArticleHtml(uuid) {
  const route = "http://localhost:8000/api/articles/" + uuid;
  return ky.get(route).json();
}

function useGetArticleHtml(uuid) {
  return useQuery({
    enabled: !!uuid,
    queryKey: ["article", "html", uuid],
    queryFn: () => fetchArticleHtml(uuid),
  });
}

function useAddComment() {
  return useMutation({
    mutationFn: (id, comment) => {
      return ky
        .put("localhost:8000/api/annotations", {
          json: { id: id, comment: comment },
        })
        .json();
    },
  });
}

function useAddHighlight() {
  return useMutation({
    mutationFn: ({ uuid, highlight, articleUuid }) => {
      const route =
        "http://localhost:8000/api/annotations/" + articleUuid + "/";
      return ky
        .post(route, {
          json: {
            uuid: uuid,
            highlight: highlight,
            articleUuid: articleUuid,
          },
        })
        .json();
    },
  });
}

export { useGetArticleHtml, useAddHighlight, useAddComment };
