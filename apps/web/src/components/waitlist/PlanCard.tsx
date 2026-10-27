import { Check } from "lucide-react";
import type { Plan } from "../../data/waitlist";

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  return (
    <article className="flex flex-col rounded-card bg-card p-5 shadow-card">
      <h3 className="m-0 text-lg font-bold">{plan.name}</h3>
      <p className="mt-1 mb-0 text-sm text-muted">{plan.summary}</p>
      <p className="mt-3 mb-0">
        <span className="text-3xl font-bold">{plan.monthly}</span>{" "}
        <span className="text-muted">a month</span>
      </p>
      <p className="mt-0.5 mb-0 min-h-5 text-sm text-muted">
        {plan.yearly && `or ${plan.yearly} a year, 2 months free`}
      </p>
      <ul className="mt-4 mb-0 flex flex-col gap-1.5 pl-0">
        {plan.features.map((feature) => (
          <li key={feature} className="flex list-none gap-2">
            <Check size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-match-text" />
            {feature}
          </li>
        ))}
      </ul>
    </article>
  );
}
