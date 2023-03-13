import { useRouter } from "next/router";
import Reader from "components/Reader";

import { useGetDocumentHTML } from "hooks";

export default function Document() {
  const router = useRouter();
  const { uuid } = router.query;
  const { isLoading, isError, data, error } = useGetDocumentHTML(uuid);

  if (isLoading) {
    return <span>Is Loading</span>;
  }
  if (isError) {
    return <span>{error.message}</span>;
  }
  return <p>{data.document_html}</p>;
}
