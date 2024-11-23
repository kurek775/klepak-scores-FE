import { Person } from "../models/Person";
export class PersonService {
    private readonly apiBaseUrl = process.env.LOCAL_BE + '/api';
  
    async getList(): Promise<Person[]> {
      const response = await fetch(`${this.apiBaseUrl}/persons`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const res = await response.json();
      return res.data as Person[];
    }
  }
  