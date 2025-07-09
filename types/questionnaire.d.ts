export interface Question {
  q: string
  choice?: string[]
  qType: "text" | "number" | "select" | "checkbox" | "radiobox"
  required: boolean
  answer: string
}

export interface Topic {
  name: string
  questions: Question[]
}

export interface SubCategory {
  name: string
  questions: Question[]
  topics: Topic[]
}

export interface Category {
  name: string
  questions: Question[]
  subCategories: SubCategory[]
}

export interface QuestionnaireTemplate {
  name: string
  categories: Category[]
}

export interface QuestionnaireData {
  template: QuestionnaireTemplate
}