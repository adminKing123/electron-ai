import { motion } from "framer-motion";
import AuthorizationHeader from "../components/AuthorizationHeader";
import { TbGalaxy } from "react-icons/tb";
import GoogleSignInButton from "../components/Buttons/GoogleSignInButton";
import useUserStore from "../store/useUserStore";
import { Navigate } from "react-router-dom";
import ROUTES from "../router/routes";

/** Staggered entrance variants */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/** Logo: scale + fade — feels like an app launching */
const logoVariants = {
  hidden: { opacity: 0, scale: 0.82 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.34, 1.56, 0.64, 1] } },
};

/** Text + button: pure fade, very subtle lift */
const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

const AuthorizationPage = () => {
  const user = useUserStore((state) => state.user);

  if (user) return <Navigate to={ROUTES.INDEX} />;

  return (
    <div className="bg-[#fafafa] dark:bg-[#141414] w-screen h-[100dvh] flex flex-col overflow-hidden">
      {/* Header */}
      <AuthorizationHeader />

      {/* Centered card area */}
      <div className="flex-1 flex items-center justify-center px-5">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[400px] flex flex-col items-center"
        >
          {/* Logo mark */}
          <motion.div variants={logoVariants} className="mb-8">
            <div className="w-[72px] h-[72px] rounded-[22px] bg-[#111] dark:bg-white flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(255,255,255,0.08)]">
              <TbGalaxy className="text-white dark:text-[#111] w-[38px] h-[38px]" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants} className="text-center mb-2">
            <h1 className="text-[26px] font-semibold tracking-tight text-[#111] dark:text-white leading-tight">
              Welcome to AURA
            </h1>
          </motion.div>

          {/* Subline */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <p className="text-[14px] text-[#888] dark:text-[#888] leading-relaxed max-w-[280px]">
              Sign in to access your workspace, chats, and personal AI assistant.
            </p>
          </motion.div>

          {/* Sign-in button */}
          <motion.div variants={itemVariants} className="w-full flex justify-center">
            <GoogleSignInButton />
          </motion.div>

          {/* Legal footnote */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-[11px] text-[#bbb] dark:text-[#555] text-center max-w-[300px] leading-relaxed"
          >
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthorizationPage;
