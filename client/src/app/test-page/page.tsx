import { Person } from "../api/models/Person";
import { PersonService } from "../api/services";
import { ButtonDemo } from "../components/atoms/button";

export default async function Page() {
  const service = new PersonService();
  try {
    const data: Person[] = await service.getList();
    if (!data || data.length === 0) {
      return <p>No members found.</p>;
    }
    return (
      <div>
        <ul>
          {data.map((person:Person) => (
            <li key={person.id}>
              {person.name} {person.category} {person.crew_id}
            </li>
          ))}
        </ul>
        <ButtonDemo></ButtonDemo>
      </div>
    );
  } catch (error) {
    return <p>Error: Could not load members.</p>;
  }
}
