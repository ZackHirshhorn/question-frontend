import { readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';

function walk(dir: string): string[] {
  const entries = readdirSync(dir);
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

describe('Popup naming convention', () => {
  it('requires files with popup overlay to end with Popup.tsx', () => {
    const base = path.resolve(__dirname);
    const compDir = path.join(base);
    const files = walk(compDir).filter((f) => f.endsWith('.tsx'));
    const offenders: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      if (content.includes('popup-overlay')) {
        if (!/Popup\.tsx$/.test(file)) {
          offenders.push(path.relative(compDir, file));
        }
      }
    }
    if (offenders.length) {
      throw new Error(
        `Popup components must be named *Popup.tsx. Offenders: \n - ${offenders.join('\n - ')}`,
      );
    }
  });
});

