import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';
import jwt from 'jsonwebtoken';
import dns from 'node:dns';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  authenticateUser,
  createUser,
  findUserById,
  getUsers,
  getPalangal,
  createPalangal,
  updatePalangal,
  deletePalangal,
  sanitizeCurrentUser,
  setUserDefaultPlace,
  updateUser,
} from './lib/db.js';
import { buildPanchaPakshiSchedule, ensurePanchaPakshiDataLoaded, searchPlaces, getBirdIdFromName } from './lib/panchaPakshi.js';
import { birdOptions } from '../shared/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'neram-dev-secret';
const COOKIE_NAME = 'neram_token';

dns.setDefaultResultOrder('ipv4first');

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
}

function getTokenFromRequest(req) {
  return req.cookies?.[COOKIE_NAME] || null;
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.currentUser || !roles.includes(req.currentUser.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  };
}

function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function parseBoolean(value) {
  return value === true || value === 'true' || value === '1' || value === 1;
}

const requireUser = asyncRoute(async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(payload.sub);
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    req.currentUser = sanitizeCurrentUser(user);
    return next();
  } catch {
    return res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get(
  '/api/health',
  asyncRoute(async (_req, res) => {
    const data = await ensurePanchaPakshiDataLoaded();
    res.json({
      ok: true,
      data,
    });
  }),
);

app.get(
  '/api/auth/me',
  asyncRoute(async (req, res) => {
    try {
      const token = getTokenFromRequest(req);
      if (!token) {
        return res.json({ user: null });
      }

      const payload = jwt.verify(token, JWT_SECRET);
      const user = await findUserById(payload.sub);
      if (!user || !user.active) {
        return res.json({ user: null });
      }

      return res.json({ user: sanitizeCurrentUser(user) });
    } catch {
      return res.json({ user: null });
    }
  }),
);

app.post(
  '/api/auth/login',
  asyncRoute(async (req, res) => {
    const { username, password } = req.body || {};
    const user = await authenticateUser(username, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.cookie(COOKIE_NAME, signToken(user), {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ user });
  }),
);

app.post(
  '/api/auth/logout',
  asyncRoute(async (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  }),
);

app.get(
  '/api/places',
  asyncRoute(async (req, res) => {
    const results = await searchPlaces(req.query.q);
    res.json({ results });
  }),
);

app.get(
  '/api/name-bird',
  asyncRoute(async (req, res) => {
    const name = String(req.query.name || '').trim();
    if (!name) return res.json({ birdId: null, bird: null });
    const birdId = getBirdIdFromName(name);
    const bird = birdId ? birdOptions.find(b => b.id === birdId) ?? null : null;
    res.json({ birdId, bird });
  }),
);

app.post(
  '/api/prediction',
  requireUser,
  asyncRoute(async (req, res) => {
    const {
      date,
      place,
      birdId,
      pakshaMode = 'auto',
      saveDefaultPlace = false,
    } = req.body || {};

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const selectedPlace = place || req.currentUser.defaultPlace;
    if (!selectedPlace?.latitude || !selectedPlace?.longitude) {
      return res.status(400).json({ error: 'Place is required' });
    }

    const schedule = await buildPanchaPakshiSchedule({
      date,
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      timezone: selectedPlace.timezone || selectedPlace.timeZone || 'UTC',
      birdId: Number(birdId || 1),
      pakshaMode,
    });

    if (parseBoolean(saveDefaultPlace)) {
      const updated = await setUserDefaultPlace(req.currentUser.id, {
        name: selectedPlace.name || selectedPlace.label || '',
        label: selectedPlace.label || selectedPlace.name || '',
        latitude: Number(selectedPlace.latitude),
        longitude: Number(selectedPlace.longitude),
        timezone: selectedPlace.timezone || selectedPlace.timeZone || schedule.timezone,
      });
      req.currentUser = sanitizeCurrentUser(updated);
    }

    return res.json({
      schedule,
    });
  }),
);

app.get(
  '/api/admin/users',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (_req, res) => {
    const users = await getUsers();
    res.json({ users });
  }),
);

app.post(
  '/api/admin/users',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (req, res) => {
    const { username, name, password, role = 'user', active = true } = req.body || {};
    const created = await createUser({
      username,
      name,
      password,
      role,
      active,
    });

    res.status(201).json({ user: created });
  }),
);

app.put(
  '/api/admin/users/:id',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (req, res) => {
    const updated = await updateUser(req.params.id, req.body || {});
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: updated });
  }),
);

// ── Palangal routes ──────────────────────────────
app.get(
  '/api/admin/palangal',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (_req, res) => {
    const palangal = await getPalangal();
    res.json({ palangal });
  }),
);

app.post(
  '/api/admin/palangal',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (req, res) => {
    const created = await createPalangal(req.body || {});
    res.status(201).json({ palangal: created });
  }),
);

app.put(
  '/api/admin/palangal/:id',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (req, res) => {
    const updated = await updatePalangal(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Palangal entry not found' });
    return res.json({ palangal: updated });
  }),
);

app.delete(
  '/api/admin/palangal/:id',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (req, res) => {
    const deleted = await deletePalangal(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Palangal entry not found' });
    return res.json({ ok: true });
  }),
);

// ── Ollama AI Models ──────────────────────────────
const OLLAMA_BASE = process.env.OLLAMA_URL || 'http://localhost:11434';

app.get(
  '/api/admin/ollama/models',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (_req, res) => {
    try {
      const r = await fetch(`${OLLAMA_BASE}/api/tags`);
      if (!r.ok) return res.json({ models: [] });
      const data = await r.json();
      return res.json({ models: data.models || [] });
    } catch {
      return res.json({ models: [] });
    }
  }),
);

app.post(
  '/api/admin/ollama/pull',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (req, res) => {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Model name required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const r = await fetch(`${OLLAMA_BASE}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, stream: true }),
      });

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(decoder.decode(value));
      }
    } catch (err) {
      res.write(JSON.stringify({ error: err.message }));
    }
    res.end();
  }),
);

app.delete(
  '/api/admin/ollama/models/:name',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (req, res) => {
    const name = decodeURIComponent(req.params.name);
    try {
      const r = await fetch(`${OLLAMA_BASE}/api/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!r.ok) return res.status(r.status).json({ error: 'Failed to delete model' });
      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }),
);

// ── Admin profile ─────────────────────────────────
app.put(
  '/api/admin/profile',
  requireUser,
  requireRole('admin'),
  asyncRoute(async (req, res) => {
    const { name, password } = req.body || {};
    const updated = await updateUser(req.currentUser.id, { name, password });
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: updated });
  }),
);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({
    error: err?.message || 'Unexpected server error',
  });
});

await ensurePanchaPakshiDataLoaded();

app.listen(PORT, () => {
  console.log(`Neram server listening on http://localhost:${PORT}`);
});

// Self-ping to keep the Render instance alive (every 4 minutes)
const SELF_PING_URL = 'https://neram.onrender.com/api/health';
const PING_INTERVAL_MS = 4 * 60 * 1000;

setInterval(async () => {
  try {
    const res = await fetch(SELF_PING_URL);
    console.log(`[health-ping] ${new Date().toISOString()} — ${res.status}`);
  } catch (err) {
    console.warn(`[health-ping] failed: ${err.message}`);
  }
}, PING_INTERVAL_MS);
