import React from "react";

/**
 * PrithviNet logo (PN + globe/leaf + "PrithviNet" text).
 * Place your logo at public/logo.png (PNG with transparent background recommended).
 * Uses mix-blend-mode so white areas blend with the background.
 */
export default function PrithviNetLogo({ className = "", width, height, alt = "PrithviNet", ...props }) {
  const style = {};
  if (width != null) style.width = typeof width === "number" ? `${width}px` : width;
  if (height != null) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`prithvinet-logo ${className}`.trim()}
      style={style}
      {...props}
    />
  );
}
