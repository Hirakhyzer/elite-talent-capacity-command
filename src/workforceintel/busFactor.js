export function busFactor(team, criticalSkills) {
  const owners = criticalSkills.map((skill) => ({ skill, owners: team.filter((person) => (person.skills || []).includes(skill)).map((person) => person.id) }));
  const minimum = owners.length ? Math.min(...owners.map((row) => row.owners.length)) : 0;
  return { minimum, resilient: minimum >= 2, risks: owners.filter((row) => row.owners.length < 2) };
}
