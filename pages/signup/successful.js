import Link from "next/link";
import NavBar from "components/NavBar";

const SignupSuccess = () => {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Sign up successful!
          </h2>
          <p className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Click here to log in.
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const SignupSuccessPage = () => {
  return (
    <div>
      <NavBar />
      <SignupSuccess />
    </div>
  );
};

export default SignupSuccessPage;
