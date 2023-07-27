import Link from "next/link";

const NavButton = ({ text, href }) => {
  return (
    <Link
      href={href}
      className="bg-gray-100 rounded-lg text-blue-500 px-3 py-2 hover:bg-yellow-300 hover:text-pink-600"
    >
      {text}
    </Link>
  );
};

const Pagination = (props) => {
  return (
    <div className="flex flex-row justify-between p-2 w-full">
      {props.prevHref ? (
        <NavButton text="Prev" href={props.prevHref} />
      ) : (
        <div></div>
      )}
      {props.nextHref ? (
        <NavButton text="Next" href={props.nextHref} />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Pagination;
