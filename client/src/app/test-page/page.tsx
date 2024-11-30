import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Person } from "../api/models/Person";
import { PersonService } from "../api/services";
import { ButtonDemo } from "../components/atoms/button";
import FileUploader from "../components/atoms/file-uploader";

export default async function Page() {
  const service = new PersonService();
  try {
    const data: Person[] = await service.getList();
    if (!data || data.length === 0) {
      return <p>No members found.</p>;
    }
    return (
      <Card className="page-wrapper">
        <CardHeader>Testovací stránka</CardHeader>
        <CardContent>
          <ul>
            {data.map((person: Person) => (
              <li key={person.id}>
                {person.name} {person.category} {person.crew_id}
              </li>
            ))}
          </ul>
          <ButtonDemo></ButtonDemo>
          <FileUploader></FileUploader>
        </CardContent>
      </Card>
    );
  } catch (error) {
    return <p>Error: Could not load members.</p>;
  }
}
