import { describe, expect, it } from 'vitest';
import { classRepository } from '@/lib/classes/repository';

describe('classRepository (in-memory dev implementation)', () => {
  it('finds the seeded demo class by its exact code', async () => {
    const found = await classRepository.getByCode('DEMO01');
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Classe demo');
  });

  it('is case-insensitive and trims whitespace', async () => {
    const found = await classRepository.getByCode('  demo01  ');
    expect(found?.code).toBe('DEMO01');
  });

  it('returns null for an unknown code', async () => {
    const found = await classRepository.getByCode('NOTREAL');
    expect(found).toBeNull();
  });
});
