import { FaGoogle } from "react-icons/fa";

const GoogleSignInButton = () => {
  return (
    <button className="flex items-center justify-between gap-2 border py-1.5 px-3 rounded-3xl text-[#aaa] border-[#aaa] hover:text-[#cdcdcd] hover:border-[#cdcdcd]">
      <div>
        <FaGoogle />
      </div>
      <div className="text-sm">Continue with Google</div>
    </button>
  );
};

export default GoogleSignInButton;
