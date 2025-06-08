# Claude Code CLI Setup Guide

This guide explains how to install and use the official **Claude Code** CLI from Anthropic. It also outlines best practices for container environments and CI setups.

## Correct NPM Package

The CLI is published as [`@anthropic-ai/claude-code`](https://www.npmjs.com/package/@anthropic-ai/claude-code). If you only need API access, use [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk).

## Installation in Linux Containers

In Docker or WSL environments the operating system check may fail. Set the OS flag and skip the check:

```bash
npm config set os linux
npm install -g @anthropic-ai/claude-code --force --no-os-check
```

## Proxy Configuration

Remove deprecated `http-proxy` settings and use the standard keys:

```bash
npm config delete http-proxy
npm config set proxy http://<your-proxy>:<port>
npm config set https-proxy http://<your-proxy>:<port>
```

## Global Install Permissions

If global installation fails, either enable `--unsafe-perm` or install into a writable prefix:

```bash
npm config set prefix ~/.npm-global
export PATH="$HOME/.npm-global/bin:$PATH"
npm install -g @anthropic-ai/claude-code
```

## Example Dockerfile Snippet

```Dockerfile
FROM node:18-alpine

# Proxy & OS
RUN npm config set proxy http://<proxy> && \
    npm config set https-proxy http://<proxy> && \
    npm config set os linux

# Global installation
RUN npm install -g @anthropic-ai/claude-code --force --no-os-check
```

## Long‑Term Improvements

* Pin a version: `@anthropic-ai/claude-code@<version>`
* Run smoke tests such as `claude --version` after install
* Add health checks and logging in production environments
* Document setup steps for new contributors

---

**Last Updated**: 6. Januar 2025
