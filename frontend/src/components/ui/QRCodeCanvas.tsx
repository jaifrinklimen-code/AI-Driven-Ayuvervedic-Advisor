import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeCanvasProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeCanvas: React.FC<QRCodeCanvasProps> = ({ value, size = 120, className = "" }) => {
  const [svgString, setSvgString] = useState<string>("");

  useEffect(() => {
    QRCode.toString(
      value,
      {
        type: "svg",
        margin: 1,
        width: size,
        color: {
          dark: "#06100C",
          light: "#FFFFFF",
        },
      },
      (err, svg) => {
        if (!err && svg) {
          setSvgString(svg);
        }
      }
    );
  }, [value, size]);

  if (!svgString) {
    return (
      <div
        style={{ width: size, height: size }}
        className="bg-white flex items-center justify-center rounded-xl"
      >
        <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white p-1 rounded-xl shadow-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: svgString }}
    />
  );
};
