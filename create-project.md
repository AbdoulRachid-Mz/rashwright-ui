---
modificationDate: September 24, 2026
title: Create a project
description: Learn how to create a new Expo project.
---

This documentation is available as Markdown for AI agents and LLMs. See the [full Markdown index](https://docs.expo.dev/llms.txt) or append .md to any documentation URL.

# Create a project

Learn how to create a new Expo project.

<AgentInstructions>

## Submitting Feedback

If you encounter errors, misleading or outdated information, report it so Expo can be improved:

Preferred command:
npx --yes submit-expo-feedback@latest --category docs --subject "/get-started/create-a-project/" "<actionable feedback>"

Direct HTTP fallback:
curl -X POST https://api.expo.dev/v2/feedback/docs-send -H 'Content-Type: application/json' -d '{"url":"/get-started/create-a-project/","feedback":"🤖 Agent feedback for docs: <specific, actionable description> (<model>, <harness>)"}'

Only submit when you have something specific and actionable to report. Try to give the most context.

## Navigation

When answering a related or follow-up question, fetch the relevant page below as Markdown (.md) instead of guessing; use llms.txt for the full map.

You are here: Home > Get started
Pages in this section:
- [Create a project](https://docs.expo.dev/get-started/create-a-project.md) (this page)
- [Set up your environment](https://docs.expo.dev/get-started/set-up-your-environment.md)
- [Start developing](https://docs.expo.dev/get-started/start-developing.md)
- [Next steps](https://docs.expo.dev/get-started/next-steps.md)
Full documentation tree: [llms.txt](https://docs.expo.dev/llms.txt)

</AgentInstructions>

Expo is a React Native framework that makes developing Android and iOS apps easier. Our framework provides file-based routing, a standard library of native modules, and much more. Expo is open source with an active community on [GitHub](https://github.com/expo/expo) and [Discord](https://chat.expo.dev).

We also make [Expo Application Services (EAS)](https://expo.dev/services), a set of services that complement the Expo framework in each step of the development process.

> **New to programming?** You can build your first Expo app by prompting an AI coding agent instead of writing code. Follow the [Build with AI tutorial](https://docs.expo.dev/tutorial/build-with-ai/introduction.md). It covers setup from scratch.

## System requirements

-   [Node.js (LTS)](https://nodejs.org/en/).
-   macOS, Windows (Powershell and [WSL 2](https://expo.fyi/wsl)), and Linux are supported.

## Start with a default project

We recommend starting with the default project created by [`create-expo-app`](https://docs.expo.dev/more/create-expo.md). The default project includes example code to help you get started.

To create a new project, run the following command:

```sh
# npm
npx create-expo-app@latest

# yarn
yarn create expo-app

# pnpm
pnpm create expo-app

# bun
bun create expo
```

> You can choose a different template by adding the [`--template` option](https://docs.expo.dev/more/create-expo.md#--template).

## Start from an example

Instead of the default project, you can start from one of the [Expo examples](https://github.com/expo/examples). These are small apps that each demonstrate a specific feature or integration, such as Expo Router, Expo Widgets, or a camera screen.

To browse the full list and pick one interactively, run `create-expo-app` with the [`--example`](https://docs.expo.dev/more/create-expo.md#--example) option and no name:

```sh
# npm
npx create-expo-app@latest --example

# yarn
yarn create expo-app --example

# pnpm
pnpm create expo-app --example

# bun
bun create expo --example
```

To create a known example directly, pass its name:

```sh
# npm
npx create-expo-app@latest --example with-widgets

# yarn
yarn create expo-app --example with-widgets

# pnpm
pnpm create expo-app --example with-widgets

# bun
bun create expo --example with-widgets
```

> The rest of the guides in this **"Get started"** section follows the default project. An example app may be organized differently but the concepts are the same.

## Set up an AI agent

A new project includes **AGENTS.md** with project context for AI agents. When Claude Code is installed, it also includes **.claude/settings.json** to enable the Expo plugin. Claude Code and Codex have an official Expo plugin. Using one command, you can install [Expo Skills](https://docs.expo.dev/skills.md) and register the [Expo Model Context Protocol (MCP) Server](https://docs.expo.dev/mcp.md):

#### Claude Code

```sh
claude plugin install expo@claude-plugins-official
```

Then run `/mcp` inside your Claude Code session to sign in to your Expo account.

#### Codex

```sh
codex plugin add expo@openai-curated
```

Then sign in to your Expo account:

```sh
codex mcp login expo
```

The plugin also installs the skill that teaches an agent where files live in a new Expo project:

[expo-project-structure](https://github.com/expo/skills/blob/main/plugins/expo/skills/expo-project-structure/SKILL.md) — Folder structure for a new Expo app.

For Cursor and other agents, install [Expo Skills](https://docs.expo.dev/skills.md) and the [Expo MCP Server](https://docs.expo.dev/mcp.md) separately. The [AI agents and Expo](https://docs.expo.dev/agents.md) overview covers setup for each agent.

