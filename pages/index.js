import Tiptap from "components/Tiptap";
import Reader from "components/Reader";

export default function Home() {
  return (
    <>
      <h1 className="text-3xl font-bold underline text-green-700">
        Hello world!
      </h1>
      <Tiptap />
      <Reader />
    </>
  );
}
