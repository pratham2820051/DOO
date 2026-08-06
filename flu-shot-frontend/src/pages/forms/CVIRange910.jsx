import { useState } from 'react';

const range910 = ['Selection of toys/objects not restricted','Latency resolved','No color or pattern preferences','Visual attention extends beyond 20 feet','Views books or other 2 dimensional materials, simple images','Uses vision to imitate actions','Demonstrates memory of visual events','Typical visual-social responses','Visual fields unrestricted','Look and reach completed as a single action','Attends to 2-dimensional images against complex background'];
const scoringItems = ['1. Colour','2. Movements','3. Latency','4. Visual Fields','5. Complexity','6. Light Gazing','7. Distance Viewing','8. Visual Reflexive Responses (touch/threat)','9. Visual Novelty','10. Visual Motor'];
const ratingCols = ['O', 'I', 'D', 'R', '+', '+/-', '-'];
const scoreCols = ['0', '.25', '.5', '.75', '1'];

function CVIRange910({ onDataChange }) {
  const [behaviors, setBehaviors] = useState(Array(range910.length).fill(Array(7).fill(false)));
  const [scores, setScores] = useState(Array(scoringItems.length).fill(''));

  const notify = (b, s) => {
    if (onDataChange) onDataChange(JSON.stringify({ behaviors: b, scores: s }));
  };

  const toggleBehavior = (row, col) => {
    const updated = behaviors.map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? !c : c) : r);
    setBehaviors(updated);
    notify(updated, scores);
  };

  const setScore = (row, val) => {
    const updated = scores.map((s, i) => i === row ? val : s);
    setScores(updated);
    notify(behaviors, updated);
  };

  return (
    <div className="proforma">
      <div className="section-title-bold">CVI RANGE 9-10: STUDENT SPONTANEOUSLY USES VISION FOR MOST FUNCTIONAL ACTIVITIES</div>
      <table className="rating-table">
        <thead><tr>{ratingCols.map(c => <th key={c}>{c}</th>)}<th style={{ width: '65%' }}>Behaviour Description</th></tr></thead>
        <tbody>
          {range910.map((behavior, ri) => (
            <tr key={ri}>
              {Array(7).fill(0).map((_, ci) => (
                <td key={ci}><input type="checkbox" checked={behaviors[ri][ci]} onChange={() => toggleBehavior(ri, ci)} /></td>
              ))}
              <td>{behavior}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="rating-header">RATING II</div>
      <div className="score-legend">
        <table><tbody>
          <tr><td><strong>0.00</strong></td><td>Not resolved, usually or always a factor affecting visual functioning</td></tr>
          <tr><td><strong>0.25</strong></td><td>Resolving</td></tr>
          <tr><td><strong>0.50</strong></td><td>Resolving. Sometimes a factor affecting visual functioning</td></tr>
          <tr><td><strong>0.75</strong></td><td>Resolving</td></tr>
          <tr><td><strong>1.0</strong></td><td>Resolved, not a factor affecting visual functioning</td></tr>
        </tbody></table>
      </div>

      <table className="scoring-table">
        <thead>
          <tr><th style={{ width: '180px' }}></th><th>Not Resolved</th><th></th><th>Resolving</th><th></th><th>Resolved</th></tr>
          <tr><th></th>{scoreCols.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {scoringItems.map((item, ri) => (
            <tr key={ri}>
              <td>{item}</td>
              {scoreCols.map((val) => (
                <td key={val}>
                  <input type="radio" name={`score_${ri}`} value={val} checked={scores[ri] === val} onChange={() => setScore(ri, val)} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CVIRange910;
