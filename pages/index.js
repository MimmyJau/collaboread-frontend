import * as amplitude from "@amplitude/analytics-browser";
import Link from "next/link";

import NavBar from "components/NavBar";
import { useFetchArticles } from "hooks";

import { ampTrack } from "utils/amplitude";

const zarathustraSlug = process.env.SLUG;

const Card = ({ slugFull, title, author }) => {
  return (
    <div className="bg-yellow-50 rounded-lg hover:bg-yellow-100 hover:rounded-lg">
      <Link href={`/a/${slugFull}/`} onClick={() => ampTrack(title)}>
        <div className="p-5">
          <h2 className="text-xl">{title}</h2>
          {author ? <h3 className="text-sm">by {author}</h3> : null}
        </div>
      </Link>
    </div>
  );
};

const Feed = () => {
  const { isLoading, isError, data, error } = useFetchArticles();
  if (isLoading) return;
  if (isError) return;
  return (
    <div className="flex justify-center content-center py-2">
      <div className="w-7/12">
        <h1 className="font-semibold text-4xl my-5">Books (more to come!)</h1>
        {data.map((article, index) => (
          <Card key={index} {...article} />
        ))}
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
