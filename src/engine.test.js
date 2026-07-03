import { describe, expect, it } from "vitest";
import { cloneInitialState } from "./data";
import { capacitySummary, hiringAnalysis, personLoad, projectAnalysis, staffingOptions } from "./engine";

describe("talent capacity engine", () => {
  it("calculates assigned hours and utilization for a person", () => {
    const state = cloneInitialState();
    const musa = state.people.find((person) => person.id === "musa");
    const load = personLoad(musa, state.assignments);
    expect(load.allocated).toBe(35);
    expect(load.utilization).toBeGreaterThan(90);
    expect(load.free).toBe(1);
  });

  it("identifies staffing capacity pressure on a project", () => {
    const state = cloneInitialState();
    const atlas = state.projects.find((project) => project.id === "atlas");
    const analysis = projectAnalysis(atlas, state.people, state.assignments);
    expect(analysis.assignedHours).toBeLessThan(atlas.targetHours);
    expect(analysis.capacityGap).toBeGreaterThan(0);
    expect(analysis.riskScore).toBeGreaterThan(0);
  });

  it("ranks available skills and capacity for staffing options", () => {
    const state = cloneInitialState();
    const atlas = state.projects.find((project) => project.id === "atlas");
    const options = staffingOptions(atlas, state.people, state.contractors, state.assignments);
    expect(options.length).toBe(state.people.length + state.contractors.length);
    expect(options[0].score).toBeGreaterThanOrEqual(options[1].score);
  });

  it("compares hire and contractor monthly cost", () => {
    const state = cloneInitialState();
    const role = state.roleRequests[0];
    const hire = hiringAnalysis(role, "hire");
    const contractor = hiringAnalysis(role, "contractor");
    expect(hire.selectedCost).toBe(role.monthlyCost);
    expect(contractor.selectedCost).toBeGreaterThan(0);
  });

  it("summarizes team demand, risks, and recruiting pipeline", () => {
    const state = cloneInitialState();
    const summary = capacitySummary(state);
    expect(summary.people).toHaveLength(state.people.length);
    expect(summary.activeProjects.length).toBeGreaterThan(0);
    expect(summary.monthlyPayroll).toBeGreaterThan(0);
    expect(summary.recruitment.total).toBe(state.candidates.length);
  });
});
