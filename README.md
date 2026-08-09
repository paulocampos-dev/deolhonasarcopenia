# De Olho Na Sarcopenia

Static site for the "De Olho Na Sarcopenia" project (USP), hosted at
[deolhonasarcopenia.com.br](https://deolhonasarcopenia.com.br).

## Structure

Plain static HTML + Tailwind (via CDN) — no build step. `public/` is the nginx web root.

```
public/
  index.html            Home
  exercicios/index.html Exercícios
  blog/index.html       Blog
  contato/index.html    Contato (form posts to Formspree)
  assets/js/tailwind-config.js  Shared design tokens (colors/type/spacing)
  assets/img/           Self-hosted images
```

## Local preview

Any static file server works, e.g.:

```
npx serve public
```

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which SSHes into the VPS and
runs `git pull` in `/opt/deolhonasarcopenia` (served directly by nginx — no build step).

