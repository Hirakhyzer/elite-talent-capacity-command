import { burnoutRisk } from "./burnout";

export function workforceHealth(team) {
  if (!team.length) return { score: 100, band: "Healthy", peopleAtRisk: [] };
  const risks = team.map((person) => ({ id: person.id, ...burnoutRisk(person) }));
  const averageRisk = risks.reduce((sum, row) => sum + row.score, 0) / risks.length;
  const score = Math.round(100 - averageRisk);
  return { score, band: score >= 70 ? "Healthy" : score >= 50 ? "Watch" : "Critical", peopleAtRisk: risks.filter((row) => row.score >= 65).map((row) => row.id) };
}
