document.addEventListener("DOMContentLoaded", () => {
    const numMachinesInput = document.getElementById("num_machines");
    const machineInputsDiv = document.getElementById("machine_inputs");
    const optimizeButton = document.getElementById("optimize_btn");
    const resultsDiv = document.getElementById("results");

    numMachinesInput.addEventListener("input", () => {
        machineInputsDiv.innerHTML = "";
        const n = parseInt(numMachinesInput.value);
        if (isNaN(n) || n <= 0) return;

        for (let i = 0; i < n; i++) {
            machineInputsDiv.innerHTML += `
                <div class="form-group">
                    <label>Machine ${i + 1} Fuel Limit (liters):</label>
                    <input type="number" id="machine_${i}_fuel_limit" required>
                    <label>Machine ${i + 1} Fuel Price (₹/liter):</label>
                    <input type="number" id="machine_${i}_fuel_price" required>
                </div>`;
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

        const fuelLimits = [];
        const fuelPrices = [];
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
            let html = `<strong>Results:</strong><br>`;
            for (const machine in data.results) {
                const m = data.results[machine];
                html += `${machine}: Fuel = ${m.fuel_allocated} L, Cost = ₹${m.cost}<br>`;
            }
            html += `<br><strong>Total Fuel Used:</strong> ${data.total_fuel_used} liters<br>`;
            html += `<strong>Total Cost:</strong> ₹${data.total_cost}`;
            resultsDiv.innerHTML = html;
            resultsDiv.style.display = "block";
        })
        .catch(err => {
            console.error("Error:", err);
            alert("An error occurred. Please try again.");
        });
    });
});
