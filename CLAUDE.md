# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

这是一个react教程，我现在准备将它修改为纯英文版，我们的目标是对所有markdown文档和代码中的中文进行翻译，全部翻译成英文。

## Language & Response Style

- **Always reply in Chinese**, regardless of the language the user writes in. Keep code, filenames, and variable names in English as-is.
- Be concise and direct. Do not restate what the user just said.
- Do not summarize "what you just did" at the end of a response — the user can see the diff.
- No emojis unless the user explicitly asks.

## Collaboration Rules

### 1. Plan First

- Enter plan mode for any non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, stop and re-plan immediately — do not keep pushing
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- Use subagents to keep the main context window clean
- Offload research, exploration, and parallel analysis to subagents
- One focused task per subagent

### 3. Self-Improvement Loop

- After any correction from the user: update `tasks/lessons.md` with the pattern
- Write rules that prevent the same mistake from recurring
- Review lessons at the start of each session

### 4. Verification Before Done

- Never mark a task complete without proving it works
- Ask: "Would a staff engineer approve this?"

### 5. Demand Elegance

- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes — do not over-engineer

### 6. Autonomous Bug Fixing

- When given a bug report: just fix it. Do not ask for hand-holding.
- Point at logs, errors, or failing tests — then resolve them.

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Capture Lessons**: Update `tasks/lessons.md` after any correction

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Touch minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
