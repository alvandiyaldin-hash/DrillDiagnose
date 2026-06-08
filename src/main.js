// DrillDiagnose Application Controller

document.addEventListener("DOMContentLoaded", () => {
  // --- State Variables ---
  let selectedSymptomIds = [];
  let currentActiveView = "home";

  // --- DOM Elements ---
  const views = {
    home: document.getElementById("view-home"),
    diagnosis: document.getElementById("view-diagnosis"),
    results: document.getElementById("view-results"),
    kb: document.getElementById("view-kb")
  };

  const navLinks = {
    logo: document.getElementById("nav-logo"),
    home: document.getElementById("link-home"),
    diagnosis: document.getElementById("link-diagnosis"),
    kb: document.getElementById("link-kb")
  };

  const btnStartDiagnosis = document.getElementById("btn-start-diagnosis");
  const btnAnalyzeSymptoms = document.getElementById("btn-analyze-symptoms");
  const btnClearAllSymptoms = document.getElementById("btn-clear-all-symptoms");
  const btnBackToDiagnosis = document.getElementById("btn-back-to-diagnosis");
  const btnResetDiagnosis = document.getElementById("btn-reset-diagnosis");
  
  const symptomsContainer = document.getElementById("symptoms-group-container");
  const activeSymptomCounter = document.getElementById("active-symptom-counter").querySelector("span");
  
  const resultsSelectedSymptoms = document.getElementById("results-selected-symptoms");
  const topDiagnosesContainer = document.getElementById("top-diagnoses-cards-container");
  const otherDiagnosesSection = document.getElementById("other-diagnoses-section");
  const otherDiagnosesListContainer = document.getElementById("other-diagnoses-list-container");

  const kbProblemsMenu = document.getElementById("kb-problems-menu");
  const kbContentDisplay = document.getElementById("kb-content-display");

  // --- View Router / Switcher ---
  function switchView(viewName) {
    if (!views[viewName]) return;

    // Update visibility of views
    Object.keys(views).forEach(key => {
      if (key === viewName) {
        views[key].classList.remove("hidden");
      } else {
        views[key].classList.add("hidden");
      }
    });

    // Update active class on nav links
    Object.keys(navLinks).forEach(key => {
      if (key === "logo") return;
      if (key === viewName) {
        navLinks[key].classList.add("active");
      } else {
        navLinks[key].classList.remove("active");
      }
    });

    currentActiveView = viewName;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Bind Nav Links
  navLinks.logo.addEventListener("click", (e) => { e.preventDefault(); switchView("home"); });
  navLinks.home.addEventListener("click", (e) => { e.preventDefault(); switchView("home"); });
  navLinks.diagnosis.addEventListener("click", (e) => { e.preventDefault(); switchView("diagnosis"); });
  navLinks.kb.addEventListener("click", (e) => { e.preventDefault(); switchView("kb"); });
  btnStartDiagnosis.addEventListener("click", () => switchView("diagnosis"));

  // --- Dynamic Symptoms Builder ---
  function initSymptomSelection() {
    symptomsContainer.innerHTML = "";
    
    window.SYMPTOMS_DATABASE.forEach(categoryObj => {
      const categoryCard = document.createElement("div");
      categoryCard.className = "symptom-category-card";

      // Header
      const header = document.createElement("div");
      header.className = "category-header";
      header.innerHTML = `
        <h3>${categoryObj.category}</h3>
        <span class="category-meta">${categoryObj.symptoms.length} Parameters</span>
      `;
      categoryCard.appendChild(header);

      // Grid
      const grid = document.createElement("div");
      grid.className = "category-grid";

      categoryObj.symptoms.forEach(symptom => {
        const item = document.createElement("label");
        item.className = "checkbox-item";
        item.setAttribute("for", `chk-${symptom.id}`);

        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = `chk-${symptom.id}`;
        input.value = symptom.id;
        
        // Restore check state if it was already selected
        if (selectedSymptomIds.includes(symptom.id)) {
          input.checked = true;
          item.classList.add("checked");
        }

        const customCheck = document.createElement("span");
        customCheck.className = "custom-checkbox";

        const labelSpan = document.createElement("span");
        labelSpan.className = "symptom-label";
        labelSpan.textContent = symptom.name;

        // Event listener
        input.addEventListener("change", (e) => {
          if (e.target.checked) {
            if (!selectedSymptomIds.includes(symptom.id)) {
              selectedSymptomIds.push(symptom.id);
            }
            item.classList.add("checked");
          } else {
            selectedSymptomIds = selectedSymptomIds.filter(id => id !== symptom.id);
            item.classList.remove("checked");
          }
          updateSymptomControls();
        });

        item.appendChild(input);
        item.appendChild(customCheck);
        item.appendChild(labelSpan);
        grid.appendChild(item);
      });

      categoryCard.appendChild(grid);
      symptomsContainer.appendChild(categoryCard);
    });

    updateSymptomControls();
  }

  function updateSymptomControls() {
    const count = selectedSymptomIds.length;
    activeSymptomCounter.textContent = count;
    
    // Enable/Disable analyze button
    btnAnalyzeSymptoms.disabled = (count === 0);
  }

  // Clear Selection
  btnClearAllSymptoms.addEventListener("click", () => {
    selectedSymptomIds = [];
    // Uncheck all rendered inputs
    const checkboxes = symptomsContainer.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(cb => {
      cb.checked = false;
      cb.closest(".checkbox-item").classList.remove("checked");
    });
    updateSymptomControls();
  });

  // --- Run Diagnosis & Render Results ---
  btnAnalyzeSymptoms.addEventListener("click", () => {
    if (selectedSymptomIds.length === 0) return;
    
    const problems = window.PROBLEMS_DATABASE;
    const diagnoses = window.diagnoseEngine.diagnose(selectedSymptomIds, problems);

    renderResults(diagnoses);
    switchView("results");
  });

  // Get symptom name by ID helper
  function getSymptomName(id) {
    for (const group of window.SYMPTOMS_DATABASE) {
      const match = group.symptoms.find(s => s.id === id);
      if (match) return match.name;
    }
    return id;
  }

  function renderResults(diagnoses) {
    // 1. Render Selected Symptoms Summary
    resultsSelectedSymptoms.innerHTML = "";
    selectedSymptomIds.forEach(id => {
      const badge = document.createElement("span");
      badge.className = "symptom-badge";
      badge.textContent = getSymptomName(id);
      resultsSelectedSymptoms.appendChild(badge);
    });

    // 2. Render Top 3 Diagnoses
    topDiagnosesContainer.innerHTML = "";
    
    // Grab the top 3 diagnoses. Filter out items with 0% score?
    // Let's show the top 3 even if scores are low, but we'll flag confidence levels clearly.
    const top3 = diagnoses.slice(0, 3);
    
    if (top3.length === 0 || top3[0].score === 0) {
      // Show an empty/no-match warning if no problems have any match score > 0
      topDiagnosesContainer.innerHTML = `
        <div class="empty-diagnostic-alert">
          <div class="alert-icon-warning">!</div>
          <h4>No Diagnostic Match</h4>
          <p>The selected symptoms do not match any recognized drilling problem signatures in our engineering database.</p>
          <button class="btn btn-primary" id="btn-alert-back">Adjust Symptoms</button>
        </div>
      `;
      document.getElementById("btn-alert-back").addEventListener("click", () => switchView("diagnosis"));
      otherDiagnosesSection.classList.add("hidden");
      return;
    }

    top3.forEach((diag, index) => {
      const card = document.createElement("div");
      card.className = "diagnosis-result-card";
      
      // Risk Badge Style
      const riskClass = `badge-risk-${diag.risk.toLowerCase()}`;
      // Confidence Badge Style
      const confClass = `badge-conf-${diag.confidence.toLowerCase()}`;

      // Build symptom audit list
      // Check which of this problem's required symptoms are present in selection
      let symptomsHTML = "";
      diag.symptoms.forEach(symId => {
        const name = getSymptomName(symId);
        const isMatched = diag.matchedIds.includes(symId);
        if (isMatched) {
          symptomsHTML += `
            <div class="checklist-item matched">
              <span class="checklist-icon">✓</span>
              <span>${name}</span>
            </div>
          `;
        } else {
          symptomsHTML += `
            <div class="checklist-item missing">
              <span class="checklist-icon">✗</span>
              <span>${name}</span>
            </div>
          `;
        }
      });

      card.innerHTML = `
        <div class="diagnosis-rank">Rank #${index + 1}</div>
        
        <div class="diagnosis-header-layout">
          <!-- Dial -->
          <div class="match-score-radial" style="--percentage: ${diag.score}">
            <div class="score-inner-text">
              <div class="score-value">${diag.score}%</div>
              <div class="score-label">Match</div>
            </div>
          </div>
          
          <!-- Core Title and Badges -->
          <div class="diagnosis-core-info">
            <h4>${diag.name}</h4>
            <div class="badge-row">
              <span class="badge ${riskClass}">${diag.risk} Risk</span>
              <span class="badge ${confClass}">${diag.confidence} Confidence</span>
            </div>
          </div>
        </div>

        <div class="diagnosis-body">
          <div class="diagnostic-lists-section">
            <p class="diagnosis-desc">${diag.description}</p>
            
            <div class="grid-lists" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
              <div>
                <h5 class="detail-section-title">Possible Causes</h5>
                <ul class="detail-list">
                  ${diag.causes.map(c => `<li>${c}</li>`).join("")}
                </ul>
              </div>
              
              <div>
                <h5 class="detail-section-title">Recommended Actions</h5>
                <ol class="detail-list" style="list-style-type: decimal;">
                  ${diag.actions.map(a => `<li>${a}</li>`).join("")}
                </ol>
              </div>
            </div>
          </div>

          <!-- Side Symptom Matching Panel -->
          <div class="symptoms-comparison-box">
            <h5 class="detail-section-title" style="margin-bottom: 1rem;">Symptom Checklist</h5>
            <div class="symptoms-checklist">
              ${symptomsHTML}
            </div>
          </div>
        </div>
      `;

      topDiagnosesContainer.appendChild(card);
    });

    // 3. Render Secondary Matches (other diagnoses with score > 0)
    const otherMatches = diagnoses.slice(3).filter(diag => diag.score > 0);
    
    if (otherMatches.length > 0) {
      otherDiagnosesSection.classList.remove("hidden");
      otherDiagnosesListContainer.innerHTML = "";

      otherMatches.forEach(diag => {
        const item = document.createElement("div");
        item.className = "other-diagnosis-item";

        const riskClass = `badge-risk-${diag.risk.toLowerCase()}`;
        const confClass = `badge-conf-${diag.confidence.toLowerCase()}`;

        let itemSymptomsHTML = "";
        diag.symptoms.forEach(symId => {
          const name = getSymptomName(symId);
          const isMatched = diag.matchedIds.includes(symId);
          itemSymptomsHTML += `
            <div class="checklist-item ${isMatched ? 'matched' : 'missing'}">
              <span class="checklist-icon">${isMatched ? '✓' : '✗'}</span>
              <span>${name}</span>
            </div>
          `;
        });

        // Set layout with a collapsible drawer
        item.innerHTML = `
          <div style="width: 100%;">
            <div class="other-diag-summary" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
              <div class="other-diag-info">
                <div class="other-diag-score">${diag.score}%</div>
                <div class="other-diag-name">${diag.name}</div>
              </div>
              <div class="other-diag-meta">
                <span class="badge ${riskClass}">${diag.risk} Risk</span>
                <span class="badge ${confClass}">${diag.confidence}</span>
                <div class="chevron-icon"></div>
              </div>
            </div>
            
            <!-- Collapsible Detail Drawer -->
            <div class="other-diag-drawer hidden" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; animation: fadeIn 0.2s ease;">
              <div>
                <p class="diagnosis-desc" style="margin-bottom: 1.5rem;">${diag.description}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                  <div>
                    <h5 class="detail-section-title">Possible Causes</h5>
                    <ul class="detail-list">
                      ${diag.causes.map(c => `<li>${c}</li>`).join("")}
                    </ul>
                  </div>
                  <div>
                    <h5 class="detail-section-title">Recommended Actions</h5>
                    <ol class="detail-list" style="list-style-type: decimal;">
                      ${diag.actions.map(a => `<li>${a}</li>`).join("")}
                    </ol>
                  </div>
                </div>
              </div>
              <div class="symptoms-comparison-box" style="margin-top: 0;">
                <h5 class="detail-section-title" style="margin-bottom: 1rem;">Symptom Checklist</h5>
                <div class="symptoms-checklist">
                  ${itemSymptomsHTML}
                </div>
              </div>
            </div>
          </div>
        `;

        // Handle toggle collapse click
        const summaryDiv = item.querySelector(".other-diag-summary");
        const drawerDiv = item.querySelector(".other-diag-drawer");
        const chevron = item.querySelector(".chevron-icon");

        summaryDiv.addEventListener("click", () => {
          const isHidden = drawerDiv.classList.contains("hidden");
          if (isHidden) {
            drawerDiv.classList.remove("hidden");
            chevron.style.transform = "rotate(45deg)"; // point up
            item.style.backgroundColor = "var(--bg-card-hover)";
          } else {
            drawerDiv.classList.add("hidden");
            chevron.style.transform = "rotate(-45deg)"; // point down
            item.style.backgroundColor = "var(--bg-card)";
          }
        });

        otherDiagnosesListContainer.appendChild(item);
      });
    } else {
      otherDiagnosesSection.classList.add("hidden");
    }
  }

  // Modify / Back to selection
  btnBackToDiagnosis.addEventListener("click", () => {
    switchView("diagnosis");
  });

  // Reset diagnosis
  btnResetDiagnosis.addEventListener("click", () => {
    selectedSymptomIds = [];
    initSymptomSelection();
    switchView("diagnosis");
  });

  // --- Knowledge Base Handler ---
  function initKnowledgeBase() {
    kbProblemsMenu.innerHTML = "";
    
    window.PROBLEMS_DATABASE.forEach((prob, index) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.className = "kb-menu-btn";
      button.textContent = prob.name;
      
      // Risk dot style helper
      const dotColor = prob.risk === "High" ? "var(--risk-high)" : (prob.risk === "Medium" ? "var(--risk-medium)" : "var(--risk-low)");
      button.style.borderLeft = `3px solid ${dotColor}`;
      
      if (index === 0) {
        button.classList.add("active");
        renderKbProblemDetail(prob);
      }

      button.addEventListener("click", () => {
        // Toggle active menu class
        kbProblemsMenu.querySelectorAll(".kb-menu-btn").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        renderKbProblemDetail(prob);
      });

      li.appendChild(button);
      kbProblemsMenu.appendChild(li);
    });
  }

  function renderKbProblemDetail(prob) {
    const riskClass = `badge-risk-${prob.risk.toLowerCase()}`;
    
    // Map symptom names
    const symptomsHTML = prob.symptoms.map(symId => {
      const name = getSymptomName(symId);
      return `<span class="symptom-badge" style="margin-bottom: 0.25rem;">${name}</span>`;
    }).join("");

    kbContentDisplay.innerHTML = `
      <div class="kb-header">
        <div class="kb-header-top">
          <h3>${prob.name}</h3>
          <span class="badge ${riskClass}">${prob.risk} Risk</span>
        </div>
        <p class="kb-desc">${prob.description}</p>
      </div>

      <div class="kb-details-grid">
        <div class="diagnostic-lists-section">
          <div>
            <h5 class="detail-section-title">Possible Causes</h5>
            <ul class="detail-list">
              ${prob.causes.map(c => `<li>${c}</li>`).join("")}
            </ul>
          </div>
          
          <div style="margin-top: 1rem;">
            <h5 class="detail-section-title">Recommended Actions</h5>
            <ol class="detail-list" style="list-style-type: decimal;">
              ${prob.actions.map(a => `<li>${a}</li>`).join("")}
            </ol>
          </div>
        </div>

        <div>
          <h5 class="detail-section-title">Associated Symptoms Signature</h5>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
            ${symptomsHTML}
          </div>
        </div>
      </div>
    `;
  }

  // --- App Initialization ---
  function init() {
    initSymptomSelection();
    initKnowledgeBase();
    switchView("home");
  }

  init();
});
