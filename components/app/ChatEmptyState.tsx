import { MessageSquare } from "lucide-react";

export function ChatEmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="rounded-full bg-muted p-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Open a chat to preview</h3>
          <p className="text-sm text-muted-foreground">
            Select a conversation from the sidebar or start a new chat to begin.
          </p>
        </div>
      </div>
    </div>
  );
}

