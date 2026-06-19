import { LucideIcon, PackageX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  noShadow?: boolean;
}

export default function Empty({
  icon: Icon = PackageX,
  title,
  description,
  noShadow,
}: EmptyStateProps) {
  return (
    <Card
      className={cn("w-full mx-auto", {
        "shadow-none": noShadow,
      })}
    >
      <CardContent className="flex flex-col items-center justify-center space-y-4 text-center p-6">
        <Icon className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
