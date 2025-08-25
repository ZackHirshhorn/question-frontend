import { describe, it, expect } from 'vitest';
import { sanitizeTemplate } from './sanitizeTemplate';

describe('sanitizeTemplate', () => {
  it('mutates template questions at all levels to _id strings', () => {
    type Q = { _id: string } | string;
    type Tmpl = {
      name: string;
      categories: Array<{
        name: string;
        questions: Q[];
        subCategories: Array<{
          name: string;
          questions: Q[];
          topics: Array<{
            name: string;
            questions: Q[];
          }>;
        }>;
      }>;
    };
    const template: Tmpl = {
      name: 'T',
      categories: [
        {
          name: 'C1',
          questions: [{ _id: 'q1' }, { _id: 'q2' }],
          subCategories: [
            {
              name: 'SC1',
              questions: [{ _id: 'sq1' }],
              topics: [
                { name: 'Top1', questions: [{ _id: 'tq1' }, { _id: 'tq2' }] },
                { name: 'Top2', questions: [] },
              ],
            },
          ],
        },
        {
          name: 'C2',
          questions: [],
          subCategories: [],
        },
      ],
    };

    sanitizeTemplate(template);

    expect(template.categories[0].questions).toEqual(['q1', 'q2']);
    expect(template.categories[0].subCategories[0].questions).toEqual(['sq1']);
    expect(template.categories[0].subCategories[0].topics[0].questions).toEqual(['tq1', 'tq2']);
    expect(template.categories[1].questions).toEqual([]);
  });
});
