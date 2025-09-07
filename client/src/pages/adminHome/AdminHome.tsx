import PendingUsersTable from "../../components/pendingUsersTable/PendingUsersTable";
import ToursTable from "../../components/toursTable/ToursTable";

export default function AdminHome() {
  return (
    <div>
      <ToursTable />
      <PendingUsersTable />
    </div>
  );
}
