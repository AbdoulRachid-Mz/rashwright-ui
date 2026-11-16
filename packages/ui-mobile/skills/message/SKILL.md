---
name: rs-ui/message
description: Composant de message de conversation avec avatar, en-tête, pied de page et alignement.
version: 1.0.0
componentVersion: 1.0.0
category: Basic
dependencies:
  - none
expoDependencies:
  - none
requiresComponents:
  - none
supportsGlass: false
---

# Message - Rashwright UI Mobile

Composant de message de conversation avec avatar, en-tête, pied de page et alignement.

## Installation

```bash
rs-ui add message
```

## Usage

```tsx
import { Message } from "@/components/ui/message";

<Message avatar="https://..." align="left">
  Bonjour !
</Message>
```