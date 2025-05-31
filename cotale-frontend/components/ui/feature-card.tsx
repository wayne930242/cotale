import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <Card
      className={`bg-white/10 backdrop-blur-sm border-white/20 ${
        className || ""
      }`}
    >
      <CardHeader className="text-center">
        <Icon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <CardTitle className="text-xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-slate-300 text-center">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
