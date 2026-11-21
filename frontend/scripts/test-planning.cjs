const fs = require('fs'), path = require('path'), assert = require('node:assert/strict'), ts = require('typescript');
function load(relative, deps = {}) {
  const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', js)(name => { if (deps[name]) return deps[name]; throw new Error('Unexpected import ' + name); }, module, module.exports);
  return module.exports;
}
const types = load('src/types/timetable.ts');
const { checkTimetableConflicts: check } = load('src/lib/timetable-checker.ts', { '@/types/timetable': types });
const { computeTimetableStats: stats } = load('src/data/timetable-mock.ts', { '@/types/timetable': types });
const fixture = () => ({ campuses: [{ id: 'c1' }, { id: 'c2' }], salles: [{ id: 'r1', campusId: 'c1', codeSalle: 'Salle 1', typeSalle: 'LI_PC', capacite: 30, nombrePcOperationnels: 30, estDisponible: true }], groupes: [{ id: 'g1', campusFixeId: 'c1', codeGroupe: 'G1', effectif: 25 }], enseignants: [{ id: 't1', nom: 'Test', prenom: 'Compte', estActif: true, typeContrat: 'PERMANENT', disponibilites: [] }], elements: [{ id: 'e1', necessitePc: true, typeSalleRequis: 'LI_PC', intitule: 'TP' }], seances: [{ id: 's1', salleId: 'r1', groupeId: 'g1', enseignantId: 't1', elementModuleId: 'e1', jourSemaine: 'LUNDI', numeroCreneau: 'S1_08H30', spanSeances: 2, statutAffectation: 'MANUEL' }] });
let count = 0;
const test = (name, fn) => { fn(); count++; console.log('PASS ' + name); };
test('Affectation valide', () => assert.equal(check(fixture()).estConforme, true));
test('Chevauchement au deuxième créneau', () => { const c = fixture(); c.seances.push({ ...c.seances[0], id: 's2', numeroCreneau: 'S2_10H15', spanSeances: 1 }); assert.equal(check(c).conflits.filter(x => x.type.endsWith('DOUBLE_BOOKING')).length, 3); });
test('Postes insuffisants malgré la capacité', () => { const c = fixture(); c.salles[0].nombrePcOperationnels = 10; assert.ok(check(c).conflits.some(x => x.type === 'TP_PC_MISMATCH')); });
test('Campus fixe même avec une seule séance', () => { const c = fixture(); c.salles[0].campusId = 'c2'; assert.ok(check(c).conflits.some(x => x.type === 'CAMPUS_HOP_SAME_DAY')); });
test('Référence manquante', () => { const c = fixture(); c.salles = []; assert.ok(check(c).conflits.some(x => x.type === 'INVALID_REFERENCE')); });
test('Disponibilité sur toute la durée', () => { const c = fixture(); c.enseignants[0].disponibilites = [{ jour: 'LUNDI', creneaux: ['S1_08H30'] }]; assert.ok(check(c).conflits.some(x => x.type === 'TEACHER_UNAVAILABLE')); });
test('Fin après le dernier créneau refusée', () => { const c = fixture(); c.seances[0].numeroCreneau = 'S6_17H15'; assert.ok(check(c).conflits.some(x => x.type === 'INVALID_REFERENCE')); });
test('Laboratoire réseaux distinct des PC', () => { const c = fixture(); c.elements[0].typeSalleRequis = 'LR_RESEAUX'; assert.ok(check(c).conflits.some(x => x.type === 'TP_PC_MISMATCH')); });
test('Salle indisponible', () => { const c = fixture(); c.salles[0].estDisponible = false; assert.equal(check(c).estConforme, false); });
test('Durée dans le taux d’occupation', () => { const c = fixture(); assert.equal(stats(c.campuses, c.salles, c.enseignants, [], c.groupes, c.seances).tauxOccupationSallesPct, 5.6); });
test('Collision sans double comptage physique', () => { const c = fixture(); c.seances.push({ ...c.seances[0], id: 's2' }); assert.equal(stats(c.campuses, c.salles, c.enseignants, [], c.groupes, c.seances).tauxOccupationSallesPct, 5.6); });
test('Données non modifiées par le contrôle', () => { const c = fixture(), before = JSON.stringify(c); check(c); assert.equal(JSON.stringify(c), before); });
console.log(count + ' contrôles de planification réussis.');
