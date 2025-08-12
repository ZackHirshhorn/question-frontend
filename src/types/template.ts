export interface UITopic {
  id: string;
  name: string;
  questions: any[];
}

export interface UISubCategory {
  id: string;
  name: string;
  questions: any[];
  topics: UITopic[];
}

export interface UICategory {
  id: string;
  name: string;
  subCategories: UISubCategory[];
  questions: any[];
}

export interface UITemplate {
  name: string;
  categories: UICategory[];
}

