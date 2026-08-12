import re

def update_file(filename, data_prefix):
    with open(filename, 'r') as f:
        content = f.read()

    template_code = """
    if (template === 'academic') {
      return (
        <div style={{ ...wrapperStyle, padding: '40px', background: '#fff', color: '#000', fontFamily: 'Georgia, "Times New Roman", serif' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '1px' }}>{PREFIXpersonalInfo.fullName}</h1>
            <h2 style={{ fontSize: '1.2em', fontWeight: 'normal', margin: '0 0 12px 0', fontStyle: 'italic' }}>{PREFIXpersonalInfo.jobTitle}</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.9em', color: '#333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>✉️</span> {PREFIXpersonalInfo.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>📞</span> {PREFIXpersonalInfo.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>📍</span> {PREFIXpersonalInfo.location}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>🔗</span> {PREFIXpersonalInfo.linkedin}
              </div>
              {PREFIXpersonalInfo.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px' }}>🌐</span> {PREFIXpersonalInfo.website}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {PREFIXpersonalInfo.summary && (
             <div style={{ marginBottom: '24px' }}>
               <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: '1px solid #000', paddingBottom: '4px' }}>Summary</h3>
               <p style={{ margin: 0, fontSize: '0.95em', lineHeight: 1.5 }}>{PREFIXpersonalInfo.summary}</p>
             </div>
          )}

          {/* Education */}
          {PREFIXeducation && PREFIXeducation.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: '1px solid #000', paddingBottom: '4px' }}>Education</h3>
              {PREFIXeducation.map(edu => (
                <div key={edu.id} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold', fontSize: '1em', marginBottom: '2px' }}>
                    <span>{edu.degree} in {edu.fieldOfStudy}</span>
                    <span>{edu.graduationDate}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.95em', fontStyle: 'italic' }}>
                    <span>{edu.institution}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills & Tools (Combined into Technical Skills) */}
          {(PREFIXskills.length > 0 || (PREFIXtools && PREFIXtools.length > 0)) && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: '1px solid #000', paddingBottom: '4px' }}>Technical Skills</h3>
              <div style={{ fontSize: '0.95em', lineHeight: 1.5 }}>
                {PREFIXskills.length > 0 && (
                  <div style={{ marginBottom: '4px' }}>
                    <strong style={{ marginRight: '8px' }}>Core Skills:</strong>
                    <span>{PREFIXskills.map(s => s.name).join(', ')}</span>
                  </div>
                )}
                {PREFIXtools && PREFIXtools.length > 0 && (
                  <div>
                    <strong style={{ marginRight: '8px' }}>Tools & Software:</strong>
                    <span>{PREFIXtools.map(t => t.name).join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experience */}
          {PREFIXexperience && PREFIXexperience.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: '1px solid #000', paddingBottom: '4px' }}>Experience & Projects</h3>
              {PREFIXexperience.map(exp => (
                <div key={exp.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <strong style={{ fontSize: '1em' }}>{exp.company}</strong>
                    <span style={{ fontSize: '0.95em', fontWeight: 'bold' }}>{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div style={{ fontStyle: 'italic', fontSize: '0.95em', marginBottom: '6px' }}>{exp.role}</div>
                  <div style={{ fontSize: '0.95em', lineHeight: 1.5, paddingLeft: '16px' }}>
                    <ul style={{ margin: 0, padding: 0, listStyleType: 'disc' }}>
                      {exp.description.split('\\n').map((line, idx) => {
                        const cleanLine = line.trim().replace(/^[-•]\s*/, '');
                        if (!cleanLine) return null;
                        return <li key={idx} style={{ marginBottom: '4px' }}>{cleanLine}</li>;
                      })}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* References */}
          {PREFIXreferences && PREFIXreferences.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: '1px solid #000', paddingBottom: '4px' }}>References</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                 {PREFIXreferences.map(ref => (
                   <div key={ref.id} style={{ fontSize: '0.95em' }}>
                     <strong>{ref.name}</strong> — {ref.title}, {ref.company}<br/>
                     {ref.email} | {ref.phone}
                   </div>
                 ))}
              </div>
            </div>
          )}
        </div>
      );
    }
"""
    template_code = template_code.replace("PREFIX", data_prefix)

    ui_selector_code = """
               <div 
                onClick={() => setTemplate('academic')}
                style={{ padding: '16px', border: template === 'academic' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: template === 'academic' ? 'var(--bg-primary)' : 'transparent' }}
               >
                 <h4 style={{ margin: '0 0 4px 0', fontSize: '1em' }}>Academic ATS</h4>
                 <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Structured, classic academic styling with full width sections.</p>
               </div>
"""
    
    # 1. Insert Template logic
    if "if (template === 'minimalist')" in content:
        content = content.replace("if (template === 'minimalist')", template_code + "\n    if (template === 'minimalist')")

    # 2. Insert UI Selector
    # Try looking for creative header to append
    idx = content.find("<h4>Creative</h4>")
    if idx != -1:
         end_idx = content.find("</div>", idx) + 6
         content = content[:end_idx] + ui_selector_code + content[end_idx:]
    else:
         print(f"Warning: Creative block not found in {filename}!")

    with open(filename, 'w') as f:
        f.write(content)


update_file('BuilderPage.tsx', 'data.')
update_file('TailorPage.tsx', 'builderData.')
