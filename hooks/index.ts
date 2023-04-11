import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchArticleHtml,
  createAnnotation,
  fetchAnnotations,
  updateAnnotation,
  deleteAnnotation,
} from "api";

import {Annotation, FlatAnnotation } from "types";

// Helper Functions
function unflattenAnnotation(flatAnnotation: FlatAnnotation): Annotation {
  return {
    uuid: flatAnnotation.uuid,
    user: flatAnnotation.user,
    highlight: Array.of({
      characterRange: {
        start: flatAnnotation.highlightStart,
        end: flatAnnotation.highlightEnd,
      },
      backward: flatAnnotation.highlightBackward,
    }),
    commentHtml: flatAnnotation.commentHtml,
    commentJson: flatAnnotation.commentJson,
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
    onSuccess: (newHighlight: FlatAnnotation) => {
      queryClient.setQueryData(
        ["annotations", "article", articleUuid],
        (oldData: Array<Annotation>): Array<Annotation> => {
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
    queryFn: async (): Promise<Array<Annotation>> => {
      const flatAnnotations = await fetchAnnotations(articleUuid).catch(
        (error) => {
          return [];
        }
      );
      return flatAnnotations.map(unflattenAnnotation);
    },
  });
}

function useUpdateAnnotation(articleUuid) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (annotation) => {
      const updatedAnnotation = {
        ...annotation,
        uuid: annotation.uuid,
        highlightStart: annotation.highlight[0].characterRange.start,
        highlightEnd: annotation.highlight[0].characterRange.end,
        highlightBackward: annotation.highlight[0].backward,
        article: articleUuid,
        isPublic: "True",
      };
      delete updatedAnnotation.highlight;
      return updateAnnotation(articleUuid, updatedAnnotation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["annotations", "article", articleUuid],
      });
    },
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