import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..', '..');

const files = [
  'src/services/api/clientes.api.ts',
  'src/services/api/pedidos.api.ts',
  'src/services/api/turnos.api.ts',
  'src/services/citasAPI.service.ts',
];

describe('service regression guards', () => {
  it('services must not use fetch() directly', () => {
    for (const f of files) {
      const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
      expect(content).not.toMatch(/\bfetch\s*\(/);
      expect(content).not.toMatch(/\bresponse\.json\s*\(/);
      expect(content).not.toMatch(/\bapiService\./);
    }
  });

  it('services must unwrap via response.data.data (no manual envelope parsing)', () => {
    for (const f of files) {
      const content = fs.readFileSync(path.join(ROOT, f), 'utf8');
      // Basic guard: should reference .data.data at least once
      expect(content).toMatch(/\.data\.data/);
      // Avoid legacy envelope detection logic patterns
      expect(content).not.toMatch(/response\?\.\s*data\?\.\s*data/);
      expect(content).not.toMatch(/Array\.isArray\(response/);
    }
  });
});

