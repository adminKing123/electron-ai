import { FaGoogle } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../firebase";
import { useNavigate } from "react-router-dom";
import ROUTES from "../../router/routes";

const GoogleSignInButton = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      navigate(ROUTES.INDEX);
    } catch (error) {
      console.error("Login Error:", error.message);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="flex items-center justify-between gap-2 border py-1.5 px-3 rounded-3xl text-[#aaa] border-[#aaa] hover:text-[#cdcdcd] hover:border-[#cdcdcd]"
    >
      <div>
        <FaGoogle />
      </div>
      <div className="text-sm">Continue with Google</div>
    </button>
  );
};

export default GoogleSignInButton;
