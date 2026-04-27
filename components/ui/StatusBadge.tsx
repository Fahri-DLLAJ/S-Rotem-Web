import { getStatusColor } from "@/lib/utils";

interface Props {
  status: "active" | "resolved" | "pending" | "offline";
  label?: string;
}

const labelMap = {
  active: "Aktif",
  resolved: "Selesai",
  pending: "Menunggu",
  offline: "Offline",
};

export default function StatusBadge({ status, label }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20">
      <span className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
      {label ?? labelMap[status]}
    </span>
  );
}
