import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'db.json');

const defaultAdminUsername = process.env.ADMIN_USERNAME || 'admin';
const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
const defaultAdminName = process.env.ADMIN_NAME || 'System Admin';

let cache = null;

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function persist(db) {
  const tempPath = `${dbPath}.tmp`;
  await writeFile(tempPath, JSON.stringify(db, null, 2), 'utf8');
  await rename(tempPath, dbPath);
  cache = db;
}

const DEFAULT_PALANGAL = [
  { activityKey: 'ruling',   relationKey: 'friend', text: 'அனைத்து காரியங்களிலும் முழு வெற்றி கிடைக்கும். சுப காரியங்களுக்கு மிகவும் உகந்த நேரம். தைரியமாக முன்னேறலாம்.' },
  { activityKey: 'ruling',   relationKey: 'same',   text: 'சாதாரண பலன் கிடைக்கும். வழக்கமான காரியங்கள் செய்யலாம். முக்கிய முடிவுகள் சற்று தள்ளி வைக்கவும்.' },
  { activityKey: 'ruling',   relationKey: 'enemy',  text: 'தடைகளும் எதிர்ப்புகளும் உண்டாகும். காரியங்கள் தாமதமாகும். பொறுமையுடன் காத்திருக்கவும்.' },
  { activityKey: 'eating',   relationKey: 'friend', text: 'நல்ல பலன் கிடைக்கும். உணவு, வியாபாரம் சம்பந்தமான காரியங்களுக்கு ஏற்ற நேரம். ஆதாயம் உண்டாகும்.' },
  { activityKey: 'eating',   relationKey: 'same',   text: 'சாதாரண பலன். அன்றாட தேவையான காரியங்கள் மட்டும் செய்யவும். புதிய முயற்சிகள் பின்னர் தொடங்கலாம்.' },
  { activityKey: 'eating',   relationKey: 'enemy',  text: 'இழப்புகள் உண்டாகலாம். பணம் சம்பந்தமான காரியங்கள் தவிர்க்கவும். கவனமாக இருக்கவும்.' },
  { activityKey: 'walking',  relationKey: 'friend', text: 'பயணம், தொழில் காரியங்களுக்கு நல்ல நேரம். நடைப்பயிற்சி, சந்திப்புகள் சாதகமாக அமையும். வெற்றி நிச்சயம்.' },
  { activityKey: 'walking',  relationKey: 'same',   text: 'சாதாரண பலன். நடை மற்றும் வழக்கமான காரியங்கள் செய்யலாம். பெரிய முயற்சிகள் தேவையில்லை.' },
  { activityKey: 'walking',  relationKey: 'enemy',  text: 'பயணம் தவிர்க்கவும். எதிர்ப்புகளும் தடைகளும் வரலாம். முக்கிய காரியங்கள் மற்றொரு நேரத்தில் செய்யவும்.' },
  { activityKey: 'sleeping', relationKey: 'friend', text: 'ஓய்வு எடுக்க உகந்த நேரம். தியானம், ஆன்மீக சாதனைகளுக்கு ஏற்றது. அவசர காரியங்கள் தவிர்க்கவும்.' },
  { activityKey: 'sleeping', relationKey: 'same',   text: 'சாதாரண நேரம். ஓய்வு மற்றும் வழக்கமான காரியங்கள் செய்யலாம். முக்கிய செயல்கள் இப்போது வேண்டாம்.' },
  { activityKey: 'sleeping', relationKey: 'enemy',  text: 'முக்கிய காரியங்கள் தொடங்க வேண்டாம். உடல் நலத்தில் கவனம் தேவை. ஓய்வெடுத்து அடுத்த நேரம் காக்கவும்.' },
  { activityKey: 'dying',    relationKey: 'friend', text: 'கவனமாக இருக்கவும். புதிய காரியங்கள் தொடங்க வேண்டாம். ஆன்மீக பிரார்த்தனை செய்வது நலம்.' },
  { activityKey: 'dying',    relationKey: 'same',   text: 'மிகவும் கவனம் தேவை. முக்கிய காரியங்கள் கண்டிப்பாக தவிர்க்கவும். இந்த நேரம் கடந்து செல்லட்டும்.' },
  { activityKey: 'dying',    relationKey: 'enemy',  text: 'மிகவும் அசுபமான நேரம். எந்த புதிய செயலும் தொடங்காதீர்கள். இறைவனை வேண்டிக்கொண்டு ஓய்வெடுக்கவும்.' },
];

export async function loadDb() {
  if (cache) return cache;

  await mkdir(dataDir, { recursive: true });

  let db = { users: [], palangal: [], settings: { branding: null } };
  if (existsSync(dbPath)) {
    try {
      const raw = await readFile(dbPath, 'utf8');
      const parsed = JSON.parse(raw);
      db = {
        users: Array.isArray(parsed.users) ? parsed.users : [],
        palangal: Array.isArray(parsed.palangal) ? parsed.palangal : [],
        settings: parsed.settings || { branding: null },
      };
    } catch {
      db = { users: [], palangal: [] };
    }
  }

  // Seed default admin
  if (!db.users.some((u) => u.role === 'admin')) {
    db.users.push({
      id: crypto.randomUUID(),
      username: defaultAdminUsername,
      name: defaultAdminName,
      role: 'admin',
      active: true,
      defaultPlace: null,
      passwordHash: bcrypt.hashSync(defaultAdminPassword, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  // Seed default global branding
  if (!db.settings.branding) {
    db.settings.branding = {
      astrologerName: 'Sri Vinayaga Astro',
      companyName: 'Astro Services',
      mobile: '+91 98765 43210',
      whatsapp: '+91 98765 43210',
      website: 'www.srivinayagaastro.com',
      socialMedia: [
        { platform: 'Facebook', url: '#' },
        { platform: 'Instagram', url: '#' }
      ],
      address: '123, Celestial Way, Tamil Nadu',
    };
  }

  // Seed default palangal (fill in missing combinations)
  for (const def of DEFAULT_PALANGAL) {
    const exists = db.palangal.some(
      (p) => p.activityKey === def.activityKey && p.relationKey === def.relationKey,
    );
    if (!exists) {
      db.palangal.push({
        id: crypto.randomUUID(),
        activityKey: def.activityKey,
        relationKey: def.relationKey,
        text: def.text,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  await persist(db);
  return db;
}

// ── Users ────────────────────────────────────────
export async function getUsers() {
  const db = await loadDb();
  return db.users.map(sanitizeUser);
}

export async function findUserByUsername(username) {
  const db = await loadDb();
  return db.users.find(
    (u) => u.username.toLowerCase() === String(username || '').toLowerCase(),
  ) || null;
}

export async function findUserById(id) {
  const db = await loadDb();
  return db.users.find((u) => u.id === id) || null;
}

export async function authenticateUser(username, password) {
  const user = await findUserByUsername(username);
  if (!user || !user.active) return null;
  const matches = bcrypt.compareSync(String(password || ''), user.passwordHash);
  return matches ? sanitizeUser(user) : null;
}

export async function createUser({ 
  username, 
  name, 
  password, 
  role = 'user', 
  active = true,
  userType = 'demo',
  demoConfig = null,
  subscriptionConfig = null
}) {
  const db = await loadDb();
  const normalizedUsername = String(username || '').trim();
  if (!normalizedUsername) throw new Error('Username is required');
  if (db.users.some((u) => u.username.toLowerCase() === normalizedUsername.toLowerCase())) {
    throw new Error('Username already exists');
  }

  const user = {
    id: crypto.randomUUID(),
    username: normalizedUsername,
    name: String(name || '').trim() || normalizedUsername,
    role,
    userType,
    active: Boolean(active),
    defaultPlace: null,
    passwordHash: bcrypt.hashSync(String(password || ''), 10),
    demoConfig: demoConfig || {
      maxGenerations: 10,
      maxDownloads: 5,
      maxNallaNeram: 5,
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    subscriptionConfig: subscriptionConfig || {
      features: ['panchaPakshi'],
    },
    branding: {
      customEnabled: false,
      requestStatus: 'none',
      astrologerName: '',
      companyName: '',
      mobile: '',
      whatsapp: '',
      website: '',
      socialMedia: [],
      address: '',
    },
    usageStats: {
      generationsCount: 0,
      downloadsCount: 0,
      nallaNeramCount: 0,
      lastLocations: [],
      lastUsedAt: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(user);
  await persist(db);
  return sanitizeUser(user);
}

export async function updateUser(id, patch) {
  const db = await loadDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) return null;

  if (typeof patch.username === 'string') {
    const next = patch.username.trim();
    if (!next) throw new Error('Username is required');
    const conflict = db.users.find(
      (u) => u.id !== id && u.username.toLowerCase() === next.toLowerCase(),
    );
    if (conflict) throw new Error('Username already exists');
    user.username = next;
  }
  if (typeof patch.name === 'string') user.name = patch.name.trim() || user.name;
  if (typeof patch.role === 'string') user.role = patch.role;
  if (typeof patch.userType === 'string') user.userType = patch.userType;
  if (typeof patch.active === 'boolean') user.active = patch.active;
  if (Object.prototype.hasOwnProperty.call(patch, 'defaultPlace')) user.defaultPlace = patch.defaultPlace;
  if (patch.demoConfig) user.demoConfig = { ...(user.demoConfig || {}), ...patch.demoConfig };
  if (patch.subscriptionConfig) user.subscriptionConfig = { ...(user.subscriptionConfig || {}), ...patch.subscriptionConfig };
  if (patch.branding) user.branding = { ...(user.branding || {}), ...patch.branding };
  
  if (typeof patch.password === 'string' && patch.password.length > 0) {
    user.passwordHash = bcrypt.hashSync(patch.password, 10);
  }

  user.updatedAt = new Date().toISOString();
  await persist(db);
  return sanitizeUser(user);
}

export async function recordUsage(userId, { type, location }) {
  const db = await loadDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return null;

  if (!user.usageStats) {
    user.usageStats = {
      generationsCount: 0,
      downloadsCount: 0,
      nallaNeramCount: 0,
      lastLocations: [],
      locationFrequency: {}, // Added to track major search locations
      lastUsedAt: null,
    };
  }

  if (type === 'generation') user.usageStats.generationsCount++;
  if (type === 'download') user.usageStats.downloadsCount++;
  if (type === 'nallaNeram') user.usageStats.nallaNeramCount++;

  if (location) {
    // 1. Maintain detailed history (Extended to 100)
    user.usageStats.lastLocations.unshift({
      name: location,
      type, // Track which feature was used for this location
      timestamp: new Date().toISOString(),
    });
    if (user.usageStats.lastLocations.length > 100) {
      user.usageStats.lastLocations.pop();
    }

    // 2. Track location frequency (Pro information about major searches)
    if (!user.usageStats.locationFrequency) user.usageStats.locationFrequency = {};
    const freq = user.usageStats.locationFrequency[location] || 0;
    user.usageStats.locationFrequency[location] = freq + 1;
  }

  user.usageStats.lastUsedAt = new Date().toISOString();
  await persist(db);
  return sanitizeUser(user);
}

export async function setUserDefaultPlace(id, defaultPlace) {
  return updateUser(id, { defaultPlace });
}

export function sanitizeCurrentUser(user) {
  return sanitizeUser(user);
}

// ── Palangal ─────────────────────────────────────
export async function getPalangal() {
  const db = await loadDb();
  return db.palangal;
}

export async function createPalangal({ activityKey, relationKey, effectKey, birdId, yamaIndex, subIndex, text }) {
  const db = await loadDb();
  const entry = {
    id: crypto.randomUUID(),
    activityKey,
    relationKey,
    effectKey: effectKey || null,
    birdId: birdId ? Number(birdId) : null,
    yamaIndex: yamaIndex ? Number(yamaIndex) : null,
    subIndex: subIndex ? Number(subIndex) : null,
    text: String(text || '').trim(),
    updatedAt: new Date().toISOString(),
  };
  db.palangal.push(entry);
  await persist(db);
  return entry;
}

export async function updatePalangal(id, patch) {
  const db = await loadDb();
  const entry = db.palangal.find((p) => p.id === id);
  if (!entry) return null;

  if (typeof patch.text === 'string') entry.text = patch.text.trim();
  if (typeof patch.activityKey === 'string') entry.activityKey = patch.activityKey;
  if (typeof patch.relationKey === 'string') entry.relationKey = patch.relationKey;
  if (Object.prototype.hasOwnProperty.call(patch, 'effectKey')) entry.effectKey = patch.effectKey;
  if (Object.prototype.hasOwnProperty.call(patch, 'birdId')) entry.birdId = patch.birdId ? Number(patch.birdId) : null;
  if (Object.prototype.hasOwnProperty.call(patch, 'yamaIndex')) entry.yamaIndex = patch.yamaIndex ? Number(patch.yamaIndex) : null;
  if (Object.prototype.hasOwnProperty.call(patch, 'subIndex')) entry.subIndex = patch.subIndex ? Number(patch.subIndex) : null;

  entry.updatedAt = new Date().toISOString();
  await persist(db);
  return entry;
}

export async function deletePalangal(id) {
  const db = await loadDb();
  const initialLength = db.palangal.length;
  db.palangal = db.palangal.filter((p) => p.id !== id);
  if (db.palangal.length !== initialLength) {
    await persist(db);
    return true;
  }
  return false;
}

// ── Settings ─────────────────────────────────────
export async function getSettings() {
  const db = await loadDb();
  return db.settings;
}

export async function updateSettings(patch) {
  const db = await loadDb();
  db.settings = { ...db.settings, ...patch };
  await persist(db);
  return db.settings;
}
