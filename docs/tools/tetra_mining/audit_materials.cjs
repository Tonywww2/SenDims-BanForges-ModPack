const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../../..');
const python = process.env.PYTHON || 'C:/ProgramData/Anaconda3/python.exe';
const native = JSON.parse(execFileSync(python, ['-X', 'utf8', '-c', `
from pathlib import Path
import json,zipfile
records={}
for jar in sorted(Path('mods').glob('*.jar')):
    try:
        with zipfile.ZipFile(jar) as z:
            for name in z.namelist():
                if name.startswith('data/tetra/materials/') and name.endswith('.json'):
                    try:value=json.loads(z.read(name))
                    except (ValueError,UnicodeError):continue
                    if isinstance(value,dict):records[name]={'resource':name,'source':jar.name,'stage':None,'data':value}
    except zipfile.BadZipFile:pass
for file in Path('kubejs/data/tetra/materials').rglob('*.json'):
    name='data/tetra/materials/'+file.relative_to('kubejs/data/tetra/materials').as_posix()
    records[name]={'resource':name,'source':str(file),'stage':None,'data':json.loads(file.read_text(encoding='utf-8'))}
print(json.dumps(list(records.values())))
`], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }));
const materials = new Map(native.map(record => [record.resource, record]));
let source, stage;
const context = vm.createContext({
    console: { log() {} },
    ServerEvents: { highPriorityData: callback => callback({ addJson: (id, data) => {
        if (!id.startsWith('tetra:materials/')) return;
        const resource = 'data/tetra/' + id.slice('tetra:'.length);
        materials.set(resource, { resource, source, stage, data });
    } }) }
});
vm.runInContext(fs.readFileSync(path.join(root, 'kubejs/server_scripts/tetra/tetra_builder.js'), 'utf8'), context);
for (let index = 1; index <= 6; index++) {
    stage = index <= 5 ? index : null;
    source = 'kubejs/server_scripts/tetra/' + (stage ? `s${stage}_tetras.js` : 'special_material.js');
    vm.runInContext(fs.readFileSync(path.join(root, source), 'utf8'), context, { filename: source });
}
const records = [...materials.values()];
const summary = [null,1,2,3,4,5].map(stage => {
    const entries = records.filter(record => record.stage === stage);
    const values = property => entries.map(record => Number(record.data[property] || 0)).sort((a,b) => a-b);
    const stats = property => { const list = values(property); return { min:list[0], median:list[Math.floor(list.length/2)], max:list.at(-1) }; };
    return { stage, count: entries.length, primary:stats('primary'), secondary:stats('secondary'), tertiary:stats('tertiary'), toolEfficiency:stats('toolEfficiency') };
});
const out = path.join(root, 'docs/archive/tetra-mining-2026-11-02');
fs.mkdirSync(out, { recursive:true });
fs.writeFileSync(path.join(out, 'material-audit.json'), JSON.stringify({ records, summary }, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
module.exports = { root, records, summary };
