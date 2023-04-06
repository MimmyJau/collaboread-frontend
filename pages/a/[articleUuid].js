import { useRouter } from "next/router";
import Reader from "components/Reader";
import NavBar from "components/NavBar";

export default function Page() {
  return (
    <>
      <NavBar />
      <Reader />
    </>
  );
}
