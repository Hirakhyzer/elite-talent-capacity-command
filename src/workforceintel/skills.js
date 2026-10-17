export function skillCoverage(team, requiredSkills) {
  const coverage = requiredSkills.map((skill) => {
    const people = team.filter((person) => (person.skills || []).includes(skill));
    return { skill, people: people.map((person) => person.id), count: people.length, singlePointOfFailure: people.length === 1, missing: people.length === 0 };
  });
  return { coverage, missing: coverage.filter((row) => row.missing).map((row) => row.skill), fragile: coverage.filter((row) => row.singlePointOfFailure).map((row) => row.skill) };
}
