import { usePostSignup } from "@/api/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  fetchArticles,
  fetchTableOfContents,
  fetchArticle,
  updateArticle,
  createAnnotation,
  fetchAnnotations,
  updateAnnotation,
  deleteAnnotation,
  createComment,
  updateComment,
  deleteComment,
  fetchBookmark,
  createBookmark,
  updateBookmark,
} from "api";

import { useGetUrl } from "hooks/pages";

import {
  Article,
  Annotation,
  Bookmark,
  FlatAnnotation,
  Highlight,
} from "types";

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
    isPublic: flatAnnotation.isPublic,
  };
}

function flattenAnnotation(annotation: Annotation): FlatAnnotation {
  return {
    ...annotation,
    highlightStart: annotation.highlight[0].characterRange.start,
    highlightEnd: annotation.highlight[0].characterRange.end,
    highlightBackward: annotation.highlight[0].backward,
  };
}

function getTokenLocalStorage() {
  return localStorage.getItem("token");
}

// React Query Hooks
function useFetchArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: () => fetchArticles(),
  });
}

function useFetchTableOfContents(rootSlug) {
  return useQuery({
    queryKey: ["toc", rootSlug],
    queryFn: () => fetchTableOfContents(rootSlug),
  });
}

function useFetchArticle() {
  const { path } = useGetUrl();
  return useQuery({
    enabled: !!path,
    queryKey: ["article", path],
    queryFn: () => fetchArticle(path),
  });
}

function useUpdateArticle(slug) {
  const queryClient = useQueryClient();
  const article = queryClient.getQueryData(["article", slug]) as Article;
  return useMutation({
    mutationFn: ({
      html,
      json,
      text,
    }: {
      html: string;
      json: string;
      text: string;
    }) => {
      article.articleHtml = html;
      article.articleJson = json;
      article.articleText = text;
      return updateArticle(article, getTokenLocalStorage());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["article", slug],
      });
    },
  });
}

function useCreateAnnotation(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (highlight: Highlight) => {
      return createAnnotation(
        slug,
        {
          highlightStart: highlight.characterRange.start,
          highlightEnd: highlight.characterRange.end,
          highlightBackward: highlight.backward,
          article: slug,
          isPublic: "False",
        },
        getTokenLocalStorage()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["annotations", slug],
      });
    },
  });
}

function useFetchAnnotations(slug) {
  const { path } = useGetUrl();

  return useQuery({
    enabled: !!path,
    queryKey: ["annotations", path],
    queryFn: async (): Promise<Array<Annotation>> => {
      const flatAnnotations = await fetchAnnotations(
        path,
        getTokenLocalStorage()
      ).catch((error) => {
        return [];
      });
      return flatAnnotations.map(unflattenAnnotation);
    },
  });
}

function useMakeAnnotationPublic(slug, annotationUuid) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (annotationUuid: string) => {
      const annotations = queryClient.getQueryData([
        "annotations",
        slug,
      ]) as Array<Annotation>;
      const annotation = annotations.filter(
        (annotation) => annotation.uuid === annotationUuid
      )[0];
      const public_annotation = { ...annotation, isPublic: true };
      return updateAnnotation(
        flattenAnnotation(public_annotation),
        getTokenLocalStorage()
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["annotations", slug],
      });
    },
  });
}

function useDeleteAnnotation(slug) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (annotationUuid) =>
      deleteAnnotation(annotationUuid, getTokenLocalStorage()),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["annotations", slug],
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

function useFetchBookmark(book) {
  return useQuery({
    enabled: !!book,
    queryKey: ["bookmark", book],
    queryFn: async (): Promise<Bookmark> => {
      const bookmark = await fetchBookmark(book, getTokenLocalStorage()).catch(
        (error) => {
          return null;
        }
      );
      return bookmark;
    },
  });
}

function useCreateBookmark(book) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookmark: Bookmark) => {
      return createBookmark(bookmark, getTokenLocalStorage());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookmark", book],
      });
    },
  });
}

function useUpdateBookmark(book) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookmark: Bookmark) => {
      return updateBookmark(bookmark, getTokenLocalStorage());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["bookmark", book],
      });
    },
  });
}

export {
  useFetchArticles,
  useFetchTableOfContents,
  useFetchArticle,
  useUpdateArticle,
  useFetchAnnotations,
  useCreateAnnotation,
  useMakeAnnotationPublic,
  useDeleteAnnotation,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useFetchBookmark,
  useCreateBookmark,
  useUpdateBookmark,
};
