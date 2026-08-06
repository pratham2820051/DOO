import { useState } from 'react';

const screeningQuestions = [
  'Does the child have a history of visual impairments?',
  'Does the child use vision differently than you expect?',
  'Does the child have normal eye exam (with possible optic nerve differences)?',
  'Does the child "tune out" during large gatherings or trips to busy places?',
  'Does the child seem to see better at some times and worse at others?',
  'Does the child use vision frequently at home rather than almost any other place?',
  'Does the child have favorite things to look at even if things are not toys?',
  'Does the child have a favorite color?',
  'Does the child seem to look through people rather than directly at them?',
  'Does it sometimes take the child longer to "find" something you show him/her?',
  'Does the child prefer to look at things that move rather than things that are motionless?',
];

const cviRange12Behaviors = [
  'May localize but no appropriate fixations of objects or faces',
  'Consistently attentive to lights or perhaps ceiling fans',
  'Prolonged periods of latency in visual tasks',
  'Responds only in strictly controlled environments',
  'Objects viewed are single color',
  'Objects viewed have movements and / or reflective properties',
  'Visually attends in near space only',
  'No blink in response to touch and / or visual threat',
  'No regard of human face',
];

const ratingCols = ['O', 'I', 'D', 'R', '+', '+/-', '-'];

function CVIScreening({ onDataChange }) {
  const [totals, setTotals] = useState({ r1_e1: '', r1_e2: '', r1_e3: '', r2_e1: '', r2_e2: '', r2_e3: '', overall_e1: '', overall_e2: '', overall_e3: '' });
  const [screening, setScreening] = useState(Array(screeningQuestions.length).fill(false));
  const [behaviors, setBehaviors] = useState(Array(cviRange12Behaviors.length).fill(Array(7).fill(false)));

  const notify = (t, s, b) => {
    if (onDataChange) onDataChange(JSON.stringify({ totals: t, screening: s, behaviors: b }));
  };

  const handleTotal = (e) => {
    const updated = { ...totals, [e.target.name]: e.target.value };
    setTotals(updated);
    notify(updated, screening, behaviors);
  };

  const toggleScreening = (i) => {
    const updated = [...screening];
    updated[i] = !updated[i];
    setScreening(updated);
    notify(totals, updated, behaviors);
  };

  const toggleBehavior = (row, col) => {
    const updated = behaviors.map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? !c : c) : r);
    setBehaviors(updated);
    notify(totals, screening, updated);
  };

  return (
    <div className="proforma">
      <table className="compact-table">
        <thead>
          <tr><th style={{ width: '220px' }}>Totals:</th><th>Evaluation #1 (red)</th><th>Evaluation #2 (blue)</th><th>Evaluation #3 (green)</th></tr>
        </thead>
        <tbody>
          <tr><td>Range for Rating 1</td><td><input type="text" name="r1_e1" value={totals.r1_e1} onChange={handleTotal} /></td><td><input type="text" name="r1_e2" value={totals.r1_e2} onChange={handleTotal} /></td><td><input type="text" name="r1_e3" value={totals.r1_e3} onChange={handleTotal} /></td></tr>
          <tr><td>Total for Rating 2</td><td><input type="text" name="r2_e1" value={totals.r2_e1} onChange={handleTotal} /></td><td><input type="text" name="r2_e2" value={totals.r2_e2} onChange={handleTotal} /></td><td><input type="text" name="r2_e3" value={totals.r2_e3} onChange={handleTotal} /></td></tr>
          <tr><td>Combine both ratings to get overall CVI range</td><td><input type="text" name="overall_e1" value={totals.overall_e1} onChange={handleTotal} /></td><td><input type="text" name="overall_e2" value={totals.overall_e2} onChange={handleTotal} /></td><td><input type="text" name="overall_e3" value={totals.overall_e3} onChange={handleTotal} /></td></tr>
        </tbody>
      </table>

      <table className="rating-table" style={{ margin: '10px 0' }}>
        <tbody>
          {screeningQuestions.map((q, i) => (
            <tr key={i}>
              <td style={{ width: '30px' }}><input type="checkbox" checked={screening[i]} onChange={() => toggleScreening(i)} /></td>
              <td style={{ textAlign: 'left' }}>{q}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="note-text">*Yes answers indicate a positive relationship with one or more characteristics associated with CVI.</p>

      <div className="rating-header">RATING I</div>
      <div className="methods-section">
        <strong>METHODS USED TO SUPPORT THE SCORES:</strong><br />
        O = Observation of child &nbsp; I = Interview &nbsp; D = Direct Contact<br />
        <strong>DEGREE ASSESSMENT</strong><br />
        R = Resolved visual behavior &nbsp; + = Describes current functioning &nbsp; +/- = Partially describes &nbsp; - = Does not apply
      </div>

      <div className="section-title-bold">CVI RANGE 1-2: STUDENT FUNCTIONS WITH MINIMAL VISUAL RESPONSE</div>
      <table className="rating-table">
        <thead><tr>{ratingCols.map(c => <th key={c}>{c}</th>)}<th style={{ width: '65%' }}>Behaviour Description</th></tr></thead>
        <tbody>
          {cviRange12Behaviors.map((behavior, ri) => (
            <tr key={ri}>
              {Array(7).fill(0).map((_, ci) => (
                <td key={ci}><input type="checkbox" checked={behaviors[ri][ci]} onChange={() => toggleBehavior(ri, ci)} /></td>
              ))}
              <td>{behavior}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default CVIScreening;
