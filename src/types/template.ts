export interface UITopic {
  id: string;
  name: string;
  questions: string[]; // question IDs
}

export interface UISubCategory {
  id: string;
  name: string;
  questions: string[]; // question IDs
  topics: UITopic[];
}

export interface UICategory {
  id: string;
  name: string;
  subCategories: UISubCategory[];
  questions: string[]; // question IDs
}

export interface UITemplate {
  name: string;
  categories: UICategory[];
}
