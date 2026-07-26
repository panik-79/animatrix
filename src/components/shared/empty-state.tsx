import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col items-center justify-center p-8 text-center space-y-4", className)}
    >
      {icon && <div className="text-muted-foreground mb-2">{icon}</div>}
      <h3 className="text-xl font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground max-w-md">{description}</p>}
      {action && <div className="pt-4">{action}</div>}
    </motion.div>
  );
}
