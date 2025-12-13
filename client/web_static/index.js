// ... (Keep the checkImage function unchanged) ...

function checkImage(imageFullPath, imageURLPath) {
  fetch("/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageFullPath }),
  })
    .then((response) => response.json())
    .then((data) => {
      const checkIcon = document.getElementById("check-" + imageURLPath);
      const crossIcon = document.getElementById("cross-" + imageURLPath);
      const outerDiv = document.getElementById("outer-" + imageURLPath);
      const predictionDiv = document.getElementById(
        "prediction-info-" + imageURLPath
      );

      // Update prediction info
      document.getElementById("predicted-label-" + imageURLPath).textContent =
        data.predicted_label || "Unknown";
      document.getElementById("confidence-" + imageURLPath).textContent =
        data.confidence ? data.confidence.toFixed(4) : "N/A";
      document.getElementById("fake-prob-" + imageURLPath).textContent =
        data.fake_probability ? data.fake_probability.toFixed(4) : "N/A";
      document.getElementById("real-prob-" + imageURLPath).textContent =
        data.real_probability ? data.real_probability.toFixed(4) : "N/A";

      outerDiv.style.visibility = "visible";
      predictionDiv.style.display = "block";
      // data.is_fake is true for FAKE images, false for REAL images
      checkIcon.style.display = data.is_fake ? "none" : "inline"; // Show check for REAL
      crossIcon.style.display = data.is_fake ? "inline" : "none"; // Show cross for FAKE

      outerDiv.style.display = "flex";
    });
}
