export function wildcardMatcher(str: string, pattern: string) {
  // Add a trailing slash to the pattern if it doesn't have one
  if (!pattern.endsWith('/')) {
    pattern += '/';
  }
  // Add a trailing slash to the string if it doesn't have one
  if (!str.endsWith('/')) {
    str += '/';
  }
  // Replace '*' with '.*' to create a regex pattern
  const regexPattern = `^${pattern.replace(/\*/g, '.*')}$`;
  // Create a new RegExp object
  const regex = new RegExp(regexPattern);
  // Test the url against the regex pattern
  return regex.test(str);
}
