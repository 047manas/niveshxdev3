import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface OpportunityCardProps {
  companyName: string;
  industry: string;
  stage: string;
  description: string;
}

export function OpportunityCard({ companyName, industry, stage, description }: OpportunityCardProps) {
  return (
    <Card className="flex flex-col bg-gradient-to-br from-card to-background border-border hover:border-primary/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white">{companyName}</CardTitle>
        <div className="flex gap-2 pt-2">
          <Badge className="bg-primary/10 text-primary border-primary/30">{industry}</Badge>
          <Badge className="bg-primary/10 text-primary border-primary/30">{stage}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-300 text-sm">{description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Express Interest</Button>
      </CardFooter>
    </Card>
  );
}

