# Developer Utility Scripts

This directory contains development-time helper scripts and scratchpad files. They are NOT part of the runtime production code (which is built using React/TypeScript on the client and Express/TypeScript on the server). 

These scripts were created to automate modifications, perform testing, and template-based refactoring of frontend components during the development phase.

## File Descriptions

* **`update_builder.py`**: A python automation script used to inject common handlers (like `addProject`, `addSoftSkill`, `addLanguage`, etc.) and new input sections (like Projects, Soft Skills, Certifications) into `BuilderPage.tsx` and `TailorPage.tsx`.
* **`add_academic.py`**: A python script used to append the academic resume layout fields and inputs dynamically.
* **`modify_builder.py` / `modify_tailor.py`**: Python script helpers for updating and matching states in the builder and tailor pages.
* **`replace_tailor.py` / `replace_template.py`**: Utility scripts to replace specific CSS, elements, or Tailwind variables within the TaylorPage and templates structure.
* **`test-parser.js`**: Node.js script used to test the backend resume parsing mechanism locally.
* **`scratch.js`**: General scratchpad for experimenting with small javascript utility snippets.
