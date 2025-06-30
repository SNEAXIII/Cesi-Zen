import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ArticleCreatorBadge({ creator }: { creator: string }) {
  return (
    <Avatar className="h-8 w-8 bg-blue-100 text-blue-800">
      <AvatarFallback className="text-sm font-medium">
        {creator.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}