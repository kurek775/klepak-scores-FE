import { Member } from "../api/models/Member";
import { MemberService } from "../api/services";

export default async function Page() {
  const service = new MemberService();
  try {
    const data: Member[] = await service.getList();
    if (!data || data.length === 0) {
      return <p>No members found.</p>;
    }
    return (
      <ul>
        {data.map((member) => 
        <li key={member.id}>{member.name}</li>)}
      </ul>
    );
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return <p>Error: Could not load members.</p>;
  }
}
