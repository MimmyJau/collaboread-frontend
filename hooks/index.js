import ky from "ky-universal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BASE_URL = process.env.SERVER;
const API_BASE_URL = `${BASE_URL}/api`;
const AUTH_BASE_URL = `${BASE_URL}/auth`;

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

function updateAnnotation(articleUuid, annotation) {
  const route = `${API_BASE_URL}/annotations/${annotation.uuid}/`;
  return ky.put(route, { json: annotation }).json();
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

function postLogin(username, password) {
  const route = `${AUTH_BASE_URL}/login/`;
  return ky.post(route, { json: { username, password } }).json();
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

function usePostLogin() {
  return useMutation({
    mutationFn: ({ username, password }) => postLogin(username, password),
    onSuccess: (data) => {
      console.log(data);
      window.localStorage.setItem("token", data.key);
    },
  });
}

export {
  useFetchArticleHtml,
  useFetchAnnotations,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
  usePostLogin,
};
