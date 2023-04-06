import Link from "next/link";

const NavUser = (props) => {
  if (!props.user) {
    return (
      <div className="mr-2">
        <Link href="/login">
          <button className="bg-gray-100 rounded-lg text-blue-500 px-3 py-2 hover:bg-yellow-300 hover:text-pink-600">
            Sign In
          </button>
        </Link>
      </div>
    );
  } else {
    return (
      <div className="bg-gray-100 rounded-lg text-blue-500 px-3 py-2 hover:bg-yellow-300 hover:text-pink-600">
        <span>Jimmy</span>
      </div>
    );
  }
};

const NavBar = (props) => {
  return (
    <nav className="">
      <div className="flex flex-row justify-between p-2 border border-black">
        <div></div>
        <NavUser user={props.user} />
      </div>
    </nav>
  );
};

export default NavBar;
