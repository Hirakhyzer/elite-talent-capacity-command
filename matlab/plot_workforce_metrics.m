function plot_workforce_metrics(outputs_dir)
%PLOT_WORKFORCE_METRICS Plot synthetic workforce gap and burnout metrics.
% Usage: plot_workforce_metrics('outputs')

if nargin < 1
    outputs_dir = fullfile('..', 'outputs');
end
gap_path = fullfile(outputs_dir, 'results', 'synthetic_skill_gaps.csv');
burnout_path = fullfile(outputs_dir, 'results', 'synthetic_burnout_risk.csv');
if ~isfile(gap_path) || ~isfile(burnout_path)
    error('Run scripts/run_synthetic_workforce_lab.py first.');
end
G = readtable(gap_path);
B = readtable(burnout_path);
figure('Color','w','Position',[100 100 950 420]);
subplot(1,2,1);
histogram(G.gap_risk_score);
title('Synthetic skill gap risk'); xlabel('Risk score'); ylabel('Count'); grid on;
subplot(1,2,2);
histogram(B.burnout_risk_score);
title('Synthetic burnout-risk proxy'); xlabel('Risk score'); ylabel('Count'); grid on;
exportgraphics(gcf, fullfile(outputs_dir, 'figures', 'synthetic_workforce_metrics_matlab.png'), 'Resolution', 250);
end
