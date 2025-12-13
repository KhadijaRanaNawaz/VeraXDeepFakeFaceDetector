// === ORIGINAL checkImage FUNCTION KEPT ===
function checkImage(imageFullPath, imageURLPath) {
  showOverlay("Analyzing Core Image...");
  fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageFullPath }),
  })
    .then((response) => response.json())
    .then((data) => {
      hideOverlay("Analysis Complete");

      const checkIcon = document.getElementById("check-" + imageURLPath);
      const crossIcon = document.getElementById("cross-" + imageURLPath);
      const outerDiv = document.getElementById("outer-" + imageURLPath);
      const predictionDiv = document.getElementById("prediction-info-" + imageURLPath);

      // Update prediction info
      document.getElementById("predicted-label-" + imageURLPath).textContent =
        data.predicted_label || "Unknown";
      document.getElementById("confidence-" + imageURLPath).textContent =
        data.confidence ? data.confidence.toFixed(4) : "N/A";
      document.getElementById("fake-prob-" + imageURLPath).textContent =
        data.fake_probability ? data.fake_probability.toFixed(4) : "N/A";
      document.getElementById("real-prob-" + imageURLPath).textContent =
        data.real_probability ? data.real_probability.toFixed(4) : "N/A";

      // Confidence bar fill
      const bar = document.getElementById("confidence-fill-" + imageURLPath);
      if (bar) bar.style.width = (data.confidence * 100).toFixed(2) + "%";

      // Confidence dial fill
      const circle = document.getElementById("confidence-circle-" + imageURLPath);
      if (circle) {
        const offset = 282 - (data.confidence * 282);
        circle.style.strokeDashoffset = offset;
      }

      outerDiv.style.visibility = "visible";
      predictionDiv.style.display = "block";
      checkIcon.style.display = data.is_fake ? "none" : "inline";
      crossIcon.style.display = data.is_fake ? "inline" : "none";
      outerDiv.style.display = "flex";
    });
}

// === Overlay Functions ===
function showOverlay(message="Analyzing Core Systems...") {
  const overlay = document.getElementById("loadingOverlay");
  const text = overlay.querySelector(".overlay-text");
  text.textContent = message;
  overlay.style.display = "flex";
}
function hideOverlay(finalMessage="Ready for Deployment") {
  const overlay = document.getElementById("loadingOverlay");
  const text = overlay.querySelector(".overlay-text");
  text.textContent = finalMessage;
  setTimeout(() => { overlay.style.display = "none"; }, 800);
}

// === Sidebar Navigation with Unique Messages ===
document.querySelectorAll(".sidebar a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = link.textContent.trim().toLowerCase();

    let message = "Switching Module...";
    let finalMessage = "Module Ready";

    if (target === "results") {
      message = "Loading Detection Core...";
      finalMessage = "Results Ready";
    } else if (target === "analytics") {
      message = "Loading Analytics Core...";
      finalMessage = "Analytics Ready";
    } else if (target === "logs") {
      message = "Loading Logs Console...";
      finalMessage = "Logs Ready";
    }

    showOverlay(message);
    setTimeout(() => {
      hideOverlay(finalMessage);
      document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
      if (target === "results") document.getElementById("resultsPanel").classList.add("active");
      else if (target === "analytics") document.getElementById("analyticsPanel").classList.add("active");
      else if (target === "logs") document.getElementById("logsPanel").classList.add("active");
    }, 1200);
  });
});

// === Analytics Chart ===
window.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("accuracyChart");
  if (ctx) {
    new Chart(ctx, {
      type: "line",
      data: {
        labels: ["Run 1","Run 2","Run 3","Run 4"],
        datasets: [{
          label: "Accuracy %",
          data: [98.5, 99.1, 99.5, 99.99],
          borderColor: "#0ff",
          backgroundColor: "rgba(0,255,255,0.2)",
          tension: 0.4,
          pointBackgroundColor: "#f0f",
          pointBorderColor: "#0ff",
          pointRadius: 6,
          pointHoverRadius: 10,
        }]
      },
      options: {
        plugins: {
          legend: {
            labels: { color: "#0ff", font: { size: 14, family: "Orbitron" } }
          }
        },
        scales: {
          x: { ticks: { color: "#f0f" }, grid: { color: "rgba(0,255,255,0.2)" } },
          y: { min: 95, max: 100, ticks: { color: "#f0f" }, grid: { color: "rgba(255,0,255,0.2)" } }
        }
      }
    });
  }
});

// === Logs Auto-Update ===
function addLog(message) {
  const logOutput = document.getElementById("logOutput");
  if (logOutput) {
    const timestamp = new Date().toLocaleTimeString();
    logOutput.textContent += `\n[${timestamp}] ${message}`;
    logOutput.scrollTop = logOutput.scrollHeight;
  }
}
