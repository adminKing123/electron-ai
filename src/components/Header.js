import { useEffect } from "react";

const Header = () => {
  useEffect(() => {
    const container = document.getElementById("messages-container");
    const header = document.getElementById("header");
    const handleScroll = () => {
      if (container.scrollTop > 0) {
        header.classList.add("header-border");
      } else {
        header.classList.remove("header-border");
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);
  return <header id="header" className="h-[56px] w-full"></header>;
};

export default Header;
