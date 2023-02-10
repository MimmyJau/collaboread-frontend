import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'

import Tiptap from '../components/Tiptap'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Collaboread</title>
        <meta name="description" content="Read together" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={inter.className}>
        <h1 className="text-3xl font-bold underline text-green-700">
          Hello world!
        </h1>
        <Tiptap />
      </main>
    </>
  )
}
