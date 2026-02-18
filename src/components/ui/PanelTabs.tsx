import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const PanelTabs = TabsPrimitive.Root;

const PanelTabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "flex gap-1 p-1.5 mx-5 my-3 bg-muted rounded-[10px]",
            className,
        )}
        {...props}
    />
));
PanelTabsList.displayName = "PanelTabsList";

const PanelTabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm",
            className,
        )}
        {...props}
    />
));
PanelTabsTrigger.displayName = "PanelTabsTrigger";

const PanelTabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "flex-1 min-h-0 overflow-y-auto focus-visible:outline-none",
            className,
        )}
        {...props}
    />
));
PanelTabsContent.displayName = "PanelTabsContent";

export { PanelTabs, PanelTabsList, PanelTabsTrigger, PanelTabsContent };
