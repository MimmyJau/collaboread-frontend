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

function fetchAnnotations(articleUuid) {
  const route = "http://localhost:8000/api/annotations/" + articleUuid;
  return ky.get(route).json();
}

function unflattenAnnotation(flatAnnotation) {
  return {
    uuid: flatAnnotation.uuid,
    highlight: Array.of({
      characterRange: {
        start: flatAnnotation.highlightStart,
        end: flatAnnotation.highlightEnd,
      },
      backward: flatAnnotation.highlightBackward,
    }),
    comment: flatAnnotation.comment,
  };
}

function useGetAnnotations(articleUuid) {
  return useQuery({
    enabled: !!articleUuid,
    queryKey: ["annotations", "article", articleUuid],
    queryFn: async () => {
      const flatAnnotations = await fetchAnnotations(articleUuid);
      const annotations = [];
      for (const flatAnnotation of flatAnnotations) {
        annotations.push(unflattenAnnotation(flatAnnotation));
      }
      return annotations;
    },
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
            highlightStart: highlight[0].characterRange.start,
            highlightEnd: highlight[0].characterRange.end,
            highlightBackward: highlight[0].backward,
            article: articleUuid,
            isPublic: "True",
          },
        })
        .json();
    },
  });
}

export { useGetArticleHtml, useGetAnnotations, useAddHighlight, useAddComment };
