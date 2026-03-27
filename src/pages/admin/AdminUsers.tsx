const users = [
  { id: "u1", name: "Admin User", email: "admin@soksabay.com", role: "admin", joined: "2026-01-01" },
  { id: "u2", name: "John Doe", email: "john@test.com", role: "user", joined: "2026-02-15" },
  { id: "u3", name: "Sarah T.", email: "sarah@test.com", role: "user", joined: "2026-02-20" },
  { id: "u4", name: "Mark L.", email: "mark@test.com", role: "user", joined: "2026-03-01" },
];

// TODO: apiFetch(`${BASE_URL}/admin/users`) to load real users

const AdminUsers = () => (
  <div>
    <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
            <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Role</th>
            <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-border">
              <td className="p-3 font-medium">{u.name}</td>
              <td className="p-3 text-muted-foreground">{u.email}</td>
              <td className="p-3 hidden sm:table-cell">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  u.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>{u.role}</span>
              </td>
              <td className="p-3 text-muted-foreground hidden sm:table-cell">{u.joined}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminUsers;
