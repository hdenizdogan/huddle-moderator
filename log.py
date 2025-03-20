from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/log_overdue_speaker', methods=['POST'])
def log_overdue_speaker():
    data = request.get_json()
    name = data['name']
    overdue_time = data['overdueTime']
    with open('overdue_speakers.txt', 'a') as f:
        f.write(f"{name} exceeded time by {-overdue_time} seconds\n")
    return jsonify({"message": "Logged successfully"}), 200

if __name__ == '__main__':
    app.run(debug=True)