import ky from "ky-universal";
import { useQuery, useMutation } from "@tanstack/react-query";

function fetchDocumentHTML(uuid) {
  const route = "http://localhost:8000/api/documents/" + uuid;
  return ky.get(route).json();
}

function useGetDocumentHTML(uuid) {
  return useQuery({
    enabled: !!uuid,
    queryKey: ["document", "html", uuid],
    queryFn: () => fetchDocumentHTML(uuid),
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
    mutationFn: (id, highlight) => {
      return ky
        .put("localhost:8000/api/annotations", {
          json: { id: id, highlight: highlight },
        })
        .json();
    },
  });
}

export { useGetDocumentHTML, useAddHighlight, useAddComment };
