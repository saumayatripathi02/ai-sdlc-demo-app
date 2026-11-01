#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.resolve(__dirname, '..', 'ai-log');
const logFile = path.join(logDir, 'interactions.log');

function toStringSafe(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(toStringSafe).filter(Boolean).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function truncate(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function redactSecrets(value) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    let text = value;
    const patterns = [
      /(\b(?:authorization|api[_-]?key|token|secret|password|passwd|pwd|client[_-]?secret|access[_-]?token|refresh[_-]?token)\s*[:=]\s*["']?)([^"'\s,;]+)/gi,
      /(\b(?:bearer)\s+)([A-Za-z0-9._~+/=-]{8,})/gi,
      /(gh[pousr]_[A-Za-z0-9_]{10,}|github_pat_[A-Za-z0-9_]+|xox[baprs]-[A-Za-z0-9-]+|sk-[A-Za-z0-9]{10,})/gi
    ];

    for (const pattern of patterns) {
      text = text.replace(pattern, (_, prefix) => `${prefix}[REDACTED]`);
    }

    return text;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSecrets(item));
  }

  if (typeof value === 'object') {
    const output = {};
    for (const [key, val] of Object.entries(value)) {
      output[key] = redactSecrets(val);
    }
    return output;
  }

  return value;
}

function summarizeInput(value) {
  const cleaned = redactSecrets(value);

  if (typeof cleaned === 'string') {
    return truncate(cleaned, 220);
  }

  if (Array.isArray(cleaned)) {
    return cleaned.map((item) => summarizeInput(item)).filter(Boolean).slice(0, 3).join('; ');
  }

  if (cleaned && typeof cleaned === 'object') {
    const keys = Object.keys(cleaned);
    const parts = [];
    for (const key of keys.slice(0, 5)) {
      const entry = summarizeInput(cleaned[key]);
      if (entry) {
        parts.push(`${key}=${entry}`);
      }
    }
    return truncate(parts.join(', '), 220);
  }

  return truncate(toStringSafe(cleaned), 220);
}

function getValue(source, keys) {
  for (const key of keys) {
    if (source && Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined && source[key] !== null && source[key] !== '') {
      return source[key];
    }
  }
  return undefined;
}

function buildRecord(rawEvent) {
  const safeEvent = redactSecrets(rawEvent || {});
  const timestamp = new Date().toISOString();
  const eventName = getValue(safeEvent, ['event', 'type']) || 'unknown';
  const sessionId = getValue(safeEvent, ['sessionId', 'session_id', 'session']) || '';
  const agent = getValue(safeEvent, ['agent', 'agentName', 'copilotAgent']) || '';
  const model = getValue(safeEvent, ['model', 'modelName', 'languageModel']) || '';
  const promptText = redactSecrets(getValue(safeEvent, ['prompt', 'userPrompt', 'message', 'text'])) || '';
  const toolName = getValue(safeEvent, ['toolName', 'tool_name']) || '';
  const toolArgs = getValue(safeEvent, ['toolArgs', 'tool_args', 'args']) || '';

  const record = {
    timestamp,
    event: String(eventName),
    sessionId: sessionId ? String(sessionId) : undefined,
  };

  if (promptText) {
    record.prompt = truncate(redactSecrets(promptText), 2000);
  } else if (toolName || toolArgs) {
    record.toolName = String(toolName || 'tool');
    const summary = summarizeInput(toolArgs);
    if (summary) {
      record.toolInputSummary = summary;
    }
  }

  if (agent) record.agent = String(agent);
  if (model) record.model = String(model);

  return record;
}

function writeLog(record) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(logFile, `${JSON.stringify(record)}\n`, 'utf8');
  } catch (error) {
    // Never block the agent or crash on logging failures.
  }
}

function main() {
  try {
    const input = fs.readFileSync(0, 'utf8');
    try {
      const payload = input && input.trim() ? JSON.parse(input) : {};
      const record = buildRecord(payload);
      writeLog(record);
    } catch (error) {
      const record = {
        timestamp: new Date().toISOString(),
        event: 'log-interaction-error',
        sessionId: undefined,
        summary: 'Malformed hook JSON payload; log script swallowed the error.'
      };
      writeLog(record);
    }

    process.stdout.write('{}\n');
  } catch (error) {
    process.stdout.write('{}\n');
  }
}

main();
