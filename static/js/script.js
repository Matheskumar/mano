document.addEventListener("DOMContentLoaded", () => {
  const numMachinesInput = document.getElementById("num_machines");
  const machineInputsDiv = document.getElementById("machine_inputs");
  const optimizeButton = document.getElementById("optimize_btn");
  const resetButton = document.getElementById("reset_btn");
  const resultsDiv = document.getElementById("results");

  numMachinesInput.addEventListener("input", () => {
    machineInputsDiv.innerHTML = "";
    const n = parseInt(numMachinesInput.value);
    if (isNaN(n) || n <= 0) return;

    for (let i = 0; i < n; i++) {
      const card = document.createElement("div");
      card.className = "machine-card";
      card.innerHTML = `
        <label>Machine ${i + 1} Fuel Limit (liters):</label>
        <input type="number" id="machine_${i}_fuel_limit" required>
        <label>Machine ${i + 1} Fuel Price (₹/liter):</label>
        <input type="number" id="machine_${i}_fuel_price" required>
      `;
      machineInputsDiv.appendChild(card);
    }
  });

  optimizeButton.addEventListener("click", () => {
    const n = parseInt(numMachinesInput.value);
    const D = parseFloat(document.getElementById("fuel_demand").value);
    const T = parseFloat(document.getElementById("total_fuel").value);

    if (!n || !D || !T) {
      alert("Please fill in all required fields.");
      return;
    }

    const fuelLimits = [], fuelPrices = [];
    for (let i = 0; i < n; i++) {
      const limit = parseFloat(document.getElementById(`machine_${i}_fuel_limit`).value);
      const price = parseFloat(document.getElementById(`machine_${i}_fuel_price`).value);
      if (!limit || !price) {
        alert(`Fill limit and price for Machine ${i + 1}`);
        return;
      }
      fuelLimits.push(limit);
      fuelPrices.push(price);
    }

    fetch('/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        num_machines: n,
        fuel_demand: D,
        total_fuel: T,
        fuel_limits: fuelLimits,
        fuel_prices: fuelPrices
      })
    })
    .then(res => res.json())
    .then(data => {
      let html = `<h3>Optimization Results</h3><ul>`;
      for (const [machine, result] of Object.entries(data.results)) {
        html += `<li><strong>${machine}</strong>: Fuel = ${result.fuel_allocated} L, Cost = ₹${result.cost}</li>`;
      }
      html += `</ul><p><strong>Total Fuel Used:</strong> ${data.total_fuel_used} liters<br>
      <strong>Total Cost:</strong> ₹${data.total_cost}</p>`;
      resultsDiv.innerHTML = html;
      resultsDiv.style.display = "block";
    });
  });

  resetButton.addEventListener("click", () => {
    document.getElementById("num_machines").value = '';
    document.getElementById("fuel_demand").value = '';
    document.getElementById("total_fuel").value = '';
    machineInputsDiv.innerHTML = '';
    resultsDiv.innerHTML = '';
    resultsDiv.style.display = "none";
  });
});
