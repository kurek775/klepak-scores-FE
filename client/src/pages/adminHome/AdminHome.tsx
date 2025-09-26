import PendingUsersTable from "../../components/pendingUsersTable/PendingUsersTable";
import SportsTable from "../../components/sportsTable/SportsTable";
import ToursTable from "../../components/toursTable/ToursTable";

export default function AdminHome() {
  return (
    <div>
      <SportsTable />
      <ToursTable />
      <PendingUsersTable />
    </div>
  );
}
