import re

with open('BuilderPage.tsx', 'r') as f:
    content = f.read()

# 1. Update initialResumeData
content = re.sub(
    r"skills: \[\n\s+{ id: '1', name: 'React' },\n\s+{ id: '2', name: 'TypeScript' },\n\s+{ id: '3', name: 'Node.js' }\n\s+\]",
    "skills: [\n    { id: '1', name: 'React' },\n    { id: '2', name: 'TypeScript' },\n    { id: '3', name: 'Node.js' }\n  ],\n  tools: [\n    { id: '1', name: 'Photoshop', percentage: 90 },\n    { id: '2', name: 'Illustrator', percentage: 85 }\n  ],\n  references: [\n    { id: '1', name: 'Kyrie Petrakis', title: 'VP, Liceria & Co.', company: 'Liceria & Co.', email: 'hello@reallygreatsite.com', phone: '+123-456-7890' }\n  ]",
    content
)

# 2. Add methods
methods_str = """
  const addTool = () => {
    setData({
      ...data,
      tools: [...(data.tools || []), { id: Date.now().toString(), name: '', percentage: 50 }]
    });
  };

  const updateTool = (id: string, field: 'name' | 'percentage', value: string | number) => {
    setData({
      ...data,
      tools: (data.tools || []).map(tool => tool.id === id ? { ...tool, [field]: value } : tool)
    });
  };

  const removeTool = (id: string) => {
    setData({
      ...data,
      tools: (data.tools || []).filter(tool => tool.id !== id)
    });
  };

  const addReference = () => {
    setData({
      ...data,
      references: [...(data.references || []), { id: Date.now().toString(), name: '', title: '', company: '', email: '', phone: '' }]
    });
  };

  const updateReference = (id: string, field: 'name' | 'title' | 'company' | 'email' | 'phone', value: string) => {
    setData({
      ...data,
      references: (data.references || []).map(ref => ref.id === id ? { ...ref, [field]: value } : ref)
    });
  };

  const removeReference = (id: string) => {
    setData({
      ...data,
      references: (data.references || []).filter(ref => ref.id !== id)
    });
  };
"""

content = content.replace("  // Helper to calculate basic quality metrics score", methods_str + "\n  // Helper to calculate basic quality metrics score")

# 3. Add PhotoUrl field in Personal Info UI
photo_ui = """
                <input 
                  type="text" 
                  placeholder="Profile Photo URL (Optional)" 
                  className="premium-input"
                  value={data.personalInfo.photoUrl || ''}
                  onChange={e => setData({...data, personalInfo: {...data.personalInfo, photoUrl: e.target.value}})}
                />
"""
content = content.replace(
    '<input \n                  type="text" \n                  placeholder="Job Title"',
    photo_ui.strip() + '\n                <input \n                  type="text" \n                  placeholder="Job Title"'
)

# 4. Add Tools UI
tools_ui = """
              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Tools & Software</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {(data.tools || []).map(tool => (
                  <div key={tool.id} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
                    <input type="text" placeholder="Tool Name" className="premium-input" value={tool.name} onChange={e => updateTool(tool.id, 'name', e.target.value)} style={{ flex: 1 }} />
                    <input type="number" placeholder="80" className="premium-input" value={tool.percentage} onChange={e => updateTool(tool.id, 'percentage', parseInt(e.target.value) || 0)} style={{ width: '80px' }} min="0" max="100" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>%</span>
                    <button onClick={() => removeTool(tool.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div onClick={addTool} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Tool
              </div>
"""

content = content.replace("              </motion.div>\n          )}\n\n          {activeTab === 'templates'", tools_ui + "\n              </motion.div>\n          )}\n\n          {activeTab === 'templates'")

# 5. Add References UI
references_ui = """
              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>References</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                {(data.references || []).map(ref => (
                  <div key={ref.id} className="premium-card" style={{ padding: '16px', position: 'relative' }}>
                    <button onClick={() => removeReference(ref.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="text" placeholder="Name" className="premium-input" value={ref.name} onChange={e => updateReference(ref.id, 'name', e.target.value)} />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" placeholder="Title" className="premium-input" value={ref.title} onChange={e => updateReference(ref.id, 'title', e.target.value)} />
                        <input type="text" placeholder="Company" className="premium-input" value={ref.company} onChange={e => updateReference(ref.id, 'company', e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="email" placeholder="Email" className="premium-input" value={ref.email} onChange={e => updateReference(ref.id, 'email', e.target.value)} />
                        <input type="text" placeholder="Phone" className="premium-input" value={ref.phone} onChange={e => updateReference(ref.id, 'phone', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={addReference} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Reference
              </div>
"""

content = content.replace("              </motion.div>\n          )}\n\n          {activeTab === 'templates'", references_ui + "\n              </motion.div>\n          )}\n\n          {activeTab === 'templates'")


with open('BuilderPage.tsx', 'w') as f:
    f.write(content)
