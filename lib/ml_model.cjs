const fs = require('fs');
const path = require('path');
const Markov = require('markov-strings').default || require('markov-strings');

const DATA_PATH = path.join(__dirname, '..', 'mydata', 'ml_corpus.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, JSON.stringify({ corpus: [], autolearn: false }, null, 2));
}

function load() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { corpus: [], autolearn: false };
  }
}

function save(data) {
  ensureDataFile();
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

async function trainModel() {
  const data = load();
  const corpus = data.corpus.map(t => ({ string: t }));
  if (!corpus.length) return null;
  const markov = new Markov({
    stateSize: 2
  });
  await markov.buildCorpus(corpus);
  return markov;
}

function addToCorpus(text) {
  if (!text || typeof text !== 'string') return false;
  const data = load();
  data.corpus.push(text);
  save(data);
  return true;
}

function setAutoLearn(val) {
  const data = load();
  data.autolearn = !!val;
  save(data);
  return data.autolearn;
}

function getAutoLearn() {
  return !!load().autolearn;
}

function getCorpusSize() {
  return load().corpus.length;
}

module.exports = {
  trainModel,
  addToCorpus,
  setAutoLearn,
  getAutoLearn,
  getCorpusSize,
  load,
};
