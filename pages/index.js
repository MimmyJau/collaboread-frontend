import Link from "next/link";

import NavBar from "components/NavBar";

export default function Home() {
  return (
    <>
      <NavBar />
      <div className="border border-green-400 flex justify-center content-center">
        <div className="border border-blue-400 w-7/12">
          <h1 className="text-4xl">Books</h1>
          <Link href="/a/3d7fbac8-214d-4fa4-a157-f60b603b8980">
            <div className="border border-red-400 p-3">
              <h2 className="text-xl">Thus Spoke Zarathustra</h2>
              <h3 className="text-sm">by Friedrich Nietzsche</h3>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
