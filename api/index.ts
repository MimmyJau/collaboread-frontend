import ky from "ky-universal";

import { FlatAnnotation } from "types";

const BASE_URL = process.env.SERVER;
const API_BASE_URL = `${BASE_URL}/api`;

function fetchArticles() {
  const route = `${API_BASE_URL}/articles/`;
  return ky.get(route).json();
}

function fetchTableOfContents(rootSlug) {
  const route = `${API_BASE_URL}/toc/${rootSlug}/`;
  return ky.get(route).json();
}

function fetchArticle(articleUuid) {
  const route = `${API_BASE_URL}/articles/${articleUuid}/`;
  return ky.get(route).json();
}

function updateArticle(article, token) {
  const route = `${API_BASE_URL}/articles/${article.uuid}/`;
  return ky
    .put(route, { headers: { Authorization: `Token ${token}` }, json: article })
    .json();
}

function createAnnotation(articleUuid, highlightData, token) {
  const route = `${API_BASE_URL}/articles/${articleUuid}/annotations/`;
  return ky
    .post(route, {
      headers: { Authorization: `Token ${token}` },
      json: highlightData,
    })
    .json();
}

function fetchAnnotations(articleUuid, token): Promise<Array<FlatAnnotation>> {
  const route = `${API_BASE_URL}/articles/${articleUuid}/annotations/`;
  return ky
    .get(route, { headers: { Authorization: token ? `Token ${token}` : "" } })
    .json();
}

function updateAnnotation(annotation, token) {
  const route = `${API_BASE_URL}/annotations/${annotation.uuid}/`;
  return ky
    .put(route, {
      headers: { Authorization: `Token ${token}` },
      json: annotation,
    })
    .json();
}

function deleteAnnotation(annotationUuid, token) {
  const route = `${API_BASE_URL}/annotations/${annotationUuid}/`;
  return ky
    .delete(route, {
      headers: { Authorization: `Token ${token}` },
      json: { id: annotationUuid },
    })
    .json();
}

function createComment(comment, token) {
  const route = `${API_BASE_URL}/comments/`;
  return ky
    .post(route, {
      headers: { Authorization: `Token ${token}` },
      json: comment,
    })
    .json();
}

function updateComment(comment, token) {
  const route = `${API_BASE_URL}/comments/${comment.uuid}/`;
  return ky
    .put(route, { headers: { Authorization: `Token ${token}` }, json: comment })
    .json();
}

function deleteComment(comment, token) {
  const route = `${API_BASE_URL}/comments/${comment.uuid}/`;
  return ky
    .delete(route, {
      headers: { Authorization: `Token ${token}` },
      json: comment,
    })
    .json();
}

export {
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
};
