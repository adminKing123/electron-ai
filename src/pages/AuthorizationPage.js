import { motion } from "framer-motion";
import AuthorizationHeader from "../components/AuthorizationHeader";
import AppleSignInButton from "../components/Buttons/AppleSignInButton";
import GoogleSignInButton from "../components/Buttons/GoogleSignInButton";
import useUserStore from "../store/useUserStore";
import { Navigate } from "react-router-dom";
import ROUTES from "../router/routes";

/** Staggered entrance variants */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
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
    <div className="bg-ink-25 dark:bg-ink-875 bg-aurora-glow dark:bg-aurora-glow-dark w-screen h-[100dvh] flex flex-col">
      <AuthorizationHeader />

      <div className="flex-1 flex items-center justify-center gap-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[520px] flex flex-col items-center px-5 md:px-0"
        >
          <motion.div variants={itemVariants} className="text-center mb-2">
            <h1 className="text-[30px] md:text-[52px] font-semibold tracking-tight leading-tight text-ink-975 dark:text-white pb-1">
              Question what's next
            </h1>
          </motion.div>
          <motion.div variants={itemVariants} className="text-center mb-8">
            <p className="text-[16px] text-ink-600 dark:text-ink-400 leading-relaxed">
              Your thinking partner, always ready to help.
            </p>
          </motion.div>
          <div className="w-full max-w-[380px]">
            <motion.div
              variants={itemVariants}
              className="w-full flex flex-col items-center gap-2"
            >
              <GoogleSignInButton />
              <AppleSignInButton />
            </motion.div>

            {/* Legal footnote */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-[12px] text-ink-400 dark:text-ink-600 text-center max-w-[380px] leading-relaxed"
            >
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </motion.p>
          </div>
        </motion.div>

        <div className="hidden lg:block aspect-[12/16] h-[80%] max-h-[712px] rounded-2xl overflow-hidden">
          <video src={"https://cdn.pixabay.com/video/2026/08/08/369425_large.mp4"} autoPlay loop muted className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
};

export default AuthorizationPage;
