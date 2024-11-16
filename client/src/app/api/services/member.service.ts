import { Member } from "../models/Member";
export class MemberService {
    private readonly apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
  
    async getList(): Promise<Member[]> {
      const response = await fetch(`${this.apiBaseUrl}/crewResults/`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data as Member[];
    }
  }
  