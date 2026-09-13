interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): { label: string; score: number; color: string } {
  if (!password) return { label: "", score: 0, color: "bg-[#E2E8F0]" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: "Weak", score: 1, color: "bg-[#DC2626]" };
  if (score <= 3) return { label: "Medium", score: 3, color: "bg-[#D97706]" };
  return { label: "Strong", score: 4, color: "bg-[#16A34A]" };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;
  const { label, score, color } = getStrength(password);

  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i < score ? color : "bg-[#E2E8F0]"}`}
          />
        ))}
      </div>
      <div className="mt-1 text-xs text-[#64748B]">Strength: {label}</div>
    </div>
  );
}
