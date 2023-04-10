import Link from "next/link";
import NavBar from "components/NavBar";

const SignupError = () => {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sorry! There has been an error with your sign up.
          </h2>
          <div className="my-5">
            <p className="text-center text-xl my-3">
              Check that you have the following:
            </p>
            <ul className="pl-5">
              <li>Unique username between 4-20 characters.</li>
              <li>Valid email address.</li>
              <li>Password is not too similar to your username.</li>
              <li>Both passwords match.</li>
            </ul>
          </div>
          <p className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            <Link
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Try again here!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const SignupErrorPage = () => {
  return (
    <div>
      <NavBar />
      <SignupError />
    </div>
  );
};

export default SignupErrorPage;
