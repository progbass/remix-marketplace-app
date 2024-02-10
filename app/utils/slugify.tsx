export default function (stringToSlugify: string): string {
  // Slugify a string
  return stringToSlugify
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}
