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

// Original detection logic preserved
function checkImage(imageFullPath, imageURLPath) {
  fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageFullPath }),
  })
  .then(resp => resp.json())
  .then(data => {
    document.getElementById("predicted-label-" + imageURLPath).textContent =
      data.predicted_label || "Unknown";
    document.getElementById("confidence-" + imageURLPath).textContent =
      data.confidence ? data.confidence.toFixed(4) : "N/A";
    document.getElementById("fake-prob-" + imageURLPath).textContent =
      data.fake_probability ? data.fake_probability.toFixed(4) : "N/A";
    document.getElementById("real-prob-" + imageURLPath).textContent =
      data.real_probability ? data.real_probability.toFixed(4) : "N/A";

    const bar = document.getElementById("confidence-fill-" + imageURLPath);
    if (bar && data.confidence !== undefined) {
      bar.style.width = (data.confidence * 100).toFixed(2) + "%";
    }

    // Save result for Logs/Analytics later
    if (!window.veraxResults) window.veraxResults = {};
    window.veraxResults[imageURLPath] = data;
  });
}
// === Logs Pie Chart ===
let logsChart; // global chart instance

function updateLogs(imageURLPath, data) {
  // Add timestamped log entry
  addLog(`Image ${imageURLPath} → ${data.predicted_label} (Confidence: ${data.confidence.toFixed(4)})`);

  // Prepare pie chart data
  const ctx = document.getElementById("logsPieChart");
  if (!ctx) return;

  const chartData = {
    labels: ["Fake Probability", "Real Probability"],
    datasets: [{
      data: [
        data.fake_probability ? data.fake_probability.toFixed(4) * 100 : 0,
        data.real_probability ? data.real_probability.toFixed(4) * 100 : 0
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
updateLogs(imageURLPath, data);

// Auto-trigger detection for all images (keeps your 1090 flow; heavy but cinematic)
window.addEventListener("load", () => {
  // The template loop ensures we call checkImage for each item in image_list
  // This block must remain inside a Jinja/Flask template to render correctly:
  // {% for image in image_list %}
  // checkImage("{{ image.image_full_path }}", "{{ image.image_url }}");
  // {% endfor %}
});

// Analytics chart (VS Code glow)
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

// Logs helper (VS Code terminal feel)
function addLog(message) {
  const logOutput = document.getElementById("logOutput");
  if (logOutput) {
    const timestamp = new Date().toLocaleTimeString();
    logOutput.textContent += `\n[${timestamp}] ${message}`;
    logOutput.scrollTop = logOutput.scrollHeight;
  }
}
