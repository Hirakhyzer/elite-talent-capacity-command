export function trainingPriorities(team, desiredSkills) {
  return desiredSkills.map((skill) => {
    const holders = team.filter((person) => (person.skills || []).includes(skill));
    const candidates = team.filter((person) => !(person.skills || []).includes(skill));
    const urgency = holders.length === 0 ? 100 : holders.length === 1 ? 75 : holders.length === 2 ? 40 : 15;
    return { skill, holders: holders.map((person) => person.id), candidateIds: candidates.map((person) => person.id), urgency };
  }).sort((a, b) => b.urgency - a.urgency);
}
