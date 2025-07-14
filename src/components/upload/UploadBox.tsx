import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UploadBox() {
  return (
    <Card className="mb-6">
      <CardHeader>
        <h2 className="text-2xl font-semibold">Feltöltés</h2>
      </CardHeader>
      <CardContent>
        <Input type="file" multiple />
      </CardContent>
      <CardFooter>
        <Button>Feltöltés</Button>
      </CardFooter>
    </Card>
  );
}
