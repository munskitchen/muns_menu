import { useEffect } from "react";

export default function MenuPage() {
  useEffect(() => {
    window.location.href = "/menu.pdf";
  }, []);

  return <p>Loading menu...</p>;
}