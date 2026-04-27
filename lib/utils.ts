export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getSeverityColor(severity: "low" | "medium" | "high" | "critical") {
  const map = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };
  return map[severity] ?? map.low;
}

export function getStatusColor(status: "active" | "resolved" | "pending" | "offline") {
  const map = {
    active: "bg-green-500",
    resolved: "bg-blue-500",
    pending: "bg-yellow-500",
    offline: "bg-gray-400",
  };
  return map[status] ?? map.pending;
}
