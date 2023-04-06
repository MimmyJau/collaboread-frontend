import ky from "ky-universal";

const BASE_URL = process.env.SERVER;
const API_BASE_URL = `${BASE_URL}/api`;

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

function deleteAnnotation(annotationUuid) {
  const route = `${API_BASE_URL}/annotations/${annotationUuid}/`;
  return ky.delete(route, { json: { id: annotationUuid } }).json();
}

export {
  fetchArticleHtml,
  createAnnotation,
  fetchAnnotations,
  updateAnnotation,
  deleteAnnotation,
};
