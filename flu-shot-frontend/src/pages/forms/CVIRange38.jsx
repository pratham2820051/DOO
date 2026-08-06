import { useState } from 'react';

const range34 = ['Visually fixates when the environment is controlled','Less attracted to lights, can be re-directed','Latency slightly decreases after periods of consistent viewing','May look at novel objects if the novel objects share characteristics of the familiar objects','Blinks in responses may be latent and/and are inconsistent','Has a "favourite" color','Shows strong visual fields preferences','May notice movement objects at 2-3 feet','Look through completed as separate events'];
const range56 = ['Objects viewed may have 2 to 3 colors','Light is no longer a distracter','Latency present only when the student is tired, stressed, or over-stimulated','Movement continues to be an important factor for visual attention','Student tolerates low levels of background noise','Blink response to touch is consistently present','Blink response to visual threat is intermittently present','Visual attention now extends beyond near space, up to 4 to 6 ft.','May regard familiar faces when voice does not compete'];
const range78 = ['Selection of toys/objects is less restricted, require 1 to 2 sessions of "warm-up"','Completing auditory stimuli tolerated during periods of viewing','Blink response to visual threat consistently present','Visual attention extends to 10 feet with targets that produce movement','Movement not required for attention at near','Smiles at/regards familiar and new faces','May enjoy regarding self in mirror','Most high contrast colors and / or familiar patterns regarded','Simple books, picture cards, or symbols regarded'];
const ratingCols = ['O', 'I', 'D', 'R', '+', '+/-', '-'];

function CVIRange38({ onDataChange }) {
  const [data, setData] = useState({
    range34: Array(range34.length).fill(Array(7).fill(false)),
    range56: Array(range56.length).fill(Array(7).fill(false)),
    range78: Array(range78.length).fill(Array(7).fill(false)),
  });

  const toggle = (section, row, col) => {
    const updated = {
      ...data,
      [section]: data[section].map((r, ri) => ri === row ? r.map((c, ci) => ci === col ? !c : c) : r)
    };
    setData(updated);
    if (onDataChange) onDataChange(JSON.stringify(updated));
  };

  const RatingTable = ({ section, behaviors }) => (
    <table className="rating-table">
      <thead><tr>{ratingCols.map(c => <th key={c}>{c}</th>)}<th style={{ width: '65%' }}>Behaviour Description</th></tr></thead>
      <tbody>
        {behaviors.map((behavior, ri) => (
          <tr key={ri}>
            {Array(7).fill(0).map((_, ci) => (
              <td key={ci}><input type="checkbox" checked={data[section][ri][ci]} onChange={() => toggle(section, ri, ci)} /></td>
            ))}
            <td>{behavior}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="proforma">
      <div className="section-title-bold">CVI RANGE 3-4: STUDENT FUNCTIONS WITH MORE CONSISTENT VISUAL RESPONSE</div>
      <RatingTable section="range34" behaviors={range34} />
      <div className="section-title-bold">CVI RANGE 5-6: STUDENTS USES VISION FOR FUNCTIONAL TASKS</div>
      <RatingTable section="range56" behaviors={range56} />
      <div className="section-title-bold">CVI RANGE 7-8: STUDENT DEMONSTRATES VISUAL CURIOSITY</div>
      <RatingTable section="range78" behaviors={range78} />
    </div>
  );
}

export default CVIRange38;
