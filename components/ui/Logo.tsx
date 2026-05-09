import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function Logo({ size = "md", showName = true, className }: LogoProps) {
  const iconSize = { sm: 26, md: 34, lg: 44 }[size];
  const svgSize = { sm: 13, md: 17, lg: 22 }[size];
  const textSize = { sm: "text-[14px]", md: "text-[17px]", lg: "text-[22px]" }[
    size
  ];
  const tagSize = { sm: "hidden", md: "text-[10px]", lg: "text-[11px]" }[size];
  const radius = {
    sm: "rounded-[7px]",
    md: "rounded-[9px]",
    lg: "rounded-[12px]",
  }[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "bg-[#7C6FE0] flex items-center justify-center shrink-0",
          radius,
        )}
        style={{ width: iconSize, height: iconSize }}
      >
        <svg width={svgSize} height={svgSize} viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="#fff" strokeWidth="1.4" />
          <path
            d="M6 9l2 2 4-4"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showName && (
        <div>
          <p
            className={cn(
              "font-bold text-[#16151F] tracking-[-0.03em] leading-none",
              textSize,
            )}
          >
            OwambePay
          </p>
          <p
            className={cn(
              "font-medium text-[#A09DB8] tracking-[0.03em] uppercase leading-none mt-1",
              tagSize,
            )}
          >
            Host portal
          </p>
        </div>
      )}
    </div>
  );
}
