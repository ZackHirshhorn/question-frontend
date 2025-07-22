export const buildId = (
  type: "category" | "subcategory" | "topic" | "question",
  indices: (number | undefined)[],
  index: number
) => {
  const parts = indices.map((i) => (i !== undefined ? i : "none"));
  return `${type}-${parts.join("-")}-${index}`;
};
