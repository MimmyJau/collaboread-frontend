import ky from "ky-universal";
import { useQuery, useMutation } from "@tanstack/react-query";

function fetchDocumentHtml(uuid) {
  const route = "http://localhost:8000/api/documents/" + uuid;
  return ky.get(route).json();
}

function useGetDocumentHtml(uuid) {
  return useQuery({
    enabled: !!uuid,
    queryKey: ["document", "html", uuid],
    queryFn: () => fetchDocumentHtml(uuid),
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
    mutationFn: ({ uuid, highlight, documentUuid }) => {
      const route =
        "http://localhost:8000/api/annotations/" + documentUuid + "/";
      return ky
        .post(route, {
          json: {
            uuid: uuid,
            highlight: highlight,
            documentUuid: documentUuid,
          },
        })
        .json();
    },
  });
}

export { useGetDocumentHtml, useAddHighlight, useAddComment };
