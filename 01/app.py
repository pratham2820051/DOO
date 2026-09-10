from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

TOTAL_QUESTIONS = 23
MAX_SCORE = TOTAL_QUESTIONS * 4  # 92

# ── Age-specific 2SD cutoffs for overall PQCVI score ─────────────────────────
OVERALL_CUTOFFS = {
    "3-4 years": 59.87,
    "4-5 years": 75.84,
    "5-6 years": 73.70,
}

# ── Stream definitions ────────────────────────────────────────────────────────
# Each stream is a dict with:
#   questions : list of question numbers (1-indexed)
#   cutoffs   : age-group → 2SD cutoff for the stream TOTAL
#   label     : display name
#
# To add a new stream (e.g. Dorsal), just append a new entry here.
STREAMS = [
    {
        "key":       "ventral",
        "label":     "Ventral-stream Function",
        "questions": [1, 4, 5, 10, 11, 13, 19, 20, 21],
        "cutoffs": {
            "3-4 years": 21.54,
            "4-5 years": 25.32,
            "5-6 years": 28.00,
        },
    },
    {
        "key":       "dorsal",
        "label":     "Dorsal-stream Function",
        "questions": [2, 3, 6, 7, 8, 9, 12, 14, 15, 16, 17, 18, 22, 23],
        "cutoffs": {
            "3-4 years": 36.28,
            "4-5 years": 48.67,
            "5-6 years": 44.37,
        },
    },
    # ── Add more streams below, e.g.:
    # {
    #     "key":       "another_stream",
    #     "label":     "Another Stream",
    #     "questions": [Q numbers...],
    #     "cutoffs":   { "3-4 years": X, "4-5 years": X, "5-6 years": X },
    # },
]


def get_age_group(age: float):
    if 3.0 <= age < 4.0:
        return "3-4 years"
    elif 4.0 <= age < 5.0:
        return "4-5 years"
    elif 5.0 <= age <= 6.0:
        return "5-6 years"
    return None


def score_stream(stream: dict, answers: dict, age_group: str) -> dict:
    """
    Calculate total, average, cutoff and result for one stream.
    answers : {q1: int, q2: int, ...}  (all 23 answers already validated)
    """
    qs = stream["questions"]
    total   = sum(answers[f"q{q}"] for q in qs)
    maximum = len(qs) * 4
    average = round(total / len(qs), 2)
    cutoff  = stream["cutoffs"][age_group]
    result  = "ISSUE DETECTED" if total >= cutoff else "NO ISSUE"

    return {
        f"{stream['key']}_label":    stream["label"],
        f"{stream['key']}_questions": qs,
        f"{stream['key']}_total":    total,
        f"{stream['key']}_maximum":  maximum,
        f"{stream['key']}_average":  average,
        f"{stream['key']}_cutoff":   cutoff,
        f"{stream['key']}_result":   result,
    }


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/submit", methods=["POST"])
def submit():
    data = request.get_json(force=True)

    # ── Validate age ─────────────────────────────────────────────────────────
    try:
        age = float(data.get("age", ""))
    except (TypeError, ValueError):
        return jsonify({"error": "Please enter a valid age."}), 400

    age_group = get_age_group(age)
    if age_group is None:
        return jsonify({"error": "Age must be between 3 and 6 years (inclusive)."}), 400

    # ── Validate & collect all 23 answers ────────────────────────────────────
    answers = {}
    unanswered = []

    for i in range(1, TOTAL_QUESTIONS + 1):
        key = f"q{i}"
        val = data.get(key)
        if val is None:
            unanswered.append(i)
            continue
        try:
            val = int(val)
        except (TypeError, ValueError):
            return jsonify({"error": f"Invalid value for question {i}."}), 400
        if val not in (1, 2, 3, 4):
            return jsonify({"error": f"Answer for question {i} must be 1–4."}), 400
        answers[key] = val

    if unanswered:
        noun = "questions" if len(unanswered) > 1 else "question"
        return jsonify({
            "error": f"Please answer {noun}: {', '.join(map(str, unanswered))}."
        }), 400

    # ── Overall score ─────────────────────────────────────────────────────────
    total_score   = sum(answers.values())
    average_score = round(total_score / TOTAL_QUESTIONS, 2)
    overall_cutoff = OVERALL_CUTOFFS[age_group]
    overall_result = "ISSUE DETECTED" if total_score >= overall_cutoff else "NO ISSUE"

    # ── Stream scores (ventral + any future streams) ──────────────────────────
    stream_results = {}
    for stream in STREAMS:
        stream_results.update(score_stream(stream, answers, age_group))

    return jsonify({
        # Overall
        "age":           age,
        "age_group":     age_group,
        "total_score":   total_score,
        "maximum_score": MAX_SCORE,
        "average_score": average_score,
        "overall_cutoff": overall_cutoff,
        "overall_result": overall_result,
        # Streams (ventral, dorsal, etc.)
        **stream_results,
    })


if __name__ == "__main__":
    app.run(debug=True)
