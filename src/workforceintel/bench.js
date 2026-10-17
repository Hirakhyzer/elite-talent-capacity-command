export function benchMetrics(team) {
  const rows = team.map((person) => {
    const capacity = Math.max(1, Number(person.weeklyCapacity || person.capacity || 40));
    const freeHours = Math.max(0, capacity - Number(person.committed || 0));
    return { id: person.id, freeHours, freePercent: freeHours / capacity * 100 };
  });
  return { rows, totalFreeHours: rows.reduce((sum, row) => sum + row.freeHours, 0), deeplyAvailable: rows.filter((row) => row.freePercent >= 40).length };
}
