// DrillDiagnose Diagnostic Engine

/**
 * Run the diagnostic matching logic
 * @param {string[]} selectedSymptomIds - Array of active symptom IDs
 * @param {Object[]} problems - The problems database array
 * @returns {Object[]} Ranked diagnoses list
 */
function diagnose(selectedSymptomIds, problems) {
  if (!selectedSymptomIds || selectedSymptomIds.length === 0) {
    return [];
  }

  const results = problems.map(problem => {
    // Identify which of this problem's symptoms are currently active
    const matchedIds = problem.symptoms.filter(id => selectedSymptomIds.includes(id));
    const missingIds = problem.symptoms.filter(id => !selectedSymptomIds.includes(id));

    // Calculate score: (matched symptoms) / (total symptoms for that problem)
    const scoreFraction = matchedIds.length / problem.symptoms.length;
    const scorePercent = Math.round(scoreFraction * 100);

    // Determine confidence level:
    // 80-100% = High
    // 50-79% = Medium
    // 0-49% = Low
    let confidence = "Low";
    if (scorePercent >= 80) {
      confidence = "High";
    } else if (scorePercent >= 50) {
      confidence = "Medium";
    }

    return {
      ...problem,
      matchedIds,
      missingIds,
      score: scorePercent,
      confidence
    };
  });

  // Sort by score (highest to lowest). If scores are equal, sort by risk level (High > Medium > Low)
  const riskPriority = { "High": 3, "Medium": 2, "Low": 1 };
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return riskPriority[b.risk] - riskPriority[a.risk];
  });

  return results;
}

// Export to window object for browser scripts
window.diagnoseEngine = {
  diagnose
};
