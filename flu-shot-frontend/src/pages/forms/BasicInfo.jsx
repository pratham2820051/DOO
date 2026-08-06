import { useState } from 'react';
import DrawingCanvas from '../../components/DrawingCanvas';

function BasicInfo({ onDataChange }) {
  const [formData, setFormData] = useState({
    name: '', op_no: '', date: '', sex: '', age: '', guardian_name: '', address: '',
    colour_perception: '', moving_objects: '', longer_time: '', gaze_preference: '',
    looks_through: '', attention_span: '', squint: '', seizures: '', stumbling: '',
    favourite_things: '', difficulty_new: '',
    fever_rashes: '', pih: '', others_antenatal: '', gestation_weeks: '',
    gestation_type: '', birth_weight: '', delivery: '', cry: '',
    oxygen_therapy: '', jaundice: '', convulsions: '', hyperglycemia: '',
    chorioamnionitis: '', milestones: '',
    consanguinity: '', nutritional_status: '', auditory_anomaly: '',
    eom: '', visual_axes: '', binocular: '', anterior_segment: '',
    posterior_segment: '', nystagmus: '',
    pedigree_image: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    if (onDataChange) onDataChange(updated);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePedigree = (imageData) => {
    const updated = { ...formData, pedigree_image: imageData };
    setFormData(updated);
    if (onDataChange) onDataChange(updated);
  };

  const Radio = ({ name, value, label }) => (
    <label style={{ marginRight: '8px', fontSize: '14px' }}>
      <input type="radio" name={name} value={value}
        checked={formData[name] === value} onChange={handleChange} /> {label}
    </label>
  );

  return (
    <div className="proforma">
      <div className="proforma-header">
        <h2>DEPARTMENT OF OPHTHALMOLOGY</h2>
        <p>CVI CLINIC PROFORMA</p>
      </div>

      <table className="patient-info">
        <tbody>
          <tr>
            <td>
              Name <span className="required-star">*</span>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={errors.name ? 'input-error' : ''} required />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </td>
            <td>
              OP No <span className="required-star">*</span>
              <input type="text" name="op_no" value={formData.op_no} onChange={handleChange} className={errors.op_no ? 'input-error' : ''} required />
              {errors.op_no && <span className="error-msg">{errors.op_no}</span>}
            </td>
            <td>
              Date <span className="required-star">*</span>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className={errors.date ? 'input-error' : ''} required />
              {errors.date && <span className="error-msg">{errors.date}</span>}
            </td>
          </tr>
          <tr>
            <td>
              Sex <span className="required-star">*</span>{' '}
              <select name="sex" value={formData.sex} onChange={handleChange} className={errors.sex ? 'input-error' : ''} style={{ padding: '2px 4px', fontSize: '14px', border: '1px solid #999' }} required>
                <option value="">--</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>{' '}
              Age <span className="required-star">*</span>
              <input type="text" name="age" value={formData.age} onChange={handleChange} className={errors.age ? 'input-error' : ''} style={{ width: '30%' }} required />
              {(errors.sex || errors.age) && <span className="error-msg">{errors.sex || errors.age}</span>}
            </td>
            <td>
              Parent's / Guardian's name <span className="required-star">*</span>
              <input type="text" name="guardian_name" value={formData.guardian_name} onChange={handleChange} className={errors.guardian_name ? 'input-error' : ''} required />
              {errors.guardian_name && <span className="error-msg">{errors.guardian_name}</span>}
            </td>
            <td>
              Address <span className="required-star">*</span>
              <input type="text" name="address" value={formData.address} onChange={handleChange} className={errors.address ? 'input-error' : ''} required />
              {errors.address && <span className="error-msg">{errors.address}</span>}
            </td>
          </tr>
        </tbody>
      </table>

      <div className="main-content">
        <div className="left-col">
          <h4>Chief Complaints:</h4>
          <table className="compact-table">
            <tbody>
              {[
                { label: 'Colour perception / preference', name: 'colour_perception' },
                { label: 'Better vision with moving objects', name: 'moving_objects' },
                { label: 'Longer time to find / recognise', name: 'longer_time' },
                { label: 'Gaze preference / light gazing', name: 'gaze_preference' },
                { label: 'Looks through people', name: 'looks_through' },
              ].map(item => (
                <tr key={item.name}>
                  <td>{item.label}</td>
                  <td><Radio name={item.name} value="0" label="No(0)" /><Radio name={item.name} value="1" label="Yes(1)" /></td>
                </tr>
              ))}
              <tr>
                <td>Visual attention span</td>
                <td><Radio name="attention_span" value="limited" label="limited" /><Radio name="attention_span" value="adequate" label="adequate" /></td>
              </tr>
              {[
                { label: 'Squint', name: 'squint' },
                { label: 'Seizures', name: 'seizures' },
                { label: 'Stumbling / Hyperactive behaviour', name: 'stumbling' },
                { label: 'Favourite things to look at (than toys)', name: 'favourite_things' },
                { label: 'Difficulty with visualising new surroundings', name: 'difficulty_new' },
              ].map(item => (
                <tr key={item.name}>
                  <td>{item.label}</td>
                  <td><Radio name={item.name} value="0" label="No(0)" /><Radio name={item.name} value="1" label="Yes(1)" /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4>Birth History: Antenatal</h4>
          <table className="compact-table">
            <tbody>
              {[
                { label: 'Fever with rashes', name: 'fever_rashes' },
                { label: 'PIH', name: 'pih' },
                { label: 'Others', name: 'others_antenatal' },
              ].map(item => (
                <tr key={item.name}>
                  <td>{item.label}</td>
                  <td><Radio name={item.name} value="0" label="No(0)" /><Radio name={item.name} value="1" label="Yes(1)" /></td>
                </tr>
              ))}
              <tr>
                <td>Gestation Period</td>
                <td>
                  <input type="number" name="gestation_weeks" value={formData.gestation_weeks} onChange={handleChange} style={{ width: '40px', border: '1px solid #999', padding: '2px 4px', fontSize: '14px' }} /> weeks &nbsp;
                  <Radio name="gestation_type" value="preterm" label="PRETERM" /><Radio name="gestation_type" value="term" label="TERM" />
                </td>
              </tr>
              <tr>
                <td>Birth Weight</td>
                <td><input type="text" name="birth_weight" value={formData.birth_weight} onChange={handleChange} style={{ width: '80px', border: '1px solid #999', padding: '2px 4px', fontSize: '14px' }} /> grams</td>
              </tr>
              <tr>
                <td>Delivery</td>
                <td><Radio name="delivery" value="0" label="normal(0)" /><Radio name="delivery" value="1" label="forceps(1)" /><Radio name="delivery" value="2" label="CS(2)" /></td>
              </tr>
              <tr>
                <td>CRY</td>
                <td><Radio name="cry" value="0" label="immediate(0)" /><Radio name="cry" value="1" label="delayed(1)" /></td>
              </tr>
            </tbody>
          </table>

          <h4>APGAR Scores:</h4>
          <table className="compact-table">
            <tbody>
              {[
                { label: 'History of: oxygen therapy', name: 'oxygen_therapy' },
                { label: 'neonatal jaundice', name: 'jaundice' },
                { label: 'convulsions', name: 'convulsions' },
                { label: 'documented hyperglycemia', name: 'hyperglycemia' },
                { label: 'chorio amnionitis', name: 'chorioamnionitis' },
              ].map(item => (
                <tr key={item.name}>
                  <td>{item.label}</td>
                  <td><Radio name={item.name} value="0" label="No(0)" /><Radio name={item.name} value="1" label="Yes(1)" /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <table className="compact-table">
            <tbody>
              <tr>
                <td>Milestones</td>
                <td><Radio name="milestones" value="0" label="normal(0)" /><Radio name="milestones" value="1" label="delayed(1)" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="right-col">
          <h4>Family History:</h4>
          <strong>Pedigree</strong>
          <DrawingCanvas onSave={handlePedigree} />

          <strong>Consanguinity:</strong>
          <Radio name="consanguinity" value="0" label="absent(0)" /><Radio name="consanguinity" value="1" label="present(1)" />
          <br /><br />

          <strong>Nutritional status:</strong>
          <textarea name="nutritional_status" value={formData.nutritional_status} onChange={handleChange} rows="3" style={{ width: '100%', border: '1px solid #999', fontSize: '14px', padding: '4px', resize: 'vertical' }}></textarea>

          <h4>CNS: &nbsp; CP / GDD / AUTISM / ________</h4>

          <strong>Auditory anomaly:</strong>
          <Radio name="auditory_anomaly" value="0" label="absent(0)" /><Radio name="auditory_anomaly" value="1" label="present(1)" />

          <h4>Ocular Examination:</h4>
          <table className="compact-table">
            <tbody>
              <tr>
                <td>Extra ocular movements</td>
                <td><Radio name="eom" value="0" label="normal(0)" /><Radio name="eom" value="1" label="restricted(1)" /></td>
              </tr>
              <tr>
                <td>Visual axes</td>
                <td><Radio name="visual_axes" value="0" label="parallel(0)" /><Radio name="visual_axes" value="1" label="unparallel(1)" /></td>
              </tr>
            </tbody>
          </table>

          <h4>BINOCULAR VISION AND MOTILITY:</h4>
          <Radio name="binocular" value="0" label="orthophoria(0)" /><Radio name="binocular" value="1" label="esotropia(1)" /><Radio name="binocular" value="2" label="exotropia(2)" />
          <br /><br />

          <h4>OCULAR HEALTH ASSESSMENT</h4>
          <table className="compact-table">
            <tbody>
              <tr>
                <td>ANTERIOR SEGMENT</td>
                <td><Radio name="anterior_segment" value="0" label="normal(0)" /><Radio name="anterior_segment" value="1" label="abnormal(1)" /></td>
              </tr>
              <tr>
                <td>POSTERIOR SEGMENT</td>
                <td><Radio name="posterior_segment" value="0" label="normal(0)" /><Radio name="posterior_segment" value="1" label="abnormal(1)" /></td>
              </tr>
              <tr>
                <td>Nystagmus</td>
                <td><Radio name="nystagmus" value="0" label="absent(0)" /><Radio name="nystagmus" value="1" label="present(1)" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BasicInfo;
