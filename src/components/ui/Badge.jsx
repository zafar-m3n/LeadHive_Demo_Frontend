import React from "react";
import Icon from "@/components/ui/Icon";

function Badge({ text, color = "blue", size = "md", icon = null, rounded = "rounded" }) {
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const colorClasses = {
    blue: "bg-blue-100 text-blue-800",
    red: "bg-red-100 text-red-800",
    green: "bg-green-100 text-green-800",
    yellow: "bg-yellow-100 text-yellow-800",
    gray: "bg-gray-100 text-gray-800",
    purple: "bg-purple-100 text-purple-800",
    pink: "bg-pink-100 text-pink-800",
    indigo: "bg-indigo-100 text-indigo-800",
    teal: "bg-teal-100 text-teal-800",
    orange: "bg-orange-100 text-orange-800",

    emerald: "bg-emerald-100 text-emerald-800",
    slate: "bg-slate-100 text-slate-800",
    cyan: "bg-cyan-100 text-cyan-800",
    lime: "bg-lime-100 text-lime-800",
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-800",
    violet: "bg-violet-100 text-violet-800",
    fuchsia: "bg-fuchsia-100 text-fuchsia-800",
    sky: "bg-sky-100 text-sky-800",
  };

  const resolvedSizeClass = sizeClasses[size] || sizeClasses.md;
  const resolvedColorClass = colorClasses[color] || colorClasses.gray;

  return (
    <span
      className={`inline-flex items-center ${resolvedSizeClass} ${resolvedColorClass} ${rounded} font-medium capitalize`}
    >
      {icon && <Icon icon={icon} className="me-2 h-4 w-4 shrink-0" />}
      <span className="truncate">{text}</span>
    </span>
  );
}

export default Badge;
