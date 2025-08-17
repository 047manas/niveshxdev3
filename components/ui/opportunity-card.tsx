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
    <Card className="flex flex-col bg-gradient-to-br from-[#1a2332] to-[#0D1B2A] border-gray-700 hover:border-[#3BB273]/50 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-white">{companyName}</CardTitle>
        <div className="flex gap-2 pt-2">
          <Badge className="bg-[#3BB273]/10 text-[#3BB273] border-[#3BB273]/30">{industry}</Badge>
          <Badge className="bg-[#3BB273]/10 text-[#3BB273] border-[#3BB273]/30">{stage}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-gray-300 text-sm">{description}</p>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#3BB273] hover:bg-[#3BB273]/90 text-white font-semibold">Express Interest</Button>
      </CardFooter>
    </Card>
  );
}

