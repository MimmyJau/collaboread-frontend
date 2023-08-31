import ky from "ky-universal";

import { Bookmark, FlatAnnotation } from "types";

const BASE_URL = process.env.SERVER;
const API_BASE_URL = `${BASE_URL}/api`;

function fetchArticles(token) {
  const route = `${API_BASE_URL}/articles/`;
  return ky
    .get(route, { headers: { Authorization: token ? `Token ${token}` : "" } })
    .json();
}

function fetchTableOfContents(rootSlug) {
  const route = `${API_BASE_URL}/toc/${rootSlug}/`;
  return ky.get(route).json();
}

function fetchArticle(slug) {
  const route = `${API_BASE_URL}/articles/${slug}/`;
  return ky.get(route).json();
}

function updateArticle(article, token) {
  const route = `${API_BASE_URL}/articles/${article.slugFull}/`;
  return ky
    .put(route, { headers: { Authorization: `Token ${token}` }, json: article })
    .json();
}

function createAnnotation(slug, highlightData, token) {
  const route = `${API_BASE_URL}/articles/${slug}/annotations/`;
  return ky
    .post(route, {
      headers: { Authorization: `Token ${token}` },
      json: highlightData,
    })
    .json();
}

function fetchAnnotations(slug, token): Promise<Array<FlatAnnotation>> {
  const route = `${API_BASE_URL}/articles/${slug}/annotations/`;
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

function fetchBookmark(book, token): Promise<Bookmark> {
  const route = `${API_BASE_URL}/bookmark/${book}/`;
  return ky
    .get(route, { headers: { Authorization: token ? `Token ${token}` : "" } })
    .json();
}

function createBookmark(bookmark, token) {
  const route = `${API_BASE_URL}/bookmarks/`;
  return ky.post(route, {
    headers: { Authorization: `Token ${token}` },
    json: bookmark,
  });
}

function updateBookmark(bookmark, token) {
  const route = `${API_BASE_URL}/bookmark/${bookmark.book}/`;
  return ky.put(route, {
    headers: { Authorization: `Token ${token}` },
    json: bookmark,
  });
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
  fetchBookmark,
  createBookmark,
  updateBookmark,
};
