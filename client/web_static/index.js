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


// === Logs helper (console entries) ===
function addLog(message) {
  const logOutput = document.getElementById("logOutput");
  if (logOutput) {
    const timestamp = new Date().toLocaleTimeString();
    logOutput.textContent += `\n[${timestamp}] ${message}`;
    logOutput.scrollTop = logOutput.scrollHeight;
  }
}

// === Logs Pie Chart ===
let logsChart;
function updateLogs(imageURLPath, data) {
  // Add timestamped log entry
  addLog(`Image ${imageURLPath} = ${data.predicted_label} (Confidence: ${data.confidence.toFixed(4)})`);

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

  if (logsChart) logsChart.destroy();
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

// === Detection logic (connects everything) ===
function checkImage(imageFullPath, imageURLPath) {
  fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageFullPath }),
  })
  .then(resp => resp.json())
  .then(data => {
    // Get the prediction label element
    const labelElement = document.getElementById("predicted-label-" + imageURLPath);
    labelElement.textContent = data.predicted_label || "Unknown";
    
    // Get the card and image elements
    const cardElement = document.querySelector(`img[src*="${imageURLPath}"]`)?.closest(".verax-card");
    const predictionBox = document.getElementById("outer-" + imageURLPath);
    
    // Color and glow the prediction text and border based on prediction
    if (data.predicted_label === "fake") {
      // RED for fake
      labelElement.style.color = "#ff0040";
      labelElement.style.textShadow = "0 0 12px #ff0040, 0 0 20px #ff0040, 0 0 30px #ff0040";
      
      if (cardElement) {
        cardElement.style.border = "2px solid #ff0040";
        cardElement.style.boxShadow = "0 0 15px #ff0040, 0 0 25px #ff0040, 0 0 35px #ff0040 inset";
      }
      
      if (predictionBox) {
        predictionBox.style.borderLeft = "4px solid #ff0040";
        predictionBox.style.boxShadow = "0 0 12px #ff0040 inset";
      }
    } else if (data.predicted_label === "real") {
      // GREEN for real
      labelElement.style.color = "#00ff80";
      labelElement.style.textShadow = "0 0 12px #00ff80, 0 0 20px #00ff80, 0 0 30px #00ff80";
      
      if (cardElement) {
        cardElement.style.border = "2px solid #00ff80";
        cardElement.style.boxShadow = "0 0 15px #00ff80, 0 0 25px #00ff80, 0 0 35px #00ff80 inset";
      }
      
      if (predictionBox) {
        predictionBox.style.borderLeft = "4px solid #00ff80";
        predictionBox.style.boxShadow = "0 0 12px #00ff80 inset";
      }
    }
    
    document.getElementById("confidence-" + imageURLPath).textContent =
      data.confidence ? data.confidence.toFixed(4) : "N/A";
    document.getElementById("fake-prob-" + imageURLPath).textContent =
      data.fake_probability ? data.fake_probability.toFixed(4) : "N/A";
    document.getElementById("real-prob-" + imageURLPath).textContent =
      data.real_probability ? data.real_probability.toFixed(4) : "N/A";

    const bar = document.getElementById("confidence-fill-" + imageURLPath);
    if (bar && data.confidence !== undefined) {
      bar.style.width = (data.confidence * 100).toFixed(2) + "%";
      
      // Match bar color to prediction
      if (data.predicted_label === "fake") {
        bar.style.background = "linear-gradient(90deg, #ff0040, #ff0040)";
        bar.style.boxShadow = "0 0 12px #ff0040";
      } else if (data.predicted_label === "real") {
        bar.style.background = "linear-gradient(90deg, #00ff80, #00ff80)";
        bar.style.boxShadow = "0 0 12px #00ff80";
      }
    }

    // Save result
    if (!window.veraxResults) window.veraxResults = {};
    window.veraxResults[imageURLPath] = data;

    // Update Logs + Analytics
    updateLogs(imageURLPath, data);
    updateAnalytics(imageURLPath, data);
  })
  .catch(err => {
    addLog(`Detection error for ${imageURLPath}: ${err?.message || err}`);
  });
}
