"use client";
import { useEffect, useState } from "react";
import { UAParser } from "ua-parser-js";

export default function useMobileMode() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mobile") === "1") {
      setIsMobile(true);
      return;
    }
    const parser = new UAParser(window.navigator.userAgent);
    const type = parser.getDevice().type;
    setIsMobile(type === "mobile" || type === "tablet");
  }, []);

  return isMobile;
}
