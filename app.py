from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from pulp import LpProblem, LpVariable, lpSum, LpMinimize

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/optimize', methods=['POST'])
def optimize():
    data = request.get_json()
    n = data['num_machines']
    D = data['fuel_demand']
    T = data['total_fuel']
    fuel_limits = data['fuel_limits']
    fuel_prices = data['fuel_prices']

    prob = LpProblem("Fuel_Cost_Minimization", LpMinimize)
    F = [LpVariable(f"F_{i}", lowBound=0, upBound=fuel_limits[i]) for i in range(n)]

    prob += lpSum([F[i] * fuel_prices[i] for i in range(n)])
    prob += lpSum(F) >= D
    prob += lpSum(F) <= T
    prob.solve()

    results = {}
    total_cost = 0
    total_fuel_used = 0
    for i in range(n):
        allocated = F[i].varValue or 0
        cost = allocated * fuel_prices[i]
        results[f"Machine {i+1}"] = {
            "fuel_allocated": round(allocated, 2),
            "cost": round(cost, 2)
        }
        total_fuel_used += allocated
        total_cost += cost

    return jsonify({
        "results": results,
        "total_fuel_used": round(total_fuel_used, 2),
        "total_cost": round(total_cost, 2)
    })

if __name__ == '__main__':
    app.run(debug=True)
