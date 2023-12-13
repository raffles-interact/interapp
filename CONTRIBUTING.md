# Contributing guidelines

Thanks for coming onboard to contribute to this project. This document outlines a few common code guidelines when contributing to the project. Lead maintainers can choose to modify these guidelines if they feel it is too strict/lax. Last updated: 12 Dec 2023.

The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
      NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and
      "OPTIONAL" in this document are to be interpreted as described in
      RFC 2119.

## Table of Contents
- [Coding Guidelines](#coding-guidelines)
  1. [General Guidelines](#general-guidelines)
  2. [Backend Guidelines](#backend-guidelines)
  3. [Frontend Guidelines](#frontend-guidelines)
- [Product Demo Guidelines](#product-demo-guidelines)

## Coding Guidelines
### General guidelines

- All features SHOULD NOT be commited directly to the ``main`` branch, unless you have a very specific reason to do so (eg. CI/CD testing). Otherwise, checkout a new branch and open a PR.

- You SHOULD follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) when making commits to the ``main``/``dev`` branches, and it is RECOMMENDED to do the same on all other branches.

- You MAY use the test suite in Github Actions to ensure that your current build of the project is stable to push to production. 


### Backend Guidelines

- Before merging a PR with backend changes, you SHOULD check that tests pass and that you have tested your own changes.

- ``snake_case`` SHALL be used for all response/request body parameters. 

```js
// this is fine
POST HTTP/1.1 /test 200
{
  a_variable: "jewdfjskd",
  a_very_long_name: "dsfkjsda"
} 

GET HTTP/1.1 /test?variable_name=lol 200

// this is not ok
POST HTTP/1.1 /test 200
{
  camelCase: "no"
}
```

- You SHOULD throw informative errors when an error occurs in response/query.

```js
// this is good
GET HTTP/1.1 /test 400
{
  "error": "missing fields 'asdf', 'err'"
}

// this is not good
GET HTTP/1.1 /test 400
{
  "error": "an error occurred. try again later"
}
```

### Frontend guidelines
- Pages (``page.tsx``) SHOULD be written with ``export default function``.
```ts
// good
export default function HomePage {...}

// bad
export const HomePage = () => {}
Homepage.displayName = 'HomePage'; // needed for NextJS
export default HomePage;
```
- Non-interactive components SHOULD be made a server component. This SHOULD include all pages (``pages.tsx``).

- Pages SHOULD be broken down into simple, reusable components if possible.

## Product Demo Guidelines

Thanks for coming in to test this project. This section details what to do when testing out demos/test builds. 

- Look out for potential complex functionality that is not properly explained. Such behaviour may make it difficult for future users to understand how to use the website.

- Test forms/input fields with a variety of values, and attempt to cause errors if possible. This is really helpful in case an exploit is present in the inputs. Examples of invalid input values that one can test out:

  - Username: ``a; DROP TABLE users;--`` (SQL injection, for technical users)
  - UserID: ``2147483648`` (32 bit signed int overflow)
  - Username: ``jjjj...jjjjjj`` (a very long string that may exceed memory limits)
  - Email: ``a.dsfsajf`` (an input that is clearly not an email)
  - Birthday: ``30/2/2023`` (a date that does not exist)
  - Age: ``-1`` (an age that cannot exist)
  - Start time: ``09:00``, End time: ``08:00`` (End time < Start time)
  - Day of the week: ``Yesterday`` (Not a day of the week)
  - Month: ``Decembuary`` (Not a month)

- Check for discrepancies in responsive display sizes. Ie. Does the size of screen affect readability of certain text/functionality? To test this on a PC, use the in-browser viewport resizing tool (CTRL + Shift + I on Chrome). Refer to your browser's support page for more information.

- Look out for behaviour that may be too complex for a normal user, or is not supported on touchscreen devices.






