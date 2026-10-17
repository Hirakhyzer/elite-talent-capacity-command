export function portfolioLoad(assignments) {
  const totals = assignments.reduce((acc, item) => {
    acc[item.personId] = (acc[item.personId] || 0) + Number(item.hours || 0);
    return acc;
  }, {});
  const total = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const rows = Object.entries(totals).map(([personId, hours]) => ({ personId, hours, share: total ? hours / total * 100 : 0 })).sort((a, b) => b.hours - a.hours);
  return { totalHours: total, rows, topPersonShare: rows[0]?.share || 0 };
}
