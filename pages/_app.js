import { Open_Sans } from "next/font/google";
import { useState } from "react";

import { polyfill } from "interweave-ssr";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "styles/globals.css";

// Interweave requires DOM, so polyfill is required
// for SSR (source: https://interweave.dev/docs/ssr)
polyfill();

const inter = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <main className={`${inter.variable} font-sans`}>
          <Component {...pageProps} />
        </main>
      </Hydrate>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}
