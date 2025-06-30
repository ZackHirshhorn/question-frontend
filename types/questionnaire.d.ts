export interface Question {
  q: string
  choice?: string[]
  qType: string
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

// Find what this about
export interface QuestionnaireData {
  template: QuestionnaireTemplate
}

export type QuestionType = "text" | "number" | "select" | "checkbox"

// export interface Questionnaire {
//   id: string
//   name: string
//   description: string
//   hierarchy: any[]
//   shareLink: string
//   isActive: boolean
//   createdAt: Date
//   updatedAt: Date
// }

// export interface QuestionTemplate {
//   id: string
//   name: string
//   questions: TemplateQuestion[]
//   createdAt: Date
//   updatedAt: Date
// }

// export interface TemplateQuestion {
//   id: string
//   text: string
//   textHe: string
//   type: string
//   required: boolean
//   order: number
//   options?: string[]
// }