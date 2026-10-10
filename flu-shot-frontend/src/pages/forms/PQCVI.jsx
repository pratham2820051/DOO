import { useState } from 'react';
import { submitPQCVI } from '../../api/api';

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

function PQCVI({ onDataChange, userInfo }) {
  const [age, setAge] = useState(userInfo?.age || '');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

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

    // Save to DB if userInfo is provided (public examine flow)
    if (userInfo?.name) {
      setSaving(true);
      setSavedMsg('');
      submitPQCVI(userInfo.name, ageNum, userInfo.gender || '-', answers)
        .then(() => setSavedMsg('✅ Results saved successfully!'))
        .catch((err) => setSavedMsg('⚠ Could not save to server: ' + err.message))
        .finally(() => setSaving(false));
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const name = userInfo?.name || '-';
    const gender = userInfo?.gender || '-';
    const ageVal = age || '-';
    const ageGroup = result?.age_group || '-';

    const ANSWER_LABELS = { 1: 'Never', 2: 'Occasionally', 3: 'Most of the time', 4: 'Always' };

    const questionsHTML = QUESTIONS.map((q, idx) => {
      const qKey = `q${idx + 1}`;
      const ans = answers[qKey];
      const stream = VENTRAL_QS.includes(idx + 1) ? 'V' : 'D';
      return `
        <tr style="background:${idx % 2 === 0 ? '#f5f8ff' : '#fff'}">
          <td style="border:1px solid #ccc;padding:6px 8px;text-align:center;font-weight:600;color:#2563eb">${idx + 1}.</td>
          <td style="border:1px solid #ccc;padding:6px 8px;font-size:13px">${q}</td>
          <td style="border:1px solid #ccc;padding:6px 8px;text-align:center;font-size:11px;color:#888">${stream}</td>
          ${[1,2,3,4].map(v => `<td style="border:1px solid #ccc;padding:6px 8px;text-align:center">${ans === v ? '●' : '○'}</td>`).join('')}
          <td style="border:1px solid #ccc;padding:6px 8px;font-size:13px;color:#374151">${ans ? ANSWER_LABELS[ans] : '-'}</td>
        </tr>`;
    }).join('');

    const overallBg  = result?.overall_result  === 'ISSUE DETECTED' ? '#fee2e2' : '#dcfce7';
    const overallClr = result?.overall_result  === 'ISSUE DETECTED' ? '#b91c1c' : '#15803d';
    const vBg  = result?.ventral_result === 'ISSUE DETECTED' ? '#fee2e2' : '#dcfce7';
    const vClr = result?.ventral_result === 'ISSUE DETECTED' ? '#b91c1c' : '#15803d';
    const dBg  = result?.dorsal_result  === 'ISSUE DETECTED' ? '#fee2e2' : '#dcfce7';
    const dClr = result?.dorsal_result  === 'ISSUE DETECTED' ? '#b91c1c' : '#15803d';

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>PQCVI Report — ${name}</title>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 13px; color: #1a2340; background: #fff; padding: 20px; }
    .no-print { display: flex; gap: 10px; margin-bottom: 16px; }
    @media print { .no-print { display: none !important; } }
    .header { background: linear-gradient(90deg,#1e40af,#2563eb); color:#fff; border-radius:8px; padding:16px 20px; margin-bottom:16px; }
    .header h2 { font-size:17px; font-weight:700; margin-bottom:4px; }
    .header p  { font-size:13px; opacity:.85; }
    .info-row { display:flex; gap:20px; background:#f0f6ff; border:1px solid #dbeafe; border-radius:8px; padding:12px 16px; margin-bottom:16px; font-size:13px; }
    .info-row span strong { color:#1e40af; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    thead tr { background:linear-gradient(90deg,#1e40af,#2563eb); color:#fff; }
    thead th { padding:10px 8px; font-size:12px; font-weight:600; text-align:center; border:1px solid #1e40af; }
    .result-section { border-radius:8px; padding:16px 20px; margin-bottom:16px; border:1.5px solid #ccc; }
    .result-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:12px; }
    .result-card { background:#fff; border:1px solid #e0e6ed; border-radius:8px; padding:12px; }
    .result-card strong { font-size:12px; color:#1b2a4a; display:block; margin-bottom:6px; }
    .big-score { font-size:24px; font-weight:700; color:#1e40af; }
    .sub-text { font-size:11px; color:#666; margin-top:2px; }
    .badge { display:inline-block; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:700; margin-top:6px; }
    .footer { margin-top:24px; border-top:1px solid #e0e6ed; padding-top:12px; font-size:11px; color:#888; display:flex; justify-content:space-between; }
    .print-btn { padding:10px 22px; background:#1e40af; color:#fff; border:none; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; }
    .back-btn  { padding:10px 22px; background:#e9ecef; color:#333; border:none; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="back-btn" onclick="window.close()">✕ Close</button>
    <button class="print-btn" onclick="window.print()">🖨 Print / Save as PDF</button>
  </div>

  <div class="header">
    <h2>👁️ Parental Questionnaire for Cerebral Visual Impairment (PQCVI)</h2>
    <p>CVI Clinic Portal — Assessment Report</p>
  </div>

  <div class="info-row">
    <span>👤 <strong>${name}</strong></span>
    <span>Age: <strong>${ageVal} years</strong></span>
    <span>Gender: <strong>${gender}</strong></span>
    <span>Age Group: <strong>${ageGroup} years</strong></span>
    <span>Date: <strong>${new Date().toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'})}</strong></span>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:5%">S.No</th>
        <th style="width:52%;text-align:left">Question</th>
        <th style="width:5%">Stream</th>
        <th>Never</th>
        <th>Occasionally</th>
        <th>Most of the time</th>
        <th>Always</th>
        <th style="text-align:left">Answer</th>
      </tr>
    </thead>
    <tbody>${questionsHTML}</tbody>
  </table>

  <div class="result-section" style="background:${result?.overall_result === 'ISSUE DETECTED' ? '#fff1f2' : '#f0fdf4'};border-color:${result?.overall_result === 'ISSUE DETECTED' ? '#fca5a5' : '#86efac'}">
    <h3 style="font-size:15px;margin-bottom:4px;color:${overallClr}">Assessment Result — Age Group: ${ageGroup} years</h3>
    <div class="result-grid">
      <div class="result-card">
        <strong>Overall Score</strong>
        <span class="big-score">${result?.total_score} / ${result?.max_score}</span>
        <span class="sub-text">Average: ${result?.average_score}</span>
        <span class="sub-text">Cutoff: ${result?.overall_cutoff}</span>
        <span class="badge" style="background:${overallBg};color:${overallClr}">${result?.overall_result}</span>
      </div>
      <div class="result-card">
        <strong>Ventral-stream Function</strong>
        <span class="big-score">${result?.ventral_total}</span>
        <span class="sub-text">Cutoff: ${result?.ventral_cutoff}</span>
        <span class="badge" style="background:${vBg};color:${vClr}">${result?.ventral_result}</span>
      </div>
      <div class="result-card">
        <strong>Dorsal-stream Function</strong>
        <span class="big-score">${result?.dorsal_total}</span>
        <span class="sub-text">Cutoff: ${result?.dorsal_cutoff}</span>
        <span class="badge" style="background:${dBg};color:${dClr}">${result?.dorsal_result}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>V = Ventral-stream questions &nbsp;|&nbsp; D = Dorsal-stream questions</span>
    <span>Generated on ${new Date().toLocaleString('en-IN')}</span>
  </div>
</body>
</html>`);
    printWindow.document.close();
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
          readOnly={!!userInfo?.age}
        />
        <span className="pqcvi-age-hint">
          {userInfo?.name ? `${userInfo.name} | ${userInfo.gender}` : 'Supported range: 3 – 6 years'}
        </span>
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
        <button type="button" className="pqcvi-btn-score" onClick={handleSubmitScore} disabled={saving}>
          {saving ? 'Saving...' : '✔ Calculate Score'}
        </button>
        {result && (
          <button type="button" className="pqcvi-btn-print" onClick={handlePrint}>
            🖨️ Print Report
          </button>
        )}
      </div>

      {/* Save status */}
      {savedMsg && (
        <div style={{ padding: '10px 14px', marginBottom: '12px', borderRadius: '8px', fontSize: '14px', background: savedMsg.startsWith('✅') ? '#f0fdf4' : '#fff3cd', color: savedMsg.startsWith('✅') ? '#15803d' : '#856404', border: `1px solid ${savedMsg.startsWith('✅') ? '#86efac' : '#ffc107'}` }}>
          {savedMsg}
        </div>
      )}

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
