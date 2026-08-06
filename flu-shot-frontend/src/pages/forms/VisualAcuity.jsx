import { useState } from 'react';

function VisualAcuity({ onDataChange }) {
  const [d, setD] = useState({
    fixes_re_num: '', fixes_re_den: '', fixes_le_num: '', fixes_le_den: '',
    teller_re_38_1: '', teller_re_55_1: '', teller_re_84_1: '',
    teller_le_38_1: '', teller_le_55_1: '', teller_le_84_1: '',
    teller_re_38_2: '', teller_re_55_2: '', teller_re_84_2: '',
    teller_le_38_2: '', teller_le_55_2: '', teller_le_84_2: '',
    retino_tl: '', retino_tr: '', retino_bl: '', retino_br: '',
    dyn_retino_tl: '', dyn_retino_tr: '', dyn_retino_bl: '', dyn_retino_br: '',
    subj_re_sph: '', subj_re_cyl: '', subj_re_axis: '',
    subj_le_sph: '', subj_le_cyl: '', subj_le_axis: '',
    ophthalmic_diagnosis: '', electro_bera: '', mri_type: '', mri_notes: '',
    dev_quotient: '', paediatric_diagnosis: '',
    cvi_range_1: '', total_score_1: '',
    followup_date: '', fluctuation_vision: '', dq_iq: '',
    followup_re: '', followup_le: '',
    followup_re_38: '', followup_re_55: '', followup_re_84: '',
    followup_le_38: '', followup_le_55: '', followup_le_84: '',
    cvi_range_2: '', total_score_2: '',
  });

  const h = (e) => {
    const updated = { ...d, [e.target.name]: e.target.value };
    setD(updated);
    if (onDataChange) onDataChange(JSON.stringify(updated));
  };

  return (
    <div className="proforma">
      <h4>VISUAL ACUITY</h4>
      <table className="compact-table">
        <thead><tr><th style={{ width: '40%' }}></th><th>RE</th><th>LE</th></tr></thead>
        <tbody>
          <tr>
            <td>Fixes / Follows Light</td>
            <td><div className="fraction-box"><input type="text" name="fixes_re_num" value={d.fixes_re_num} onChange={h} /><span>/</span><input type="text" name="fixes_re_den" value={d.fixes_re_den} onChange={h} /></div></td>
            <td><div className="fraction-box"><input type="text" name="fixes_le_num" value={d.fixes_le_num} onChange={h} /><span>/</span><input type="text" name="fixes_le_den" value={d.fixes_le_den} onChange={h} /></div></td>
          </tr>
        </tbody>
      </table>

      <h4>Vision with TELLER ACUITY CARD</h4>
      <table className="compact-table">
        <thead>
          <tr><th rowSpan="2" style={{ width: '140px' }}></th><th colSpan="3">RE</th><th colSpan="3">LE</th></tr>
          <tr><th>AT 38cm</th><th>55cm</th><th>84cm</th><th>38cm</th><th>55cm</th><th>84cm</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>I OBSERVATION</td>
            <td><input type="text" name="teller_re_38_1" value={d.teller_re_38_1} onChange={h} /></td>
            <td><input type="text" name="teller_re_55_1" value={d.teller_re_55_1} onChange={h} /></td>
            <td><input type="text" name="teller_re_84_1" value={d.teller_re_84_1} onChange={h} /></td>
            <td><input type="text" name="teller_le_38_1" value={d.teller_le_38_1} onChange={h} /></td>
            <td><input type="text" name="teller_le_55_1" value={d.teller_le_55_1} onChange={h} /></td>
            <td><input type="text" name="teller_le_84_1" value={d.teller_le_84_1} onChange={h} /></td>
          </tr>
          <tr>
            <td>II OBSERVATION</td>
            <td><input type="text" name="teller_re_38_2" value={d.teller_re_38_2} onChange={h} /></td>
            <td><input type="text" name="teller_re_55_2" value={d.teller_re_55_2} onChange={h} /></td>
            <td><input type="text" name="teller_re_84_2" value={d.teller_re_84_2} onChange={h} /></td>
            <td><input type="text" name="teller_le_38_2" value={d.teller_le_38_2} onChange={h} /></td>
            <td><input type="text" name="teller_le_55_2" value={d.teller_le_55_2} onChange={h} /></td>
            <td><input type="text" name="teller_le_84_2" value={d.teller_le_84_2} onChange={h} /></td>
          </tr>
        </tbody>
      </table>

      <h4>REFRACTION RECORD</h4>
      <table className="compact-table">
        <tbody>
          <tr>
            <td style={{ width: '130px' }}>Retinoscopy:</td>
            <td><div className="quadrant-box">
              <div className="quadrant-row"><input type="text" className="quadrant-input" name="retino_tl" value={d.retino_tl} onChange={h} /><input type="text" className="quadrant-input" name="retino_tr" value={d.retino_tr} onChange={h} /></div>
              <div className="quadrant-row"><input type="text" className="quadrant-input" name="retino_bl" value={d.retino_bl} onChange={h} /><input type="text" className="quadrant-input" name="retino_br" value={d.retino_br} onChange={h} /></div>
            </div></td>
            <td style={{ width: '160px' }}>Dynamic Retinoscopy:</td>
            <td><div className="quadrant-box">
              <div className="quadrant-row"><input type="text" className="quadrant-input" name="dyn_retino_tl" value={d.dyn_retino_tl} onChange={h} /><input type="text" className="quadrant-input" name="dyn_retino_tr" value={d.dyn_retino_tr} onChange={h} /></div>
              <div className="quadrant-row"><input type="text" className="quadrant-input" name="dyn_retino_bl" value={d.dyn_retino_bl} onChange={h} /><input type="text" className="quadrant-input" name="dyn_retino_br" value={d.dyn_retino_br} onChange={h} /></div>
            </div></td>
          </tr>
        </tbody>
      </table>

      <h4>Subjective Refraction</h4>
      <table className="compact-table">
        <thead><tr><th>Eyes</th><th>SPH</th><th>CYL</th><th>Axis</th></tr></thead>
        <tbody>
          <tr><td>RE</td><td><input type="text" name="subj_re_sph" value={d.subj_re_sph} onChange={h} /></td><td><input type="text" name="subj_re_cyl" value={d.subj_re_cyl} onChange={h} /></td><td><input type="text" name="subj_re_axis" value={d.subj_re_axis} onChange={h} /></td></tr>
          <tr><td>LE</td><td><input type="text" name="subj_le_sph" value={d.subj_le_sph} onChange={h} /></td><td><input type="text" name="subj_le_cyl" value={d.subj_le_cyl} onChange={h} /></td><td><input type="text" name="subj_le_axis" value={d.subj_le_axis} onChange={h} /></td></tr>
        </tbody>
      </table>

      <div className="section-label">Ophthalmic diagnosis:</div>
      <div className="diagnosis-row">
        <label><input type="radio" name="ophthalmic_diagnosis" value="myopia" checked={d.ophthalmic_diagnosis === 'myopia'} onChange={h} /> myopia(0)</label>
        <label><input type="radio" name="ophthalmic_diagnosis" value="hypermetropia" checked={d.ophthalmic_diagnosis === 'hypermetropia'} onChange={h} /> hypermetropia(1)</label>
        <label><input type="radio" name="ophthalmic_diagnosis" value="astigmatism" checked={d.ophthalmic_diagnosis === 'astigmatism'} onChange={h} /> astigmatism(2)</label>
      </div>

      <div className="section-label">Electrodiagnostic testing / BERA</div>
      <input type="text" name="electro_bera" value={d.electro_bera} onChange={h} style={{ width: '100%', border: '1px solid #000', padding: '5px', fontSize: '12px', marginBottom: '10px' }} />

      <div className="section-label">MRI ( <input type="text" name="mri_type" value={d.mri_type} onChange={h} style={{ width: '100px', border: 'none', borderBottom: '1px solid #000', fontSize: '12px' }} /> )</div>
      <textarea name="mri_notes" value={d.mri_notes} onChange={h} rows="3" style={{ width: '100%', border: '1px solid #000', fontSize: '12px', padding: '5px', marginBottom: '10px' }}></textarea>

      <div className="inline-field"><strong>Developmental quotient / intelligence quotient:</strong><input type="text" name="dev_quotient" value={d.dev_quotient} onChange={h} style={{ width: '200px' }} /></div><br />

      <div className="section-label">Paediatric diagnosis:</div>
      <input type="text" name="paediatric_diagnosis" value={d.paediatric_diagnosis} onChange={h} style={{ width: '100%', border: '1px solid #000', padding: '5px', fontSize: '12px', marginBottom: '10px' }} />

      <h4>OVERALL CVI RANGE:</h4>
      <div className="inline-field">RATING 1: CVI RANGE <input type="text" name="cvi_range_1" value={d.cvi_range_1} onChange={h} /></div><br />
      <div className="inline-field">RATING 2: TOTAL SCORE <input type="text" name="total_score_1" value={d.total_score_1} onChange={h} /></div>
      <br /><br />

      <h4>FOLLOW UP:</h4>
      <div className="inline-field">DATE: <input type="date" name="followup_date" value={d.followup_date} onChange={h} /></div><br />
      <div className="inline-field">Fluctuation in vision: <input type="text" name="fluctuation_vision" value={d.fluctuation_vision} onChange={h} style={{ width: '250px' }} /></div><br />
      <div className="inline-field">DQ/IQ: <input type="text" name="dq_iq" value={d.dq_iq} onChange={h} /></div>
      <br /><br />

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0 }}>Vision with TELLER ACUITY CARD</h4>
        <div className="re-le-boxes">
          <span>RE<br /><input type="text" name="followup_re" value={d.followup_re} onChange={h} /></span>
          <span>LE<br /><input type="text" name="followup_le" value={d.followup_le} onChange={h} /></span>
        </div>
      </div>
      <table className="compact-table">
        <thead>
          <tr><th rowSpan="2" style={{ width: '140px' }}>OBSERVATION</th><th colSpan="3">RE</th><th colSpan="3">LE</th></tr>
          <tr><th>AT 38cm</th><th>55cm</th><th>84cm</th><th>38cm</th><th>55cm</th><th>84cm</th></tr>
        </thead>
        <tbody>
          <tr>
            <td></td>
            <td><input type="text" name="followup_re_38" value={d.followup_re_38} onChange={h} /></td>
            <td><input type="text" name="followup_re_55" value={d.followup_re_55} onChange={h} /></td>
            <td><input type="text" name="followup_re_84" value={d.followup_re_84} onChange={h} /></td>
            <td><input type="text" name="followup_le_38" value={d.followup_le_38} onChange={h} /></td>
            <td><input type="text" name="followup_le_55" value={d.followup_le_55} onChange={h} /></td>
            <td><input type="text" name="followup_le_84" value={d.followup_le_84} onChange={h} /></td>
          </tr>
        </tbody>
      </table>

      <h4>OVERALL CVI RANGE:</h4>
      <div className="inline-field">RATING 1: CVI RANGE <input type="text" name="cvi_range_2" value={d.cvi_range_2} onChange={h} /></div><br />
      <div className="inline-field">RATING 2: TOTAL SCORE <input type="text" name="total_score_2" value={d.total_score_2} onChange={h} /></div>
    </div>
  );
}

export default VisualAcuity;
