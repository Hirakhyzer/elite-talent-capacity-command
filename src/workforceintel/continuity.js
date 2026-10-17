export function continuityRisk(team, assignments) {
  return assignments.map((assignment) => {
    const owners = team.filter((person) => assignment.requiredSkills.every((skill) => (person.skills || []).includes(skill)));
    const score = owners.length === 0 ? 100 : owners.length === 1 ? 75 : owners.length === 2 ? 35 : 10;
    return { assignmentId: assignment.id, qualifiedOwners: owners.map((person) => person.id), score, band: score >= 75 ? "High" : score >= 35 ? "Watch" : "Healthy" };
  });
}
