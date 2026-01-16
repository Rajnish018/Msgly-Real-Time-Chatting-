import { useState } from "react";

export const useMessageMenu = () => {
  const [menu, setMenu] = useState(null);

  const openMenu = ({ msg, isMine, rect }) => {
    const openUp = rect.top > window.innerHeight / 2;

    setMenu({
      msg,
      isMine,
      rect,
      openUp,
    });
  };

  const closeMenu = () => setMenu(null);

  return { menu, openMenu, closeMenu };
};
