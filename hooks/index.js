import ky from "ky-universal";
import { useMutation } from "@tanstack/react-query";

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

export { useAddHighlight, useAddComment };
