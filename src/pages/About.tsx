import { motion } from "framer-motion";
import Navbar from "../components/navbar";

const DISPLAY: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
};

const SF: React.CSSProperties = {
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
};

export default function About() {
  return (
    <div className="min-h-dvh bg-white flex flex-col px-8 md:px-14">
      <Navbar background="#ffffff" />

      <div className="max-w-4xl w-full mx-auto pt-32 md:pt-48 pb-24">
        {/* Header */}
        <div className="mb-16 flex items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1
                className="text-neutral-900 leading-[1.05] tracking-[-0.025em]"
                style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 600, ...DISPLAY }}
              >
                About Film Index
              </h1>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-neutral-700"
          style={{ fontSize: 17, lineHeight: 1.8, ...SF, textAlign: "left" }}
        >
          <p>Film Index is a personal project for experimenting with ways of showcasing films.</p>
          <p>More functionality is coming soon, including a favorites section for viewing your collection. For feedback or inquiries, contact me @ x</p>
          <p>Powered by OMDB & TMDB.</p>
        </motion.div>
      </div>
    </div>
  );
}
