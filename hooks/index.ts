import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchArticleHtml,
  updateArticle,
  createAnnotation,
  fetchAnnotations,
  updateAnnotation,
  deleteAnnotation,
  createComment,
  updateComment,
  deleteComment,
} from "api";

import {Article, Annotation, FlatAnnotation, Highlight } from "types";

// Helper Functions
function unflattenAnnotation(flatAnnotation: FlatAnnotation): Annotation {
  return {
    uuid: flatAnnotation.uuid,
    user: flatAnnotation.user,
    article: flatAnnotation.article,
    highlight: Array.of({
      characterRange: {
        start: flatAnnotation.highlightStart,
        end: flatAnnotation.highlightEnd,
      },
      backward: flatAnnotation.highlightBackward,
    }),
    comments: flatAnnotation.comments,
  };
}

function getTokenLocalStorage() {
    return localStorage.getItem("token");
}

// React Query Hooks
function useFetchArticleHtml(uuid) {
  return useQuery({
    enabled: !!uuid,
    queryKey: ["article", uuid],
    queryFn: () => fetchArticleHtml(uuid),
  });
}

function useUpdateArticle(articleUuid) {
    const queryClient = useQueryClient();
    const article = queryClient.getQueryData(["article", articleUuid]) as Article
    return useMutation({
        mutationFn: ({ html, json } : { html: string, json: string }) => {
            article.articleHtml = html;
            article.articleJson = json;
            return updateArticle(article, getTokenLocalStorage())
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["article", articleUuid],
            })
        }
    })
}

function useCreateAnnotation(articleUuid) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, highlight }: { uuid: string; highlight: Highlight } ) => {
      return createAnnotation(articleUuid, {
        uuid: uuid,
        highlightStart: highlight[0].characterRange.start,
        highlightEnd: highlight[0].characterRange.end,
        highlightBackward: highlight[0].backward,
        article: articleUuid,
        isPublic: "True",
      }, getTokenLocalStorage());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["annotations", "article", articleUuid],
      });
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
    mutationFn: (annotation: Annotation) => {
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
      return updateAnnotation(articleUuid, updatedAnnotation, getTokenLocalStorage());
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
    mutationFn: (annotationUuid) => deleteAnnotation(annotationUuid, getTokenLocalStorage()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["annotations", "article", articleUuid],
      });
    },
  });
}

function useCreateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: Comment) => {
      return createComment(comment, getTokenLocalStorage());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [],
      });
    },
  });
}

function useUpdateComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: Comment) => {
      return updateComment(comment, getTokenLocalStorage());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [],
      });
    },
  });
}

function useDeleteComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (comment: Comment) => {
      return deleteComment(comment, getTokenLocalStorage());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [],
      });
    },
  });
}

export {
  useFetchArticleHtml,
  useUpdateArticle,
  useFetchAnnotations,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
};
