// src/api/sanitizeTemplate.ts

// This function recursively traverses the template object and MUTATES it in place.
// Any 'questions' array containing objects is replaced by an array of strings (_id).
export const sanitizeTemplate = (template: any): void => {
  if (!template || typeof template !== 'object' || !Array.isArray(template.categories)) {
    return;
  }

  template.categories.forEach((category: any) => {
    if (category && typeof category === 'object') {
      // Sanitize category questions
      if (Array.isArray(category.questions) && category.questions.length > 0 && typeof category.questions[0] === 'object') {
        category.questions = category.questions.map((q: any) => q._id);
      }

      // Sanitize sub-categories
      if (Array.isArray(category.subCategories)) {
        category.subCategories.forEach((subCategory: any) => {
          if (subCategory && typeof subCategory === 'object') {
            // Sanitize sub-category questions
            if (Array.isArray(subCategory.questions) && subCategory.questions.length > 0 && typeof subCategory.questions[0] === 'object') {
              subCategory.questions = subCategory.questions.map((q: any) => q._id);
            }

            // Sanitize topics
            if (Array.isArray(subCategory.topics)) {
              subCategory.topics.forEach((topic: any) => {
                if (topic && typeof topic === 'object' && Array.isArray(topic.questions) && topic.questions.length > 0 && typeof topic.questions[0] === 'object') {
                  topic.questions = topic.questions.map((q: any) => q._id);
                }
              });
            }
          }
        });
      }
    }
  });
};