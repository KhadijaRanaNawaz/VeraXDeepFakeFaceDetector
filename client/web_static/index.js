// Boot overlay auto-hide after animation
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const boot = document.getElementById("bootOverlay");
    if (boot) boot.style.display = "none";
  }, 4200);
});

// Overlay functions with panel-specific messages
function showOverlay(message = "Analyzing Core Systems...") {
  const overlay = document.getElementById("loadingOverlay");
  const text = overlay.querySelector(".overlay-text");
  if (text) text.textContent = message;
  overlay.style.display = "flex";
}
function hideOverlay(finalMessage = "Module Ready") {
  const overlay = document.getElementById("loadingOverlay");
  const text = overlay.querySelector(".overlay-text");
  if (text) text.textContent = finalMessage;
  setTimeout(() => { overlay.style.display = "none"; }, 800);
}

// Sidebar navigation (VS Code panel feel)
document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("data-target");
    if (!targetId) return;

    let message = "Switching Module...";
    let finalMessage = "Module Ready";

    if (targetId === "resultsPanel") {
      message = "Loading Detection Core...";
      finalMessage = "Results Ready";
    } else if (targetId === "analyticsPanel") {
      message = "Loading Analytics Core...";
      finalMessage = "Analytics Ready";
    } else if (targetId === "logsPanel") {
      message = "Loading Logs Console...";
      finalMessage = "Logs Ready";
    } else if (targetId === "featuresPanel") {
      message = "Loading Feature Modules...";
      finalMessage = "Features Ready";
    }

    showOverlay(message);
    setTimeout(() => {
      hideOverlay(finalMessage);
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add("active");
    }, 1100);
  });
});

// Logs helper (VS Code terminal feel)
function addLog(message) {
  const logOutput = document.getElementById("logOutput");
  if (logOutput) {
    const timestamp = new Date().toLocaleTimeString();
    logOutput.textContent += `\n[${timestamp}] ${message}`;
    logOutput.scrollTop = logOutput.scrollHeight;
  }
}

// === Logs Pie Chart ===
let logsChart; // global chart instance

function updateLogs(imageURLPath, data) {
  // Add timestamped log entry
  addLog(`Image ${imageURLPath} = ${data.predicted_label} (Confidence: ${data.confidence.toFixed(4)})`);

  // Prepare pie chart data
  const ctx = document.getElementById("logsPieChart");
  if (!ctx) return;

  const chartData = {
    labels: ["Fake Probability", "Real Probability"],
    datasets: [{
      data: [
        data.fake_probability ? data.fake_probability * 100 : 0,
        data.real_probability ? data.real_probability * 100 : 0
      ],
      backgroundColor: ["#ff0040", "#00ff80"],
      borderColor: ["#fff", "#fff"],
      borderWidth: 2
    }]
  };

  // Destroy old chart if exists
  if (logsChart) logsChart.destroy();

  // Create new pie chart
  logsChart = new Chart(ctx, {
    type: "pie",
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: "#0ff", font: { family: "Orbitron", size: 14 } }
        },
        title: {
          display: true,
          text: `Detection Result for ${imageURLPath}`,
          color: "#f0f",
          font: { family: "Orbitron", size: 16 }
        }
      }
    }
  });
}

// === Analytics Bar Chart + Grid ===
let analyticsChart;

function updateAnalytics(imageURLPath, data) {
  // Prepare dataset
  if (!window.analyticsData) window.analyticsData = [];
  window.analyticsData.push({
    id: imageURLPath,
    label: data.predicted_label,
    confidence: data.confidence,
    fake: data.fake_probability,
    real: data.real_probability
  });

  // Update bar chart
  const ctx = document.getElementById("analyticsBarChart");
  if (ctx) {
    const labels = window.analyticsData.map(d => d.id);
    const confidences = window.analyticsData.map(d => (d.confidence * 100).toFixed(2));

    if (analyticsChart) analyticsChart.destroy();
    analyticsChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: "Confidence %",
          data: confidences,
          backgroundColor: "#0ff",
          borderColor: "#f0f",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#0ff", font: { family: "Orbitron", size: 14 } } },
          title: {
            display: true,
            text: "Detection Confidence per Image",
            color: "#f0f",
            font: { family: "Orbitron", size: 16 }
          }
        },
        scales: {
          x: { ticks: { color: "#f0f" }, grid: { color: "rgba(0,255,255,0.2)" } },
          y: { ticks: { color: "#f0f" }, grid: { color: "rgba(240,0,255,0.2)" }, min: 0, max: 100 }
        }
      }
    });
  }

  // Update grid table
  const tbody = document.querySelector("#analyticsGrid tbody");
  if (tbody) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${imageURLPath}</td>
      <td>${data.predicted_label}</td>
      <td>${(data.confidence * 100).toFixed(2)}%</td>
      <td>${(data.fake_probability * 100).toFixed(2)}%</td>
      <td>${(data.real_probability * 100).toFixed(2)}%</td>
    `;
    tbody.appendChild(row);
  }
}

// === Detection logic (extended to update all panels) ===
function checkImage(imageFullPath, imageURLPath) {
  fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageFullPath }),
  })
  .then(resp => resp.json())
  .then(data => {
    // Update prediction box
    const pred = document.getElementById("predicted-label-" + imageURLPath);
    const conf = document.getElementById("confidence-" + imageURLPath);
    const fake = document.getElementById("fake-prob-" + imageURLPath);
    const real = document.getElementById("real-prob-" + imageURLPath);
    const bar = document.getElementById("confidence-fill-" + imageURLPath);

    if (pred) pred.textContent = data.predicted_label || "Unknown";
    if (conf) conf.textContent = data.confidence ? data.confidence.toFixed(4) : "N/A";
    if (fake) fake.textContent = data.fake_probability ? data.fake_probability.toFixed(4) : "N/A";
    if (real) real.textContent = data.real_probability ? data.real_probability.toFixed(4) : "N/A";
    if (bar && data.confidence !== undefined) {
      bar.style.width = (data.confidence * 100).toFixed(2) + "%";
    }

    // Persist result for potential exports
    if (!window.veraxResults) window.veraxResults = {};
    window.veraxResults[imageURLPath] = data;

    // Update Logs and Analytics
    updateLogs(imageURLPath, data);
    updateAnalytics(imageURLPath, data);
  })
  .catch(err => {
    addLog(`Detection error for ${imageURLPath}: ${err?.message || err}`);
  });
}

// Auto-trigger detection for all images (optional, heavy — keep commented for demo control)
// window.addEventListener("load", () => {
//   {% for image in image_list %}
//   checkImage("{{ image.image_full_path }}", "{{ image.image_url }}");
//   {% endfor %}
// });

// Static demo accuracy chart (your original)
window.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("accuracyChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Run 1","Run 2","Run 3","Run 4","Run 5"],
      datasets: [{
        label: "Accuracy %",
        data: [98.5, 99.1, 99.5, 99.8, 99.95],
        borderColor: "#0ff",
        backgroundColor: "rgba(0,255,255,0.15)",
        tension: 0.35,
        pointBackgroundColor: "#f0f",
        pointBorderColor: "#0ff",
        pointRadius: 5,
        pointHoverRadius: 9,
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: "#0ff", font: { family: "Orbitron", size: 13 } } }
      },
      scales: {
        x: { ticks: { color: "#f0f" }, grid: { color: "rgba(0,255,255,0.12)" } },
        y: { min: 95, max: 100, ticks: { color: "#f0f" }, grid: { color: "rgba(240,0,255,0.12)" } }
      }
    }
  });
});

