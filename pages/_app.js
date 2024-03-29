import { useState } from "react";

import { ampInit } from "utils/amplitude";
import { polyfill } from "interweave-ssr";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "styles/globals.css";

import AuthProvider from "components/AuthProvider";
import Layout from "components/Layout";

// Interweave requires DOM, so polyfill is required
// for SSR (source: https://interweave.dev/docs/ssr)
polyfill();
ampInit();

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <AuthProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
