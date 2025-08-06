import React from "react";
import clsx from "clsx";

type ButtonProps = {
  variant?: "primary" | "secondary";
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  text?: string;
};

export default function Button({
  variant = "primary",
  onClick,
  type = "button",
  className,
  disabled = false,
  text,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
    secondary:
      "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:text-blue-300 disabled:border-blue-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(baseClasses, variantClasses[variant], className)}
    >
      {text}
    </button>
  );
}
