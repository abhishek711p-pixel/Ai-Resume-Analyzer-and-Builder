import re

with open('BuilderPage.tsx', 'r') as f:
    content = f.read()

fallback_regex = re.compile(
    r"return \(\s*<div style={{ \.\.\.wrapperStyle, background: '#f8f9fa' }}>.*?\s*</div >\s*\);\s*};", 
    re.DOTALL
)

new_template = """return (
      <div style={{ ...wrapperStyle, padding: 0, display: 'flex', background: '#fff' }}>
        {/* Left Column */}
        <div style={{ width: '35%', background: style.themeColor, color: '#fff', padding: '40px 30px', boxSizing: 'border-box' }}>
          {/* Profile Photo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px' }}>
              {data.personalInfo.photoUrl ? (
                <img src={data.personalInfo.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#eee' }}></div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>Contact</h3>
            <div style={{ fontSize: '0.9em', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.themeColor, fontSize: '12px' }}>📞</span>
                <span>{data.personalInfo.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.themeColor, fontSize: '12px' }}>✉️</span>
                <span style={{ wordBreak: 'break-all' }}>{data.personalInfo.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.themeColor, fontSize: '12px' }}>📍</span>
                <span>{data.personalInfo.location}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>Skills</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em' }}>
              {data.skills.map(skill => (
                <li key={skill.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></span>
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          {(data.tools && data.tools.length > 0) && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>Tools</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9em' }}>
                {data.tools.map(tool => (
                  <div key={tool.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>{tool.name}</span>
                      <span>{tool.percentage}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${tool.percentage}%`, background: '#fff', borderRadius: '3px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ width: '65%', padding: '40px', boxSizing: 'border-box' }}>
          {/* Header */}
          <div style={{ borderTop: '4px solid #333', borderBottom: '4px solid #333', padding: '20px 0', marginBottom: '30px' }}>
            <h1 style={{ margin: '0', fontSize: '3em', letterSpacing: '2px', color: '#333', textTransform: 'uppercase', lineHeight: 1.1 }}>
              {data.personalInfo.fullName.split(' ')[0]} <span style={{ fontWeight: 300 }}>{data.personalInfo.fullName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <h2 style={{ margin: '10px 0 0 0', fontSize: '1.4em', letterSpacing: '4px', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
              {data.personalInfo.jobTitle}
            </h2>
          </div>

          {/* Profile Summary */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '12px' }}>Profile Info</h3>
            <p style={{ margin: 0, color: '#555', lineHeight: 1.6, fontSize: '0.95em' }}>
              {data.personalInfo.summary}
            </p>
          </div>

          {/* Education */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Education</h3>
            {data.education.map(edu => (
              <div key={edu.id} style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '20px', height: '20px', background: '#333', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>&gt;</div>
                    <strong style={{ fontSize: '1.1em', color: '#333' }}>{edu.degree} in {edu.fieldOfStudy}</strong>
                  </div>
                  <div style={{ color: '#666', marginLeft: '28px', fontStyle: 'italic', fontSize: '0.9em' }}>{edu.institution}</div>
                </div>
                <div style={{ width: '100px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>{edu.graduationDate}</div>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Experience</h3>
            {data.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', background: '#333', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>&gt;</div>
                      <strong style={{ fontSize: '1.1em', color: '#333' }}>{exp.role}</strong>
                    </div>
                    <div style={{ color: '#666', marginLeft: '28px', fontStyle: 'italic', fontSize: '0.9em' }}>{exp.company}</div>
                  </div>
                  <div style={{ width: '140px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>{exp.startDate} - {exp.endDate}</div>
                </div>
                <div style={{ marginLeft: '28px', color: '#555', fontSize: '0.9em', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {exp.description}
                </div>
              </div>
            ))}
          </div>

          {/* References */}
          {(data.references && data.references.length > 0) && (
            <div>
              <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Reference</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {data.references.map(ref => (
                  <div key={ref.id} style={{ flex: '1 1 calc(50% - 10px)', display: 'flex', gap: '8px', fontSize: '0.9em' }}>
                    <div style={{ width: '6px', height: '6px', background: '#333', borderRadius: '50%', marginTop: '6px' }}></div>
                    <div>
                      <strong style={{ display: 'block', color: '#333' }}>{ref.name} - {ref.title}, {ref.company}</strong>
                      <div style={{ color: '#666' }}>{ref.email}</div>
                      <div style={{ color: '#666' }}>{ref.phone}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };"""

content = re.sub(
    r"return \(\s*<div style={{ \.\.\.wrapperStyle, background: '#f8f9fa' }}>.*?</div>\s*\);\s*};",
    new_template,
    content,
    flags=re.DOTALL
)

with open('BuilderPage.tsx', 'w') as f:
    f.write(content)
