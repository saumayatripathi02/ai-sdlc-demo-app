import crypto from 'node:crypto';

export const demoUsers = {
  'demo.manager': {
    id: 'demo.manager',
    name: 'Demo Manager',
    role: 'Manager',
    password: 'Password123!'
  },
  'demo.director': {
    id: 'demo.director',
    name: 'Demo Director',
    role: 'Director',
    password: 'Password123!'
  },
  'demo.director2': {
    id: 'demo.director2',
    name: 'Demo Director 2',
    role: 'Director',
    password: 'Password123!'
  }
};

export const signedInTokens = new Map();

export function signInUser(username, password) {
  const candidate = demoUsers[username];

  if (!candidate || candidate.password !== password) {
    return undefined;
  }

  const token = crypto.randomUUID();
  const signedInUser = {
    id: candidate.id,
    name: candidate.name,
    role: candidate.role
  };

  signedInTokens.set(token, signedInUser);
  return { token, user: signedInUser };
}

export function requireSignIn(req, res, next) {
  const authHeader = req.get('Authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  const user = token ? signedInTokens.get(token) : undefined;

  if (!user) {
    return res.status(401).json({ ok: false, reason: 'Sign-in required.' });
  }

  req.user = user;
  return next();
}
