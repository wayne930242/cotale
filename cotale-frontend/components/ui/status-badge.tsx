import { Badge } from "@/components/ui/badge";

type StatusType = "connected" | "connecting" | "disconnected";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig = {
  connected: {
    text: "Editor Ready",
    variant: "default" as const,
    dotColor: "bg-green-400",
  },
  connecting: {
    text: "Loading...",
    variant: "secondary" as const,
    dotColor: "bg-yellow-400",
  },
  disconnected: {
    text: "Connection Lost",
    variant: "destructive" as const,
    dotColor: "bg-red-400",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    </div>
  );
} 
