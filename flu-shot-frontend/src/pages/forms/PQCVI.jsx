import { useState } from 'react';

const QUESTIONS = [
  "Does your child recognize their mother's or father's face before you speak?",
  "Can your child reach out and grasp objects?",
  "Is your child able to track slow-moving objects, such as a rolling ball?",
  "Does your child recognize the faces of other family members?",
  "Can your child identify familiar objects like a cup, shoes, or a doll?",
  "Can your child locate objects hidden under a blanket or paper?",
  "Is your child able to pick up a small object with their thumb and index finger?",
  "Can your child track fast-moving objects, such as a moving car?",
  "Does your child eat food from different parts of a large plate rather than just one area?",
  "Can your child recognize other people in photographs?",
  "Can your child recognize themselves in photographs?",
  "Can your child navigate well around their home, finding rooms and the toilet easily?",
  "Does your child recognize their friends' faces?",
  "Can your child easily locate doorways and navigate along corridors?",
  "Can your child judge the height of steps without tripping?",
  "Can your child identify objects while they are moving quickly themselves?",
  "Can your child find objects on a blanket with a complex pattern?",
  "Does your child have a good memory for where they put things at home?",
  "Can your child differentiate between shapes like triangles, rectangles, and circles?",
  "Can your child sort or match colors?",
  "Can your child name colors?",
  "Can your child find objects within a complex picture?",
  "Does your child adapt well to new surroundings, navigating easily?",
];

const VENTRAL_QS = [1, 4, 5, 10, 11, 13, 19, 20, 21];
const DORSAL_QS  = [2, 3, 6, 7, 8, 9, 12, 14, 15, 16, 17, 18, 22, 23];

const OVERALL_CUTOFFS = { '3-4': 59.87, '4-5': 75.84, '5-6': 73.70 };
const VENTRAL_CUTOFFS = { '3-4': 21.54, '4-5': 25.32, '5-6': 28.00 };
const DORSAL_CUTOFFS  = { '3-4': 36.28, '4-5': 48.67, '5-6': 44.37 };

function getAgeGroup(age) {
  if (age >= 3 && age < 4) return '3-4';
  if (age >= 4 && age < 5) return '4-5';
  if (age >= 5 && age <= 6) return '5-6';
  return null;
}

function PQCVI({ onDataChange }) {
  const [age, setAge] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnswer = (q, val) => {
    const updated = { ...answers, [q]: parseInt(val) };
    setAnswers(updated);
    if (onDataChange) onDataChange(JSON.stringify({ age, answers: updated, result }));
  };

  const handleAge = (e) => {
    setAge(e.target.value);
    if (onDataChange) onDataChange(JSON.stringify({ age: e.target.value, answers, result }));
  };

  const handleSubmitScore = () => {
    setError('');
    const ageNum = parseFloat(age);
    if (isNaN(ageNum)) { setError('Please enter a valid age.'); return; }
    const ageGroup = getAgeGroup(ageNum);
    if (!ageGroup) { setError('Age must be between 3 and 6 years.'); return; }

    const unanswered = [];
    for (let i = 1; i <= 23; i++) {
      if (!answers[`q${i}`]) unanswered.push(i);
    }
    if (unanswered.length > 0) {
      setError(`Please answer question${unanswered.length > 1 ? 's' : ''}: ${unanswered.join(', ')}`);
      return;
    }

    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const ventralTotal = VENTRAL_QS.reduce((s, q) => s + (answers[`q${q}`] || 0), 0);
    const dorsalTotal  = DORSAL_QS.reduce((s, q) => s + (answers[`q${q}`] || 0), 0);

    const res = {
      age: ageNum,
      age_group: ageGroup,
      total_score: totalScore,
      max_score: 92,
      average_score: (totalScore / 23).toFixed(2),
      overall_cutoff: OVERALL_CUTOFFS[ageGroup],
      overall_result: totalScore >= OVERALL_CUTOFFS[ageGroup] ? 'ISSUE DETECTED' : 'NO ISSUE',
      ventral_total: ventralTotal,
      ventral_cutoff: VENTRAL_CUTOFFS[ageGroup],
      ventral_result: ventralTotal >= VENTRAL_CUTOFFS[ageGroup] ? 'ISSUE DETECTED' : 'NO ISSUE',
      dorsal_total: dorsalTotal,
      dorsal_cutoff: DORSAL_CUTOFFS[ageGroup],
      dorsal_result: dorsalTotal >= DORSAL_CUTOFFS[ageGroup] ? 'ISSUE DETECTED' : 'NO ISSUE',
    };
    setResult(res);
    if (onDataChange) onDataChange(JSON.stringify({ age, answers, result: res }));
  };

  const handleClear = () => {
    setAnswers({});
    setAge('');
    setResult(null);
    setError('');
    if (onDataChange) onDataChange(JSON.stringify({ age: '', answers: {}, result: null }));
  };

  return (
    <div className="pqcvi-container">
      {/* Header */}
      <div className="pqcvi-header">
        <span className="pqcvi-header-icon">👁️</span>
        <h2>Parental Questionnaire for Cerebral Visual Impairment (PQCVI)</h2>
      </div>

      {/* Intro */}
      <div className="pqcvi-intro-card">
        <p>The questions below are related to the visual perception-related behavior of your child. Read these questions and choose the best answer for your child.</p>
        <div className="pqcvi-scale-title">ANSWER SCALE</div>
        <ol className="pqcvi-scale">
          <li>Never</li>
          <li>Occasionally</li>
          <li>Most of the time</li>
          <li>Always</li>
        </ol>
      </div>

      <div className="pqcvi-note">
        ℹ️ The items in this list are ordered from the highest to the lowest mean score.
      </div>

      {/* Age Input */}
      <div className="pqcvi-age-row">
        <label><strong>Child's Age (years):</strong></label>
        <input
          type="number"
          step="0.1"
          min="3"
          max="6"
          placeholder="e.g. 4.5"
          value={age}
          onChange={handleAge}
          className="pqcvi-age-input"
        />
        <span className="pqcvi-age-hint">Supported range: 3 – 6 years</span>
      </div>

      {/* Questions Table */}
      <table className="pqcvi-table">
        <thead>
          <tr>
            <th className="pqcvi-sno">S.NO</th>
            <th className="pqcvi-question">QUESTION</th>
            <th colSpan="4" className="pqcvi-answer-header">ANSWER</th>
          </tr>
          <tr className="pqcvi-answer-labels">
            <th></th>
            <th></th>
            <th>Never</th>
            <th>Occasionally</th>
            <th>Most of the time</th>
            <th>Always</th>
          </tr>
        </thead>
        <tbody>
          {QUESTIONS.map((q, idx) => {
            const qKey = `q${idx + 1}`;
            return (
              <tr key={qKey} className={idx % 2 === 0 ? 'pqcvi-row-even' : 'pqcvi-row-odd'}>
                <td className="pqcvi-sno">{idx + 1}.</td>
                <td className="pqcvi-question">{q}</td>
                {[1, 2, 3, 4].map(val => (
                  <td key={val} className="pqcvi-radio-cell">
                    <input
                      type="radio"
                      name={qKey}
                      value={val}
                      checked={answers[qKey] === val}
                      onChange={() => handleAnswer(qKey, val)}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Error */}
      {error && <div className="pqcvi-error">⚠ {error}</div>}

      {/* Actions */}
      <div className="pqcvi-actions">
        <button type="button" className="pqcvi-btn-clear" onClick={handleClear}>🗑️ Clear Answers</button>
        <button type="button" className="pqcvi-btn-score" onClick={handleSubmitScore}>✔ Calculate Score</button>
      </div>

      {/* Result */}
      {result && (
        <div className={`pqcvi-result ${result.overall_result === 'ISSUE DETECTED' ? 'pqcvi-result-issue' : 'pqcvi-result-ok'}`}>
          <h3>Assessment Result — Age Group: {result.age_group} years</h3>
          <div className="pqcvi-result-grid">
            <div className="pqcvi-result-card">
              <strong>Overall Score</strong>
              <span className="pqcvi-score">{result.total_score} / {result.max_score}</span>
              <span className="pqcvi-avg">Average: {result.average_score}</span>
              <span className="pqcvi-cutoff">Cutoff: {result.overall_cutoff}</span>
              <span className={`pqcvi-badge ${result.overall_result === 'ISSUE DETECTED' ? 'badge-issue' : 'badge-ok'}`}>
                {result.overall_result}
              </span>
            </div>
            <div className="pqcvi-result-card">
              <strong>Ventral-stream Function</strong>
              <span className="pqcvi-score">{result.ventral_total}</span>
              <span className="pqcvi-cutoff">Cutoff: {result.ventral_cutoff}</span>
              <span className={`pqcvi-badge ${result.ventral_result === 'ISSUE DETECTED' ? 'badge-issue' : 'badge-ok'}`}>
                {result.ventral_result}
              </span>
            </div>
            <div className="pqcvi-result-card">
              <strong>Dorsal-stream Function</strong>
              <span className="pqcvi-score">{result.dorsal_total}</span>
              <span className="pqcvi-cutoff">Cutoff: {result.dorsal_cutoff}</span>
              <span className={`pqcvi-badge ${result.dorsal_result === 'ISSUE DETECTED' ? 'badge-issue' : 'badge-ok'}`}>
                {result.dorsal_result}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PQCVI;
