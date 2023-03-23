import ky from "ky-universal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// TODO: Move this to a config file / use environment variables
const API_BASE_URL = "http://localhost:8000/api";

// API Functions
function fetchArticleHtml(articleUuid) {
  const route = `${API_BASE_URL}/articles/${articleUuid}/`;
  return ky.get(route).json();
}

function createAnnotation(articleUuid, highlightData) {
  const route = `${API_BASE_URL}/articles/${articleUuid}/annotations/`;
  return ky.post(route, { json: highlightData }).json();
}

function fetchAnnotations(articleUuid) {
  const route = `${API_BASE_URL}/articles/${articleUuid}/annotations/`;
  return ky.get(route).json();
}

function saveComment(annotationUuid, comment) {
  const route = `${API_BASE_URL}/annotations/${annotationUuid}/`;
  return ky
    .put(route, { json: { id: annotationUuid, comment: comment } })
    .json();
}

function deleteAnnotation(annotationUuid) {
  const route = `${API_BASE_URL}/annotations/${annotationUuid}/`;
  return ky.delete(route, { json: { id: annotationUuid } }).json();
}

// Helper Functions
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
    comment: flatAnnotation.comment || "",
  };
}

// React Query Hooks
function useFetchArticleHtml(uuid) {
  return useQuery({
    enabled: !!uuid,
    queryKey: ["article", "html", uuid],
    queryFn: () => fetchArticleHtml(uuid),
  });
}

function useCreateAnnotation(articleUuid) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, highlight }) => {
      return createAnnotation(articleUuid, {
        uuid: uuid,
        highlightStart: highlight[0].characterRange.start,
        highlightEnd: highlight[0].characterRange.end,
        highlightBackward: highlight[0].backward,
        article: articleUuid,
        isPublic: "True",
      });
    },
    onSuccess: (newHighlight) => {
      queryClient.setQueryData(
        ["annotations", "article", articleUuid],
        (oldData) => {
          const newAnnotation = unflattenAnnotation(newHighlight);
          const newData = structuredClone(oldData);
          newData.push(newAnnotation);
          return newData;
        }
      );
    },
  });
}

function useFetchAnnotations(articleUuid) {
  return useQuery({
    enabled: !!articleUuid,
    queryKey: ["annotations", "article", articleUuid],
    queryFn: async () => {
      const flatAnnotations = await fetchAnnotations(articleUuid);
      return flatAnnotations.map(unflattenAnnotation);
    },
  });
}

function useUpdateAnnotation() {
  return useMutation({
    mutationFn: (id, comment) => saveComment(id, comment),
  });
}

function useDeleteAnnotation(articleUuid) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (annotationUuid) => deleteAnnotation(annotationUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["annotations", "article", articleUuid],
      });
    },
  });
}

export {
  useFetchArticleHtml,
  useFetchAnnotations,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
};
