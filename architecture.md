How to organize Expo app folder structure for clarity and scalability
Organize your Expo Router project with proven folder structures for components, screens, API routes, and more to scale React Native apps.

Kadi Kraman
Kadi Kraman

Engineering

How to organize Expo app folder structure for clarity and scalability
Properly organized folder structure has a great impact on productivity. Just like a tidy office sets you up to do your best work, so does a tidy codebase with every file in its place. This isn’t just helpful for human developers - if you’re using AI to speed up your work, a solid plan increases its chances of generating the right code. Also if you and AI follow the same plan, it and makes it much easier for you to find that code later.

In an Expo Router codebase, we have file-based routing, platform-specific code, styling, server code, and regular React components. In this blog, we discuss some tried and tested strategies for organizing all of these for an app that scales.

Use a /src folder
Expo Router is a file-based router where the navigation tree of your app is based on the folder structure and layout files, with the main entry point being the /app folder. Both /app and /src/app are supported out of the box. So if you want to switch from /app to /src/app, simply move the folder and restart the bundler!

The benefit of using /src folder is that it allows you to separate your app code from other files, and this makes the codebase much easier to work with.

Example using the /app folder in the root level:


Copy

├── app/
├── assets/
├── components/
├── scripts/
├── hooks/
├── constants.ts
├── theme.ts
├── app.json
├── eas.json
└── package.json
Versus adding with /src/app:


Copy

├── assets/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── constants.ts
│   └── theme.ts
├── app.json
├── eas.json
└── package.json
In the last example, it is much easier to distinguish between application code and other config files.

Create a reusable components folder
With file-based routing we are limited on what files we can add to our /app folder since every file will create a new route. A common pattern for all React projects is to have a /components folder for reusable components: buttons, sliders, cards etc.

Each component will generally have one named export. Regarding the filename there are two schools of thought:

Classic: the filename is exactly the same as the component name (including the calitalized first letter)
Modern: the filename is the a kebab-case version of the component name, e.g. MyComponent becomes my-component
Choose one based on your preference, both are valid and consistency matters.


Copy

export function Button() {
  ...
}
For components that could do with breaking out into separate files, it is common to create a folder with the component name, and add the main component in the index file. This way other smaller components which are not needed anywhere else can be colocated.


Copy

import { Row } from "./row";
import { Cell } from "./cell";

export function Table() {
  ...
}
Using an index file here is a useful convention, because the import path of the component stays unchanged from when the component was just a single file, and you can instantly tell which file is the root component.

Putting these two examples together, the folder structure becomes:


Copy

└── src/
    ├── app/
    │   ├── index.tsx
    │   └── _layout.tsx
    └── components/
        ├── table/
        │   ├── components/
        │   │   ├── row.tsx
        │   │   └── cell.tsx
        │   └── index.tsx
        └── button.tsx
Consider a /screens folder
Notice how in the components example above, we created a folder for the Table component so we could break it down further to smaller, more manageable components. As your app grows, you might find it useful to do the same for your app screens, especially when there is a lot of UI code that is complex, but not used in other pages (so it does not make sense to place it in the components folder). Trouble is, since every file in the /app folder creates a route, it is not possible to create extra components in there.

For small apps, this is not usually a problem, but as your app grows, you will feel the need for some separation. So, a solution that large codebases often adopt is to create a /screens folder, with every route simply returning a screen component.


Copy

import { Home } from "@screens/home";

export default function HomeScreen() {
  // Handle any context-specific code in the route, e.g. getting url params
  return <Home />;
}
This way the screen could be made up of multiple components and broken down into multiple files if needed:


Copy

└── src/
    ├── app/
    │   ├── index.tsx
    │   ├── settings.tsx
    │   └── _layout.tsx
    └── screens/
        ├── home/
        │   ├── components/
        │   │   └── timeline.tsx
        │   └── index.tsx
        └── Settings.tsx

A side bonus of this approach is that it makes it extremely easy to render the same screen in multiple routes. Shared routes is always an option, but it some cases just rendering the same screen as a component is just simpler and more readable.

Utilities and hooks
Is there a box, a cupboard, or perhaps a drawer in your house where the miscellaneous items go to that wouldn't otherwise have a home? Well, most codebases have something similar, and we call it the "utils folder".

Kadi Kraman 💚
Kadi Kraman 💚
@kadikraman
·
Follow
I use the KonMari method for code organisation

✨ Does this code spark joy? ✨

YES -> /src

NO -> /util

3:38 PM · Feb 10, 2020
2.3K
Reply

Copy link
Jokes aside, this is a place for small standalone utilities such as date formatters, currency converters, data transformers etc.

In a React (Native) codebase you'll also find yourself writing reusable hooks quite often, so it is very common to also have such a folder for hooks.


Copy

└── src/
    └── utils/
        ├── format-date.ts
        └── pluralize.ts
    └── hooks/
        ├── use-app-state.ts
        └── use-theme.ts
Separate server code
With Expo Router API routes, we are able to write server code directly in the React Native codebase. Simply appending +api to a file in the /app folder will turn it into an API route: meaning you can deploy it on its own or as part of the web export of your app.

The API code gets executed on the server side environment, meaning that you can use sensitive environment variables (in particular, any process.env.MY_VAL can be used, compared to the rest of the codebase where only environment variables prefixed with EXPO_PUBLIC_ will be inlined). There is also a difference in runtime since the frontend code is executed either in the browser or on device, versus the API code when deployed with EAS Hosting Node.js-like environment.

All this is to say, as your application grows and you want to reuse logic between API routes, or extract parts of the code to a separate codebase, separating the server code will be very useful.

While API routes can be anywhere in the /app folder, I like to place them all in a single /api folder, making the actual routes like /api/user and /api/settings. This not only allows us to group the api routes and colocate them, but is also a sensible precaution against route collisions, e.g. if you happen to have both a screen and an api route for /user .

Furthermore any utilities for the api routes could be extracted to a /server folder to indicate special rules.


Copy

└── src/
    ├── app/
    │   ├── api/
    │   │   ├── user+api.ts
    │   │   └── settings+api.ts
    │   └── index.tsx
    └── server/
        ├── auth.ts
        └── db.ts
You may also want to consider adding custom ESLint rules to +api files and everything in the /server folder or the converse, exclude those locations from checks that assume the code is run on the frontend environment.

Platform-specific code
When building for multiple targets, it is sometimes necessary to add platform-specific code. While smaller such differences can easily be handled with Platform.select or checking the Platform.OS, many such statements will put you in danger of spaghetti code. It is often cleaner to encapsulate larger such changes in separate files using platform-specific file extensions.

Say you had a BarChart component that had completely separate implementations on web and native, including relying on different charting libraries. Then you can create two components: bar-chart.tsx and bar-chart.web.tsx. In your codebase, import it as if the extra file extension didn’t exist:


Copy

import { BarChart } from "@components/bar-chart";
And when metro bundles the JavaScript code, it will automatically pick the web file when it’s bundling the code for the web.

Note that:

the props for BarChart should be identical for both components
a “default” version of the component without a platform-specific extension is always required (if you wanted to create a component only for one platform, you can make the default component a no-op)
the following extensions are supported: .web, .native, .ios, .android
Colocate your styles
When using StyleSheet, inline styles or Unistyles for styling, you may want to pull your styles out to a separate file like so:


Copy

└── src/
    └── components/
        ├── button.tsx
        └── button.styles.tsx
While this was fashionable for a while, the modern approach is to keep your style object at the bottom of your component file as it makes the styles easier to see and work with:


Copy

export function Button() {
  return ...
}

const styles = StyleSheet.create({
  ...
}):
Colocate your unit tests
There are two schools of thought when it comes to unit tests:

create a separate __tests__ folder, or
colocate the tests with the file being tested
Both are valid, so really it comes down to preference. I prefer colocating the tests so you can easily see at a glance which files are tested.


Copy

└── src/
    └── utils/
        └── format-date.ts
        └── format-date.test.ts
Summary
With only a few rules, your codebase becomes much more manageable at scale. If we put all the above rules together, we get something like this:


Copy

├── assets/
├── scripts/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes in a separate folder
│   │   │   ├── event+api.ts
│   │   │   └── user+api.ts
│   │   ├── _layout.tsx
│   │   ├── _layout.web.tsx         # separate layout file for web
│   │   ├── index.tsx
│   │   ├── events.tsx
│   │   └── settings.tsx
│   ├── components/
│   │   ├── table/
│   │   │   ├── cell.tsx
│   │   │   └── index.tsx
│   │   ├── bar-chart.tsx
│   │   ├── bar-chart.web.tsx        # separate components for web and native
│   │   └── button.tsx
│   ├── screens/
│   │   ├── home/
│   │   │   ├── card.tsx            # component only used in the home page
│   │   │   └── index.tsx           # returned from /src/app/index.tsx
│   │   ├── events.tsx              # returned from /src/app/events.tsx
│   │   └── settings.tsx            # returned from /src/app/settings.tsx
│   ├── server/                     # code used in /api
│   │   ├── auth.ts
│   │   └── db.ts
│   ├── utils/                      # reusable utilities
│   │   ├── format-date.ts
│   │   ├── format-date.test.ts      # unit test next to the file being tested
│   │   └── pluralize.ts
│   ├── hooks/
│   │   ├── use-app-state.ts
│   │   └── use-theme.ts
├── app.json
├── eas.json
└── package.json
Changelog
January 7, 2026: updated the default recommendation to use kebab-case filenames. This will be consistent with our SDK 55 default template.