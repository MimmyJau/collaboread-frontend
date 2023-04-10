import Link from "next/link";
import useAuth from "hooks/auth";

const NavHome = () => {
  return (
    <div className="mr-2">
      <Link href="/">
        <button className="bg-gray-100 rounded-lg text-blue-500 px-3 py-2 hover:bg-yellow-300 hover:text-pink-600">
          <h1 className="font-semibold text-3xl">Collaboread</h1>
        </button>
      </Link>
    </div>
  );
};

const NavUser = () => {
  const { user, login, logout } = useAuth();

  if (!user) {
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
      <div className="mr-2">
        <button
          onClick={() => logout()}
          className="bg-gray-100 rounded-lg text-blue-500 px-3 py-2 hover:bg-yellow-300 hover:text-pink-600"
        >
          Log Out
        </button>
      </div>
    );
  }
};

const NavBar = (props) => {
  return (
    <nav className="">
      <div className="flex flex-row justify-between items-center p-2 border border-black">
        <NavHome />
        <NavUser user={props.user} />
      </div>
    </nav>
  );
};

export default NavBar;
