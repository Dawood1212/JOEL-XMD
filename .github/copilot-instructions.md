# AI Coding Agent Instructions - JOEL-XMD

**Project:** JOEL-XMD WhatsApp Bot  
**Description:** A modular, feature-rich WhatsApp bot built with Node.js and Baileys library. Designed for extensibility through a plugin-based architecture.

---

## Architecture Overview

### Core Architecture: Plugin-Based WhatsApp Bot

**Key Components:**

1. **Event Handler** (`joelXtec/event/handler.js`)
   - Central message router that intercepts WhatsApp events
   - Loads and executes plugins from `joelXtec/joelXbot/` dynamically
   - Enforces permissions (owner, creator, admins, public/private mode)
   - Extracts command prefix, command name, and arguments

2. **Plugin System** (`joelXtec/joelXbot/*.js`)
   - Each `.js` file is a plugin exporting default async function
   - Function signature: `async (m, sock) => { ... }`
   - `m` = serialized message object (with helpers like `m.React()`, `m.reply()`)
   - `sock` = WhatsApp socket connection (Baileys)
   - **100+ plugins** for features: stickers, downloads, AI, media processing, group mgmt

3. **Utility Layers**
   - `lib/Serializer.js` - Deserializes WhatsApp messages with helper methods
   - `lib/myfunc.cjs` - CommonJS utilities: getBuffer, fetchJson, runtime, clockString
   - `config.cjs` - Centralized configuration (PREFIX, MODE, OWNER_NUMBER, API keys)

4. **Entry Point** (`joeltech.js`)
   - Initializes Baileys WebSocket connection
   - Attaches event listeners (messages, group-updates, call-events)
   - Routes updates to handler via `joelXtec/event/index.js`

---

## Developer Workflows

### Running the Bot

```bash
npm install          # Install dependencies (Baileys, ffmpeg, jimp, axios, etc.)
npm start            # Runs via pm2: pm2 start index.js --name ʝσєℓ-χ∂-ν3
npm stop             # Stops pm2 process
npm restart          # Restarts pm2 process
```

**Environment Setup:**
- Create `.env` file with:
  ```
  SESSION_ID=<pairing_code_from_https://session-site-navy.vercel.app>
  PREFIX=.
  OWNER_NUMBER=255714595078
  MODE=public
  GEMINI_KEY=<your_key>
  ```
- Or set env vars directly (see `config.cjs` for all options)

### Adding a New Command Plugin

1. Create `joelXtec/joelXbot/mycommand.js`
2. **Pattern (see `alive.js`, `help.js`):**
   ```javascript
   import config from '../../config.cjs';
   
   const joel = async (m, sock) => {
     const prefix = config.PREFIX;
     const cmd = m.body.startsWith(prefix)
       ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
       : '';
     
     if (cmd === "mycommand") {
       await m.React('⏳'); // Show loading emoji
       // Logic here
       await m.reply("Response text");
     }
   };
   
   export default joel;
   ```
3. Plugin auto-loads on bot startup (no registration needed)
4. Access permissions via: `m.isCreator`, `m.isAdmins`, `m.isGroup`

### Debugging & Logs

- All console.logs appear in pm2 output: `npm start` or `pm2 logs ʝσєℓ-χ∂-ν3`
- Check `handler.js` line ~65 for plugin-loading error handling
- Message object `m` is logged in handler.js line ~62 for inspection

---

## Project-Specific Patterns & Conventions

### Message Object (m) - Key Methods

- `m.React(emoji)` - React to message with emoji
- `m.reply(text|object)` - Send response
- `m.body` - Message text
- `m.from` - Sender JID
- `m.sender` - Sender number
- `m.isGroup` - Boolean
- `m.isCreator` - Owner/bot check

### File Organization

```
joelXtec/
  joelXbot/          # Command plugins (100+)
  event/
    handler.js       # Plugin loader & permissions
    antilink.js      # Anti-link enforcement
    index.js         # Event router
lib/
  myfunc.cjs         # Utilities (getBuffer, fetchJson, etc.)
  Serializer.js      # Message deserialization + helpers
  converter.cjs      # Media converters
  exif.cjs           # EXIF data handler
```

### Configuration Pattern

All settings centralized in `config.cjs` using environment variables. Access via:
```javascript
import config from '../../config.cjs';
const prefix = config.PREFIX;  // or '.'
const owner = config.OWNER_NUMBER;
```

### Prefix & Command Parsing

- Regex pattern: `/^[\\/!#.]/` (supports multiple prefixes)
- Extraction in `handler.js` lines 38-41
- Each plugin manually checks `cmd` match against its feature

### Multi-Plugin Pattern

Each plugin runs independently in the for-loop (`handler.js` lines 67-78). Plugins can match multiple commands, or conditional logic. Example: `joel1.js` through `joel18.js` are grouped feature collections.

---

## Integration Points & External Dependencies

### Major Libs

- **@whiskeysockets/baileys** - WhatsApp WebSocket (forked from Baileys)
- **fluent-ffmpeg** - Audio/video processing
- **jimp** - Image manipulation
- **tesseract.js** - OCR
- **qrcode** - QR code generation
- **axios** - HTTP requests

### API Integrations (via plugins)

- **Gemini API** (`GEMINI_KEY` in config) - AI responses
- **YouTube DL** (`wasitech` = distube/ytdl-core) - Video downloads
- **Facebook/Instagram DLs** - Third-party scrapers
- **Google Drive** - File interactions

### Data Storage

- **MongoDB** - (implied in deployment docs; not visible in core code)
- **Local JSON** - `mydata/AntiDelete.json`, `mydata/users/`
- **Media cache** - `mydata/media/`

---

## Critical Patterns for AI Agent Productivity

1. **Plugin auto-discovery**: No plugin registry; all `.js` files in `joelXbot/` load dynamically
2. **CommonJS + ESM hybrid**: Core uses ESM imports; `config.cjs` and `lib/*.cjs` are CommonJS
3. **No explicit routing**: Commands are pattern-matched inside each plugin (not a centralized router)
4. **Permission layering**: `isCreator` → `isAdmins` → `isGroup` checks per command
5. **Serializer abstraction**: Raw Baileys messages wrapped with helper methods in Serializer
6. **Utility-first**: Heavy use of `lib/myfunc.cjs` helpers instead of reinventing (getBuffer, fetchJson, etc.)

---

## Common Modification Scenarios

### Changing Bot Behavior
- **Prefix**: Edit `config.cjs` or `PREFIX` env var
- **Auto-features** (auto-read, auto-typing): Toggle `config.AUTO_READ`, `config.AUTO_TYPING`, etc.
- **Private mode**: Set `MODE=private` in config → handler enforces `isCreator` check

### Adding Media Processing
- Use `lib/converter.cjs` or `fluent-ffmpeg` for audio/video
- Chain with axios for remote URL downloads via `lib/myfunc.cjs#getBuffer()`

### Adding External API Calls
- Use `axios` (already in dependencies)
- Examples: Facebook DL plugins (`fb1.js`, `fb2.js`), weather (`wheather.js`)

---

## Reference Files for Understanding Patterns

- **Command plugin template**: `joelXtec/joelXbot/alive.js`, `ping.js`
- **Event system**: `joelXtec/event/handler.js` (permission logic)
- **Utilities**: `lib/myfunc.cjs` (80+ helpers)
- **Config**: `config.cjs` (all toggles and settings)
- **Permission checks**: `handler.js` lines 48-57 (isCreator, isBotAdmins, etc.)

---

**Last Updated:** 2025-11-11
