const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

export function burnoutRisk(person) {
  const capacity = Math.max(1, Number(person.weeklyCapacity || person.capacity || 40));
  const committed = Number(person.committed || 0);
  const utilization = committed / capacity;
  const overtime = Math.max(0, committed - capacity);
  const score = Math.round(clamp(utilization * 65 + overtime * 2.5, 0, 100));
  return { utilization, overtime, score, band: score >= 80 ? "Critical" : score >= 65 ? "High" : score >= 45 ? "Watch" : "Healthy" };
}
