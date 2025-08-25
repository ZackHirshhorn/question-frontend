// src/api/sanitizeTemplate.ts

type QuestionLike = string | { _id: string };

type TopicLike = {
  name?: string;
  questions?: QuestionLike[];
};

type SubCategoryLike = {
  name?: string;
  questions?: QuestionLike[];
  topics?: TopicLike[];
};

type CategoryLike = {
  name?: string;
  questions?: QuestionLike[];
  subCategories?: SubCategoryLike[];
};

type TemplateLike = {
  name?: string;
  categories?: CategoryLike[];
};

const toIds = (arr: QuestionLike[]): string[] => arr.map((q) => (typeof q === 'string' ? q : q._id));

// Recursively traverse the template object and MUTATE it in place.
// Any 'questions' array containing objects is replaced by an array of string IDs (_id).
export const sanitizeTemplate = (template: unknown): void => {
  const t = template as TemplateLike | null | undefined;
  if (!t || !Array.isArray(t.categories)) return;

  t.categories.forEach((category) => {
    if (!category) return;
    if (Array.isArray(category.questions) && category.questions.length > 0 && typeof category.questions[0] !== 'string') {
      category.questions = toIds(category.questions);
    }

    if (Array.isArray(category.subCategories)) {
      category.subCategories.forEach((sub) => {
        if (!sub) return;
        if (Array.isArray(sub.questions) && sub.questions.length > 0 && typeof sub.questions[0] !== 'string') {
          sub.questions = toIds(sub.questions);
        }
        if (Array.isArray(sub.topics)) {
          sub.topics.forEach((topic) => {
            if (!topic) return;
            if (Array.isArray(topic.questions) && topic.questions.length > 0 && typeof topic.questions[0] !== 'string') {
              topic.questions = toIds(topic.questions);
            }
          });
        }
      });
    }
  });
};
