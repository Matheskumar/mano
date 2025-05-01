from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from pulp import LpProblem, LpVariable, lpSum, LpMinimize

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/optimize', methods=['POST'])
def optimize_fuel():
    data = request.get_json()

    n = data['num_machines']
    D = data['fuel_demand']
    T = data['total_fuel']
    fuel_limits = data['fuel_limits']
    fuel_prices = data['fuel_prices']

    prob = LpProblem("Fuel_Cost_Minimization", LpMinimize)
    F = [LpVariable(f"F_{i}", lowBound=0, upBound=fuel_limits[i]) for i in range(n)]
    prob += lpSum([F[i] * fuel_prices[i] for i in range(n)]), "Total_Fuel_Cost"
    prob += lpSum([F[i] for i in range(n)]) >= D, "Meet_Demand"
    prob += lpSum([F[i] for i in range(n)]) <= T, "Total_Fuel_Limit"

    prob.solve()

    results = {}
    total_cost = 0
    total_fuel_used = 0
    for i in range(n):
        fuel_allocated = F[i].varValue or 0
        cost = fuel_allocated * fuel_prices[i]
        results[f"Machine_{i + 1}"] = {
            "fuel_allocated": round(fuel_allocated, 2),
            "cost": round(cost, 2)
        }
        total_fuel_used += fuel_allocated
        total_cost += cost

    return jsonify({
        "results": results,
        "total_fuel_used": round(total_fuel_used, 2),
        "total_cost": round(total_cost, 2)
    })

if __name__ == '__main__':
    app.run(debug=True)
