export function hiringPriorities(gaps) {
  return gaps.map((gap) => {
    const demand = Number(gap.demandHours || 0);
    const supply = Number(gap.availableHours || 0);
    const deficit = Math.max(0, demand - supply);
    const scarcity = Number(gap.peopleWithSkill || 0) <= 1 ? 25 : 0;
    const score = Math.min(100, Math.round(deficit * 1.5 + scarcity + (gap.critical ? 20 : 0)));
    return { ...gap, deficit, score };
  }).sort((a, b) => b.score - a.score);
}
