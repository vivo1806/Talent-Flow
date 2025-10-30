interface JobsFiltersProps {
  filters: { search: string; status: string; type: string };
  setFilter: (key: string, value: string) => void;
}

export default function JobsFilters({ filters, setFilter }: JobsFiltersProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "1rem",
      }}
    >
      <input
        type="text"
        placeholder="Search jobs..."
        value={filters.search}
        onChange={(e) => setFilter("search", e.target.value)}
      />

      <select
        value={filters.status}
        onChange={(e) => setFilter("status", e.target.value)}
      >
        <option value="all">All Statuses</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
      </select>

      <select
        value={filters.type}
        onChange={(e) => setFilter("type", e.target.value)}
      >
        <option value="all">All Types</option>
        <option value="full-time">Full-time</option>
        <option value="part-time">Part-time</option>
        <option value="contract">Contract</option>
      </select>
    </div>
  );
}
