import { describe, it, expect } from 'vitest';
import { withIds, toServerShape } from './templateTransforms';

describe('templateTransforms', () => {
  it('withIds adds ids and preserves names/structure; toServerShape strips ids', () => {
    const server = {
      name: 'Temp',
      categories: [
        {
          name: 'Cat',
          questions: [],
          subCategories: [
            {
              name: 'Sub',
              questions: [],
              topics: [
                { name: 'Top', questions: [] },
              ],
            },
          ],
        },
      ],
    };

    const ui = withIds(server);
    expect(ui.name).toBe('Temp');
    expect(ui.categories[0].name).toBe('Cat');
    expect(ui.categories[0].id).toBeTruthy();
    expect(ui.categories[0].subCategories[0].id).toBeTruthy();
    expect(ui.categories[0].subCategories[0].topics[0].id).toBeTruthy();

    const back = toServerShape(ui);
    expect(back).toEqual(server);
  });
});

