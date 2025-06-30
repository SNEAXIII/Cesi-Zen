import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ArticleCreatorBadgeProps {
  readonly creator: string;
}

export default function ArticleCreatorBadge({ creator }: Readonly<ArticleCreatorBadgeProps>) {
  return (
    <Avatar className="h-8 w-8 bg-blue-100 text-blue-800">
      <AvatarFallback className="text-sm font-medium">
        {creator.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}