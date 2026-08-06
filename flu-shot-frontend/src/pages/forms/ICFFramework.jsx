import { useState } from 'react';

function ICFFramework({ onDataChange }) {
  const [d, setD] = useState({
    body_cognitive: false, body_motor: false, body_visual_acuity: false,
    body_contrast: false, body_nystagmus: false, body_retinopathy: false,
    body_cataract: false, body_glaucoma: false, body_head_bang: false, body_wandering: false,
    part_play: false, part_communicate: false, part_health_conditions: '',
    act_head: false, act_sit: false, act_illumination: false, act_cognitive: false,
    act_fine_movement: false, act_computing: false, act_self_care: false,
    env_father: false, env_mother: false, env_therapy: false,
    pf_drowsy: false, pf_social: false, pf_age: '', pf_gender: '',
    pf_psychological: false, pf_interests: '',
  });

  const h = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const updated = { ...d, [e.target.name]: val };
    setD(updated);
    if (onDataChange) onDataChange(JSON.stringify(updated));
  };

  const CB = ({ name, label }) => (
    <span> {label} <input type="checkbox" name={name} checked={d[name]} onChange={h} /></span>
  );

  return (
    <div className="proforma">
      <div className="proforma-title">ICF FRAMEWORK: CVI</div>
      <div className="icf-grid">
        <div className="icf-box">
          <h4>Impairment of Body structure and function:</h4>
          <ol>
            <li>Cognitive Impairment <CB name="body_cognitive" /></li>
            <li>Motor abnormalities <CB name="body_motor" /></li>
            <li>Decreased visual acuity <CB name="body_visual_acuity" /></li>
            <li>Reduced contrast sensitivity <CB name="body_contrast" /></li>
            <li>Nystagmus <CB name="body_nystagmus" /></li>
            <li>Retinopathy <CB name="body_retinopathy" /></li>
            <li>Cataract <CB name="body_cataract" /></li>
            <li>Glaucoma <CB name="body_glaucoma" /></li>
            <li>Head banging <CB name="body_head_bang" /></li>
            <li>Wandering eye movements <CB name="body_wandering" /></li>
          </ol>
        </div>
        <div className="icf-box">
          <h4>Participation Restriction:</h4>
          <ol>
            <li>Unable to participate in play <CB name="part_play" /></li>
            <li>Unable to communicate <CB name="part_communicate" /></li>
            <li>Health conditions <input type="text" name="part_health_conditions" value={d.part_health_conditions} onChange={h} style={{ width: '150px' }} /></li>
          </ol>
        </div>
        <div className="icf-box">
          <h4>Activity limitations:</h4>
          <ol>
            <li>Inability to maintain head control <CB name="act_head" /></li>
            <li>Inability to come to sit <CB name="act_sit" /></li>
            <li>Inability to see objects in dry illumination <CB name="act_illumination" /></li>
            <li>Cognitive Impairment <CB name="act_cognitive" /></li>
            <li>Poor operation ability (fine movement) <CB name="act_fine_movement" /></li>
            <li>Below average computing power <CB name="act_computing" /></li>
            <li>Poor self care ability <CB name="act_self_care" /></li>
          </ol>
        </div>
        <div className="icf-box">
          <h4>Environmental Factors- Barriers:</h4>
          <ol>
            <li>Father in denial <CB name="env_father" /></li>
            <li>Mother- overburdened <CB name="env_mother" /></li>
            <li>Therapy centre not accessible within vicinity <CB name="env_therapy" /></li>
          </ol>
        </div>
        <div className="icf-box icf-full">
          <h4>Personal factors:</h4>
          <ol>
            <li>Often drowsy <CB name="pf_drowsy" /></li>
            <li>Does not initiate social interaction or respond to social interaction <CB name="pf_social" /></li>
            <li>Age <input type="text" name="pf_age" value={d.pf_age} onChange={h} style={{ width: '60px' }} /></li>
            <li>Gender <input type="text" name="pf_gender" value={d.pf_gender} onChange={h} style={{ width: '60px' }} /></li>
            <li>Psychological <CB name="pf_psychological" /></li>
            <li>Interests <input type="text" name="pf_interests" value={d.pf_interests} onChange={h} style={{ width: '150px' }} /></li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default ICFFramework;
