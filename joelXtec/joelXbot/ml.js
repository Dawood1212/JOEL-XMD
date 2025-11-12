import config from '../../config.cjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ml = require('../../lib/ml_model.cjs');

const PREFIX = config.PREFIX || '.';

const joel = async (m, sock) => {
  try {
    const prefix = PREFIX;
    const isCmd = m.body && m.body.startsWith(prefix);
    const body = m.body || '';
    const cmd = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
    const args = isCmd ? body.slice(prefix.length).trim().split(' ').slice(1) : [];

    // Commands: learn, train, gen, autolearn, mlinfo
    if (cmd === 'learn') {
      await m.React('⏳');
      // Accept either replied-to message or args joined
      let text = '';
      if (m.quoted && m.quoted.text) text = m.quoted.text;
      else text = args.join(' ');
      if (!text) return await m.reply('Usage: ' + prefix + 'learn <text>  (or reply to a message with ' + prefix + 'learn)');
      // simple length checks
      if (text.length < 6) return await m.reply('Text too short to learn (min 6 chars).');
      ml.addToCorpus(text);
      await m.reply('Learned ✅ (corpus size: ' + ml.getCorpusSize() + ')');
      return;
    }

    if (cmd === 'train') {
      await m.React('⏳');
      const model = await ml.trainModel();
      if (!model) return await m.reply('Not enough data to train. Use ' + prefix + 'learn to add samples.');
      await m.reply('Model trained. Corpus size: ' + ml.getCorpusSize());
      return;
    }

    if (cmd === 'gen' || cmd === 'generate') {
      await m.React('⏳');
      const model = await ml.trainModel();
      if (!model) return await m.reply('Not enough data to generate. Add some samples first with ' + prefix + 'learn.');
      try {
        const result = model.generate({
          maxTries: 100,
          filter: (r) => r.string && r.string.length >= 10 && r.string.length <= 1000
        });
        await m.reply(result.string);
      } catch (e) {
        await m.reply('Failed to generate text: ' + (e.message || e));
      }
      return;
    }

    if (cmd === 'autolearn') {
      await m.React('⏳');
      const sub = args[0] ? args[0].toLowerCase() : '';
      if (sub === 'on') {
        ml.setAutoLearn(true);
        await m.reply('Auto-learn is ON');
        return;
      }
      if (sub === 'off') {
        ml.setAutoLearn(false);
        await m.reply('Auto-learn is OFF');
        return;
      }
      await m.reply('Usage: ' + prefix + 'autolearn <on|off> (default is off)');
      return;
    }

    if (cmd === 'mlinfo') {
      await m.React('ℹ️');
      const size = ml.getCorpusSize();
      const aut = ml.getAutoLearn() ? 'ON' : 'OFF';
      await m.reply('ML info:\n- Corpus size: ' + size + '\n- Auto-learn: ' + aut);
      return;
    }

    // If not a direct command, use autolearn if enabled
    if (!isCmd) {
      try {
        if (ml.getAutoLearn()) {
          const text = m.body || (m.quoted && m.quoted.text) || '';
          if (text && text.length >= 12 && text.length <= 1000) {
            // avoid learning commands or bot messages heuristically
            const lower = text.toLowerCase();
            if (lower.includes('http') || lower.startsWith(PREFIX)) return;
            ml.addToCorpus(text);
          }
        }
      } catch (e) {
        // swallow errors to avoid breaking the handler
        console.error('ml autolearn error', e);
      }
    }
  } catch (err) {
    console.error('ml plugin error', err);
  }
};

export default joel;
