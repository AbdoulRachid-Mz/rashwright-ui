---
name: rs-ui/questionnaire
description: Primitive de questionnaire multi-étapes avec choix, progression, validation et navigation.
version: 1.0.0
componentVersion: 1.0.0
category: Forms
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - none
supportsGlass: false
---

# Questionnaire - Rashwright UI Mobile

Primitive de questionnaire multi-étapes avec choix, progression, validation et navigation.

## Installation

```bash
rs-ui add questionnaire
```

## Usage

```tsx
import { Questionnaire } from "@/components/ui/questionnaire";

<Questionnaire
  questions={[
    { name: "q1", title: "Votre nom ?", choices: [{ value: "a", label: "Option A" }] },
  ]}
  onSubmit={(answers) => console.log(answers)}
/>
```