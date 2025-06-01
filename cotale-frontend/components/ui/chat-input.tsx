import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ChatInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Auto-resize function
    const autoResize = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // Max height: 120px
      }
    }, []);

    // Handle input change to trigger auto-resize
    const handleInput = React.useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
      autoResize();
      if (props.onInput) {
        props.onInput(e);
      }
    }, [autoResize, props]);

    // Auto-resize on mount and when value changes
    React.useEffect(() => {
      autoResize();
    }, [autoResize, props.value]);

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!, []);

    return (
      <Textarea
        autoComplete="off"
        ref={textareaRef}
        name="message"
        rows={1}
        onInput={handleInput}
        className={cn(
          "min-h-[40px] max-h-[120px] px-4 py-3 text-sm w-full rounded-md resize-none overflow-y-auto",
          "bg-background text-foreground",
          "border border-input",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
