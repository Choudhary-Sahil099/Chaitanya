import { LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Safe",
    subtitle: "Educational Use",
  },
  {
    icon: LockKeyhole,
    title: "Secure",
    subtitle: "Your Data Stays Private",
  },
  {
    icon: UsersRound,
    title: "Responsible AI",
    subtitle: "Not a Medical Diagnosis",
  },
];

export default function TrustIndicators() {
  return (
    <div className="trust-indicators">
      {items.map(({ icon: Icon, title, subtitle }) => (
        <div className="trust-item" key={title}>
          <Icon className="trust-icon" size={29} strokeWidth={1.9} />
          <div>
            <p className="trust-title">{title}</p>
            <p className="trust-subtitle">{subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
