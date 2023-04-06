import { Open_Sans } from "next/font/google";
import Head from "next/head";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Collaboread</title>
        <meta name="description" content="Read together" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${openSans.variable} font-sans`}>{children}</main>
    </>
  );
};

export default Layout;
