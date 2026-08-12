import re

def update_file(filename, is_tailor=False):
    with open(filename, 'r') as f:
        content = f.read()

    data_var = "builderData" if is_tailor else "data"
    set_data_var = "setBuilderData" if is_tailor else "setData"
    
    # 1. Add Handlers
    handlers_code = f"""
  const addProject = () => {{
    if(!{data_var}) return;
    const newProject = {{ id: uuidv4(), name: '', url: '', description: '', startDate: '', endDate: '' }};
    {set_data_var}({{ ...{data_var}, projects: [...({data_var}.projects || []), newProject] }});
  }};
  const updateProject = (id: string, field: string, value: string) => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, projects: ({data_var}.projects || []).map(p => p.id === id ? {{ ...p, [field]: value }} : p) }});
  }};
  const removeProject = (id: string) => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, projects: ({data_var}.projects || []).filter(p => p.id !== id) }});
  }};

  const addSoftSkill = () => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, softSkills: [...({data_var}.softSkills || []), {{ id: uuidv4(), name: '' }}] }});
  }};
  const updateSoftSkill = (id: string, value: string) => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, softSkills: ({data_var}.softSkills || []).map(s => s.id === id ? {{ ...s, name: value }} : s) }});
  }};
  const removeSoftSkill = (id: string) => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, softSkills: ({data_var}.softSkills || []).filter(s => s.id !== id) }});
  }};

  const addLanguage = () => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, languages: [...({data_var}.languages || []), {{ id: uuidv4(), name: '' }}] }});
  }};
  const updateLanguage = (id: string, value: string) => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, languages: ({data_var}.languages || []).map(l => l.id === id ? {{ ...l, name: value }} : l) }});
  }};
  const removeLanguage = (id: string) => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, languages: ({data_var}.languages || []).filter(l => l.id !== id) }});
  }};

  const addCertification = () => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, certifications: [...({data_var}.certifications || []), {{ id: uuidv4(), name: '' }}] }});
  }};
  const updateCertification = (id: string, value: string) => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, certifications: ({data_var}.certifications || []).map(c => c.id === id ? {{ ...c, name: value }} : c) }});
  }};
  const removeCertification = (id: string) => {{
    if(!{data_var}) return;
    {set_data_var}({{ ...{data_var}, certifications: ({data_var}.certifications || []).filter(c => c.id !== id) }});
  }};
"""
    if "const addReference" in content:
        content = content.replace("  const addReference = () => {", handlers_code + "\n  const addReference = () => {")

    # 2. Add Github URL to UI
    github_input = f"""
                  <input 
                    type="text" 
                    placeholder="GitHub URL" 
                    className="premium-input"
                    value={{{data_var}.personalInfo.github || ''}}
                    onChange={{e => {set_data_var}({{...{data_var}, personalInfo: {{...{data_var}.personalInfo, github: e.target.value}}}})}}
                    style={{{{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}}}
                  />
"""
    if 'placeholder="Website URL"' in content:
        # For TailorPage
        content = content.replace('placeholder="Website URL"', 'placeholder="Portfolio URL"')
        # Insert github before portfolio
        idx = content.find('<input \n                        type="text" \n                        placeholder="Portfolio URL"')
        if idx != -1:
             content = content[:idx] + github_input + content[idx:]
    elif 'placeholder="Personal Website URL"' in content:
        # For BuilderPage
        content = content.replace('placeholder="Personal Website URL"', 'placeholder="Portfolio URL"')
        idx = content.find('<input \n                    type="text" \n                    placeholder="Portfolio URL"')
        if idx != -1:
             content = content[:idx] + github_input + content[idx:]


    # 3. Add Sections to UI
    sections_ui = f"""
              {{/* Projects */}}
              <h3 style={{{{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}}}>Projects</h3>
              <div style={{{{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}}}>
                {{({data_var}.projects || []).map(proj => (
                  <div key={{proj.id}} className="premium-card" style={{{{ padding: '16px', position: 'relative' }}}}>
                    <button onClick={{() => removeProject(proj.id)}} style={{{{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}}}>
                      <Trash2 size={{16}} />
                    </button>
                    <div style={{{{ display: 'flex', flexDirection: 'column', gap: '10px' }}}}>
                      <input type="text" placeholder="Project Name" className="premium-input" value={{proj.name}} onChange={{e => updateProject(proj.id, 'name', e.target.value)}} />
                      <input type="text" placeholder="GitHub URL" className="premium-input" value={{proj.url}} onChange={{e => updateProject(proj.id, 'url', e.target.value)}} />
                      <div style={{{{ display: 'flex', gap: '10px' }}}}>
                        <input type="text" placeholder="Start Date" className="premium-input" value={{proj.startDate}} onChange={{e => updateProject(proj.id, 'startDate', e.target.value)}} />
                        <input type="text" placeholder="End Date" className="premium-input" value={{proj.endDate}} onChange={{e => updateProject(proj.id, 'endDate', e.target.value)}} />
                      </div>
                      <textarea rows={{3}} className="premium-textarea" placeholder="Description..." value={{proj.description}} onChange={{e => updateProject(proj.id, 'description', e.target.value)}} style={{{{ minHeight: '80px', resize: 'vertical' }}}} />
                    </div>
                  </div>
                ))}}
              </div>
              <div onClick={{addProject}} style={{{{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}}}>
                <Plus size={{14}} style={{{{ marginRight: '6px' }}}} /> Add Project
              </div>

              {{/* Soft Skills */}}
              <h3 style={{{{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}}}>Soft Skills</h3>
              <div style={{{{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}}}>
                {{({data_var}.softSkills || []).map(skill => (
                  <div key={{skill.id}} style={{{{ display: 'flex', alignItems: 'center', gap: '12px' }}}}>
                    <input type="text" placeholder="Communication, Teamwork..." className="premium-input" value={{skill.name}} onChange={{e => updateSoftSkill(skill.id, e.target.value)}} style={{{{ flex: 1 }}}} />
                    <button onClick={{() => removeSoftSkill(skill.id)}} style={{{{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}}}>
                      <Trash2 size={{16}} />
                    </button>
                  </div>
                ))}}
              </div>
              <div onClick={{addSoftSkill}} style={{{{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}}}>
                <Plus size={{14}} style={{{{ marginRight: '6px' }}}} /> Add Soft Skill
              </div>

              {{/* Languages */}}
              <h3 style={{{{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}}}>Languages</h3>
              <div style={{{{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}}}>
                {{({data_var}.languages || []).map(lang => (
                  <div key={{lang.id}} style={{{{ display: 'flex', alignItems: 'center', gap: '12px' }}}}>
                    <input type="text" placeholder="English, Spanish..." className="premium-input" value={{lang.name}} onChange={{e => updateLanguage(lang.id, e.target.value)}} style={{{{ flex: 1 }}}} />
                    <button onClick={{() => removeLanguage(lang.id)}} style={{{{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}}}>
                      <Trash2 size={{16}} />
                    </button>
                  </div>
                ))}}
              </div>
              <div onClick={{addLanguage}} style={{{{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}}}>
                <Plus size={{14}} style={{{{ marginRight: '6px' }}}} /> Add Language
              </div>

              {{/* Certifications */}}
              <h3 style={{{{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}}}>Certifications</h3>
              <div style={{{{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}}}>
                {{({data_var}.certifications || []).map(cert => (
                  <div key={{cert.id}} style={{{{ display: 'flex', alignItems: 'center', gap: '12px' }}}}>
                    <input type="text" placeholder="AWS Certified, CSM..." className="premium-input" value={{cert.name}} onChange={{e => updateCertification(cert.id, e.target.value)}} style={{{{ flex: 1 }}}} />
                    <button onClick={{() => removeCertification(cert.id)}} style={{{{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}}}>
                      <Trash2 size={{16}} />
                    </button>
                  </div>
                ))}}
              </div>
              <div onClick={{addCertification}} style={{{{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}}}>
                <Plus size={{14}} style={{{{ marginRight: '6px' }}}} /> Add Certification
              </div>
"""
    
    # Locate where to insert the UI. End of content tab is marked by the start of activeTab === 'templates' or similar.
    # We can insert it just before `</motion.div>\n          )}` where the references section ends.
    if 'Add Reference' in content:
        # Find the div closing Add Reference
        idx = content.find('Add Reference\n              </div>')
        if idx != -1:
             end_idx = content.find('</div>', idx) + 6
             content = content[:end_idx] + "\n" + sections_ui + content[end_idx:]

    with open(filename, 'w') as f:
        f.write(content)

update_file('BuilderPage.tsx', False)
update_file('TailorPage.tsx', True)
