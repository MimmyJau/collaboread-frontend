import { useState } from "react";

import { polyfill } from "interweave-ssr";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "styles/globals.css";

import Layout from "components/Layout.js";

// Interweave requires DOM, so polyfill is required
// for SSR (source: https://interweave.dev/docs/ssr)
polyfill();

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
