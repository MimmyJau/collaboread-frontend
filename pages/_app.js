import { polyfill } from 'interweave-ssr';

import '@/styles/globals.css'

// Interweave requires DOM, so polyfill is required
// for SSR (source: https://interweave.dev/docs/ssr)
polyfill();

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}
