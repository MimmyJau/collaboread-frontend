import Link from "next/link";

import NavBar from "components/NavBar";

const zarathustraSlug = process.env.SLUG;

const Feed = () => {
  return (
    <div className="flex justify-center content-center py-2">
      <div className="w-7/12">
        <h1 className="font-semibold text-4xl my-5">Books (more to come!)</h1>
        <div className="bg-yellow-50 rounded-lg hover:bg-yellow-100 hover:rounded-lg">
          <Link href={`/a/${zarathustraSlug}`}>
            <div className="p-5">
              <h2 className="text-xl">Thus Spoke Zarathustra</h2>
              <h3 className="text-sm">by Friedrich Nietzsche</h3>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <>
      <NavBar />
      <Feed />
    </>
  );
}
