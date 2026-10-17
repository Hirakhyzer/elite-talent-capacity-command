export function capacityForecast(team, demandByWeek) {
  const weeklyCapacity = team.reduce((sum, person) => sum + Math.max(0, Number(person.weeklyCapacity || person.capacity || 0)), 0);
  return Object.entries(demandByWeek).map(([week, demand]) => {
    const available = weeklyCapacity;
    const gap = available - Number(demand || 0);
    const utilization = available ? Number(demand || 0) / available * 100 : 0;
    return { week, demand: Number(demand || 0), available, gap, utilization, overloaded: gap < 0 };
  });
}
