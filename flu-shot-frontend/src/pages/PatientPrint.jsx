import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BASE_URL = 'https://doo-kxpn.onrender.com';

function PatientPrint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  useEffect(() => {
    fetch(`${BASE_URL}/api/patients/${id}`)
      .then(r => r.json())
      .then(data => { setPatient(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handlePrint = () => window.print();

  const parse = (json) => { try { return JSON.parse(json); } catch { return null; } };

  const yesNo = (val) => val === '1' ? 'Yes(1)' : val === '0' ? 'No(0)' : val || '-';
  const checked = (val) => val ? '☑' : '☐';

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  if (!patient) return <div style={{ padding: '40px' }}>Patient not found. <button onClick={() => navigate('/patients')}>Back</button></div>;

  const va = parse(patient.visual_acuity_data);
  const screening = parse(patient.cvi_screening_data);
  const range38 = parse(patient.cvi_range38_data);
  const range910 = parse(patient.cvi_range910_data);
  const icf = parse(patient.icf_framework_data);

  const range34B = ['Visually fixates when the environment is controlled','Less attracted to lights, can be re-directed','Latency slightly decreases after periods of consistent viewing','May look at novel objects if the novel objects share characteristics of the familiar objects','Blinks in responses may be latent and/and are inconsistent','Has a "favourite" color','Shows strong visual fields preferences','May notice movement objects at 2-3 feet','Look through completed as separate events'];
  const range56B = ['Objects viewed may have 2 to 3 colors','Light is no longer a distracter','Latency present only when the student is tired, stressed, or over-stimulated','Movement continues to be an important factor for visual attention','Student tolerates low levels of background noise','Blink response to touch is consistently present','Blink response to visual threat is intermittently present','Visual attention now extends beyond near space, up to 4 to 6 ft.','May regard familiar faces when voice does not compete'];
  const range78B = ['Selection of toys/objects is less restricted, require 1 to 2 sessions of "warm-up"','Completing auditory stimuli tolerated during periods of viewing','Blink response to visual threat consistently present','Visual attention extends to 10 feet with targets that produce movement','Movement not required for attention at near','Smiles at/regards familiar and new faces','May enjoy regarding self in mirror','Most high contrast colors and / or familiar patterns regarded','Simple books, picture cards, or symbols regarded'];
  const range910B = ['Selection of toys/objects not restricted','Latency resolved','No color or pattern preferences','Visual attention extends beyond 20 feet','Views books or other 2 dimensional materials, simple images','Uses vision to imitate actions','Demonstrates memory of visual events','Typical visual-social responses','Visual fields unrestricted','Look and reach completed as a single action','Attends to 2-dimensional images against complex background'];
  const ratingCols = ['O','I','D','R','+','+/-','-'];
  const scoringItems = ['1. Colour','2. Movements','3. Latency','4. Visual Fields','5. Complexity','6. Light Gazing','7. Distance Viewing','8. Visual Reflexive Responses','9. Visual Novelty','10. Visual Motor'];

  return (
    <>
      <div className="print-actions no-print">
        <button onClick={() => navigate('/patients')} className="topbar-btn" style={{ background: '#555' }}>← Back</button>
        <button onClick={handlePrint} className="action-btn-large" style={{ padding: '10px 24px' }}>
          🖨 Print / Save as PDF
        </button>
      </div>

      <div ref={printRef} className="print-area">
        {/* PAGE 1 - BASIC INFO */}
        <div className="print-page">
          <div className="proforma-header" style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '10px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '16px' }}>DEPARTMENT OF OPHTHALMOLOGY</h2>
            <p style={{ margin: '2px 0', fontWeight: 'bold' }}>CVI CLINIC PROFORMA</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
            <tbody>
              <tr>
                <td style={td}>Name: <strong>{patient.name}</strong></td>
                <td style={td}>OP No: <strong>{patient.op_no}</strong></td>
                <td style={td}>Date: <strong>{patient.date}</strong></td>
              </tr>
              <tr>
                <td style={td}>Sex: <strong>{patient.sex}</strong> &nbsp; Age: <strong>{patient.age}</strong></td>
                <td style={td}>Guardian: <strong>{patient.guardian_name}</strong></td>
                <td style={td}>Address: <strong>{patient.address}</strong></td>
              </tr>
            </tbody>
          </table>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid #000' }}>
            <div style={{ padding: '10px', borderRight: '2px solid #000' }}>
              <h4 style={h4}>Chief Complaints:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  {[
                    ['Colour perception / preference', yesNo(patient.colour_perception)],
                    ['Better vision with moving objects', yesNo(patient.moving_objects)],
                    ['Longer time to find / recognise', yesNo(patient.longer_time)],
                    ['Gaze preference / light gazing', yesNo(patient.gaze_preference)],
                    ['Looks through people', yesNo(patient.looks_through)],
                    ['Visual attention span', patient.attention_span || '-'],
                    ['Squint', yesNo(patient.squint)],
                    ['Seizures', yesNo(patient.seizures)],
                    ['Stumbling / Hyperactive behaviour', yesNo(patient.stumbling)],
                    ['Favourite things to look at', yesNo(patient.favourite_things)],
                    ['Difficulty with visualising new surroundings', yesNo(patient.difficulty_new)],
                  ].map(([label, val]) => (
                    <tr key={label}><td style={{ border: '1px solid #999', padding: '3px 6px' }}>{label}</td><td style={{ border: '1px solid #999', padding: '3px 6px' }}>{val}</td></tr>
                  ))}
                </tbody>
              </table>

              <h4 style={h4}>Birth History: Antenatal</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  {[
                    ['Fever with rashes', yesNo(patient.fever_rashes)],
                    ['PIH', yesNo(patient.pih)],
                    ['Others', yesNo(patient.others_antenatal)],
                    ['Gestation Period', `${patient.gestation_weeks || '-'} weeks — ${patient.gestation_type || '-'}`],
                    ['Birth Weight', `${patient.birth_weight || '-'} grams`],
                    ['Delivery', patient.delivery === '0' ? 'normal' : patient.delivery === '1' ? 'forceps' : patient.delivery === '2' ? 'CS' : '-'],
                    ['CRY', patient.cry === '0' ? 'immediate' : patient.cry === '1' ? 'delayed' : '-'],
                  ].map(([label, val]) => (
                    <tr key={label}><td style={{ border: '1px solid #999', padding: '3px 6px' }}>{label}</td><td style={{ border: '1px solid #999', padding: '3px 6px' }}>{val}</td></tr>
                  ))}
                </tbody>
              </table>

              <h4 style={h4}>APGAR Scores:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  {[
                    ['Oxygen therapy', yesNo(patient.oxygen_therapy)],
                    ['Neonatal jaundice', yesNo(patient.jaundice)],
                    ['Convulsions', yesNo(patient.convulsions)],
                    ['Hyperglycemia', yesNo(patient.hyperglycemia)],
                    ['Chorio amnionitis', yesNo(patient.chorioamnionitis)],
                    ['Milestones', patient.milestones === '0' ? 'normal' : patient.milestones === '1' ? 'delayed' : '-'],
                  ].map(([label, val]) => (
                    <tr key={label}><td style={{ border: '1px solid #999', padding: '3px 6px' }}>{label}</td><td style={{ border: '1px solid #999', padding: '3px 6px' }}>{val}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ padding: '10px' }}>
              <h4 style={h4}>Family History:</h4>
              <strong>Pedigree:</strong>
              {patient.pedigree_image
                ? <img src={patient.pedigree_image} alt="Pedigree" style={{ width: '100%', border: '1px solid #999', marginTop: '5px' }} />
                : <div style={{ border: '1px solid #999', height: '80px', marginTop: '5px' }}></div>
              }
              <br />
              <strong>Consanguinity:</strong> {patient.consanguinity === '0' ? 'absent' : patient.consanguinity === '1' ? 'present' : '-'}<br />
              <strong>Nutritional status:</strong> {patient.nutritional_status || '-'}<br /><br />
              <strong>Auditory anomaly:</strong> {patient.auditory_anomaly === '0' ? 'absent' : patient.auditory_anomaly === '1' ? 'present' : '-'}

              <h4 style={h4}>Ocular Examination:</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  {[
                    ['Extra ocular movements', patient.eom === '0' ? 'normal' : patient.eom === '1' ? 'restricted' : '-'],
                    ['Visual axes', patient.visual_axes === '0' ? 'parallel' : patient.visual_axes === '1' ? 'unparallel' : '-'],
                    ['Binocular Vision', patient.binocular === '0' ? 'orthophoria' : patient.binocular === '1' ? 'esotropia' : patient.binocular === '2' ? 'exotropia' : '-'],
                    ['Anterior Segment', patient.anterior_segment === '0' ? 'normal' : patient.anterior_segment === '1' ? 'abnormal' : '-'],
                    ['Posterior Segment', patient.posterior_segment === '0' ? 'normal' : patient.posterior_segment === '1' ? 'abnormal' : '-'],
                    ['Nystagmus', patient.nystagmus === '0' ? 'absent' : patient.nystagmus === '1' ? 'present' : '-'],
                  ].map(([label, val]) => (
                    <tr key={label}><td style={{ border: '1px solid #999', padding: '3px 6px' }}>{label}</td><td style={{ border: '1px solid #999', padding: '3px 6px' }}>{val}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PAGE 2 - VISUAL ACUITY */}
        {va && (
          <div className="print-page">
            <h3 style={{ borderBottom: '2px solid #000', paddingBottom: '6px' }}>VISUAL ACUITY & REFRACTION</h3>

            {/* Fixes/Follows Light */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '10px' }}>
              <thead><tr><th style={th}>Test</th><th style={th}>RE</th><th style={th}>LE</th></tr></thead>
              <tbody>
                <tr>
                  <td style={td}>Fixes / Follows Light</td>
                  <td style={td}>{va.fixes_re_num || '-'} / {va.fixes_re_den || '-'}</td>
                  <td style={td}>{va.fixes_le_num || '-'} / {va.fixes_le_den || '-'}</td>
                </tr>
              </tbody>
            </table>

            {/* Teller Acuity Card */}
            <strong style={{ fontSize: '13px' }}>Vision with TELLER ACUITY CARD</strong>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '10px', marginTop: '5px' }}>
              <thead>
                <tr><th style={th} rowSpan="2"></th><th style={th} colSpan="3">RE</th><th style={th} colSpan="3">LE</th></tr>
                <tr><th style={th}>38cm</th><th style={th}>55cm</th><th style={th}>84cm</th><th style={th}>38cm</th><th style={th}>55cm</th><th style={th}>84cm</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={td}>I Observation</td>
                  <td style={td}>{va.teller_re_38_1 || '-'}</td><td style={td}>{va.teller_re_55_1 || '-'}</td><td style={td}>{va.teller_re_84_1 || '-'}</td>
                  <td style={td}>{va.teller_le_38_1 || '-'}</td><td style={td}>{va.teller_le_55_1 || '-'}</td><td style={td}>{va.teller_le_84_1 || '-'}</td>
                </tr>
                <tr>
                  <td style={td}>II Observation</td>
                  <td style={td}>{va.teller_re_38_2 || '-'}</td><td style={td}>{va.teller_re_55_2 || '-'}</td><td style={td}>{va.teller_re_84_2 || '-'}</td>
                  <td style={td}>{va.teller_le_38_2 || '-'}</td><td style={td}>{va.teller_le_55_2 || '-'}</td><td style={td}>{va.teller_le_84_2 || '-'}</td>
                </tr>
              </tbody>
            </table>

            {/* Refraction */}
            <strong style={{ fontSize: '13px' }}>Refraction Record</strong>
            <table style={{ width: '60%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '10px', marginTop: '5px' }}>
              <tbody>
                <tr>
                  <td style={td}>Retinoscopy (TL/TR/BL/BR)</td>
                  <td style={td}>{va.retino_tl || '-'} / {va.retino_tr || '-'} / {va.retino_bl || '-'} / {va.retino_br || '-'}</td>
                </tr>
                <tr>
                  <td style={td}>Dynamic Retinoscopy</td>
                  <td style={td}>{va.dyn_retino_tl || '-'} / {va.dyn_retino_tr || '-'} / {va.dyn_retino_bl || '-'} / {va.dyn_retino_br || '-'}</td>
                </tr>
              </tbody>
            </table>

            <strong style={{ fontSize: '13px' }}>Subjective Refraction</strong>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '10px', marginTop: '5px' }}>
              <thead><tr><th style={th}>Eyes</th><th style={th}>SPH</th><th style={th}>CYL</th><th style={th}>Axis</th></tr></thead>
              <tbody>
                <tr><td style={td}>RE</td><td style={td}>{va.subj_re_sph || '-'}</td><td style={td}>{va.subj_re_cyl || '-'}</td><td style={td}>{va.subj_re_axis || '-'}</td></tr>
                <tr><td style={td}>LE</td><td style={td}>{va.subj_le_sph || '-'}</td><td style={td}>{va.subj_le_cyl || '-'}</td><td style={td}>{va.subj_le_axis || '-'}</td></tr>
              </tbody>
            </table>

            <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>Ophthalmic Diagnosis:</strong> {va.ophthalmic_diagnosis || '-'}</p>
            <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>Electrodiagnostic / BERA:</strong> {va.electro_bera || '-'}</p>
            <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>MRI ({va.mri_type || '-'}):</strong> {va.mri_notes || '-'}</p>
            <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>Dev Quotient / IQ:</strong> {va.dev_quotient || '-'}</p>
            <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>Paediatric Diagnosis:</strong> {va.paediatric_diagnosis || '-'}</p>
            <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>Overall CVI Range — Rating 1:</strong> {va.cvi_range_1 || '-'} &nbsp;&nbsp; <strong>Rating 2 Total Score:</strong> {va.total_score_1 || '-'}</p>

            <h4 style={h4}>FOLLOW UP</h4>
            <p style={{ fontSize: '13px', margin: '4px 0' }}><strong>Date:</strong> {va.followup_date || '-'} &nbsp; <strong>Fluctuation in vision:</strong> {va.fluctuation_vision || '-'} &nbsp; <strong>DQ/IQ:</strong> {va.dq_iq || '-'}</p>

            {/* Follow-up Teller Acuity */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginTop: '8px' }}>
              <thead>
                <tr><th style={th} rowSpan="2">Follow-up Observation</th><th style={th} colSpan="3">RE</th><th style={th} colSpan="3">LE</th></tr>
                <tr><th style={th}>38cm</th><th style={th}>55cm</th><th style={th}>84cm</th><th style={th}>38cm</th><th style={th}>55cm</th><th style={th}>84cm</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td style={td}>RE: {va.followup_re || '-'} / LE: {va.followup_le || '-'}</td>
                  <td style={td}>{va.followup_re_38 || '-'}</td><td style={td}>{va.followup_re_55 || '-'}</td><td style={td}>{va.followup_re_84 || '-'}</td>
                  <td style={td}>{va.followup_le_38 || '-'}</td><td style={td}>{va.followup_le_55 || '-'}</td><td style={td}>{va.followup_le_84 || '-'}</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: '13px', margin: '8px 0 0 0' }}><strong>Follow-up CVI Range — Rating 1:</strong> {va.cvi_range_2 || '-'} &nbsp;&nbsp; <strong>Rating 2 Total Score:</strong> {va.total_score_2 || '-'}</p>
          </div>
        )}

        {/* PAGE 3 - CVI SCREENING */}
        {screening && (
          <div className="print-page">
            <h3 style={{ borderBottom: '2px solid #000', paddingBottom: '6px' }}>CVI SCREENING</h3>

            {/* Totals */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '12px' }}>
              <thead>
                <tr><th style={th}>Totals</th><th style={th}>Evaluation #1 (red)</th><th style={th}>Evaluation #2 (blue)</th><th style={th}>Evaluation #3 (green)</th></tr>
              </thead>
              <tbody>
                <tr><td style={td}>Range for Rating 1</td><td style={td}>{screening.totals?.r1_e1 || '-'}</td><td style={td}>{screening.totals?.r1_e2 || '-'}</td><td style={td}>{screening.totals?.r1_e3 || '-'}</td></tr>
                <tr><td style={td}>Total for Rating 2</td><td style={td}>{screening.totals?.r2_e1 || '-'}</td><td style={td}>{screening.totals?.r2_e2 || '-'}</td><td style={td}>{screening.totals?.r2_e3 || '-'}</td></tr>
                <tr><td style={td}>Overall CVI Range</td><td style={td}>{screening.totals?.overall_e1 || '-'}</td><td style={td}>{screening.totals?.overall_e2 || '-'}</td><td style={td}>{screening.totals?.overall_e3 || '-'}</td></tr>
              </tbody>
            </table>

            {/* Screening Questions */}
            {[
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
            ].map((q, i) => (
              <div key={i} style={{ fontSize: '13px', padding: '3px 0', borderBottom: '1px solid #eee' }}>
                {checked(screening.screening?.[i])} {q}
              </div>
            ))}

            {/* CVI Range 1-2 */}
            <div style={{ fontWeight: 'bold', margin: '12px 0 6px', fontSize: '13px' }}>CVI RANGE 1-2: STUDENT FUNCTIONS WITH MINIMAL VISUAL RESPONSE</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr>{ratingCols.map(c => <th key={c} style={th}>{c}</th>)}<th style={th}>Behaviour Description</th></tr></thead>
              <tbody>
                {[
                  'May localize but no appropriate fixations of objects or faces',
                  'Consistently attentive to lights or perhaps ceiling fans',
                  'Prolonged periods of latency in visual tasks',
                  'Responds only in strictly controlled environments',
                  'Objects viewed are single color',
                  'Objects viewed have movements and / or reflective properties',
                  'Visually attends in near space only',
                  'No blink in response to touch and / or visual threat',
                  'No regard of human face',
                ].map((b, ri) => (
                  <tr key={ri}>
                    {Array(7).fill(0).map((_, ci) => (
                      <td key={ci} style={{ ...td, textAlign: 'center' }}>{screening.behaviors && checked(screening.behaviors[ri]?.[ci])}</td>
                    ))}
                    <td style={{ ...td, textAlign: 'left' }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGE 4 - CVI RANGE 3-8 */}
        {range38 && (
          <div className="print-page">
            <h3 style={{ borderBottom: '2px solid #000', paddingBottom: '6px' }}>CVI RANGE 3-8 ASSESSMENT</h3>
            {[['CVI RANGE 3-4', range34B, range38.range34], ['CVI RANGE 5-6', range56B, range38.range56], ['CVI RANGE 7-8', range78B, range38.range78]].map(([title, behaviors, data]) => (
              <div key={title} style={{ marginBottom: '15px' }}>
                <div style={{ fontWeight: 'bold', margin: '10px 0 5px' }}>{title}</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead><tr>{ratingCols.map(c => <th key={c} style={th}>{c}</th>)}<th style={th}>Behaviour</th></tr></thead>
                  <tbody>
                    {behaviors.map((b, ri) => (
                      <tr key={ri}>
                        {Array(7).fill(0).map((_, ci) => <td key={ci} style={{ ...td, textAlign: 'center' }}>{data && data[ri] && checked(data[ri][ci])}</td>)}
                        <td style={{ ...td, textAlign: 'left' }}>{b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {/* PAGE 5 - CVI RANGE 9-10 */}
        {range910 && (
          <div className="print-page">
            <h3 style={{ borderBottom: '2px solid #000', paddingBottom: '6px' }}>CVI RANGE 9-10 & RATING II</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '15px' }}>
              <thead><tr>{ratingCols.map(c => <th key={c} style={th}>{c}</th>)}<th style={th}>Behaviour</th></tr></thead>
              <tbody>
                {range910B.map((b, ri) => (
                  <tr key={ri}>
                    {Array(7).fill(0).map((_, ci) => <td key={ci} style={{ ...td, textAlign: 'center' }}>{range910.behaviors && checked(range910.behaviors[ri]?.[ci])}</td>)}
                    <td style={{ ...td, textAlign: 'left' }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>RATING II SCORES:</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead><tr><th style={th}>Item</th><th style={th}>0</th><th style={th}>.25</th><th style={th}>.5</th><th style={th}>.75</th><th style={th}>1</th></tr></thead>
              <tbody>
                {scoringItems.map((item, ri) => (
                  <tr key={ri}>
                    <td style={td}>{item}</td>
                    {['0','.25','.5','.75','1'].map(val => (
                      <td key={val} style={{ ...td, textAlign: 'center' }}>{range910.scores && range910.scores[ri] === val ? '●' : '○'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGE 6 - ICF FRAMEWORK */}
        {icf && (
          <div className="print-page">
            <h3 style={{ borderBottom: '2px solid #000', paddingBottom: '6px', textAlign: 'center' }}>ICF FRAMEWORK: CVI</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

              <div style={{ border: '1px solid #000', padding: '10px', fontSize: '13px' }}>
                <strong>Impairment of Body structure and function:</strong>
                <ol style={{ margin: '5px 0', paddingLeft: '16px' }}>
                  {[['Cognitive Impairment','body_cognitive'],['Motor abnormalities','body_motor'],['Decreased visual acuity','body_visual_acuity'],['Reduced contrast sensitivity','body_contrast'],['Nystagmus','body_nystagmus'],['Retinopathy','body_retinopathy'],['Cataract','body_cataract'],['Glaucoma','body_glaucoma'],['Head banging','body_head_bang'],['Wandering eye movements','body_wandering']].map(([label, key]) => (
                    <li key={key}>{label} {checked(icf[key])}</li>
                  ))}
                </ol>
              </div>

              <div style={{ border: '1px solid #000', padding: '10px', fontSize: '13px' }}>
                <strong>Participation Restriction:</strong>
                <ol style={{ margin: '5px 0', paddingLeft: '16px' }}>
                  <li>Unable to participate in play {checked(icf.part_play)}</li>
                  <li>Unable to communicate {checked(icf.part_communicate)}</li>
                  <li>Health conditions: {icf.part_health_conditions || '-'}</li>
                </ol>
                <br />
                <strong>Environmental Factors - Barriers:</strong>
                <ol style={{ margin: '5px 0', paddingLeft: '16px' }}>
                  <li>Father in denial {checked(icf.env_father)}</li>
                  <li>Mother- overburdened {checked(icf.env_mother)}</li>
                  <li>Therapy centre not accessible within vicinity {checked(icf.env_therapy)}</li>
                </ol>
              </div>

              <div style={{ border: '1px solid #000', padding: '10px', fontSize: '13px' }}>
                <strong>Activity limitations:</strong>
                <ol style={{ margin: '5px 0', paddingLeft: '16px' }}>
                  <li>Inability to maintain head control {checked(icf.act_head)}</li>
                  <li>Inability to come to sit {checked(icf.act_sit)}</li>
                  <li>Inability to see objects in dry illumination {checked(icf.act_illumination)}</li>
                  <li>Cognitive Impairment {checked(icf.act_cognitive)}</li>
                  <li>Poor operation ability (fine movement) {checked(icf.act_fine_movement)}</li>
                  <li>Below average computing power {checked(icf.act_computing)}</li>
                  <li>Poor self care ability {checked(icf.act_self_care)}</li>
                </ol>
              </div>

              <div style={{ border: '1px solid #000', padding: '10px', fontSize: '13px', gridColumn: '1 / -1' }}>
                <strong>Personal factors:</strong>
                <ol style={{ margin: '5px 0', paddingLeft: '16px' }}>
                  <li>Often drowsy {checked(icf.pf_drowsy)}</li>
                  <li>Does not initiate social interaction or respond to social interaction {checked(icf.pf_social)}</li>
                  <li>Age: {icf.pf_age || '-'} &nbsp;&nbsp; Gender: {icf.pf_gender || '-'}</li>
                  <li>Psychological {checked(icf.pf_psychological)}</li>
                  <li>Interests: {icf.pf_interests || '-'}</li>
                </ol>
              </div>

            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .sidebar, .topbar, .app-main > .topbar { display: none !important; }
          .app-main { margin-left: 0 !important; }
          .app-content { padding: 0 !important; }
          .print-page { page-break-after: always; padding: 15px; font-size: 13px; }
          .print-page:last-child { page-break-after: avoid; }
          body { background: white !important; }
        }
        .print-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 15px 20px;
          background: #f0f2f5;
          margin-bottom: 20px;
        }
        .print-area {
          background: white;
          padding: 10px;
        }
        .print-page {
          background: white;
          border: 1px solid #ddd;
          padding: 20px;
          margin-bottom: 20px;
          font-size: 14px;
          font-family: Arial, sans-serif;
        }
      `}</style>
    </>
  );
}

const td = { border: '1px solid #000', padding: '4px 6px' };
const th = { border: '1px solid #000', padding: '4px 6px', background: '#f0f0f0', fontWeight: 'bold' };
const h4 = { margin: '10px 0 5px 0', fontSize: '14px', textDecoration: 'underline' };

export default PatientPrint;
