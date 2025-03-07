# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Deploying to GitHub Pages

This project is configured to deploy to GitHub Pages using GitHub Actions. Here's how to set it up:

1. Create a GitHub repository (if you haven't already) and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/comentarios-site-svelte.git
git branch -M main
git push -u origin main
```

2. In your GitHub repository settings, go to Pages and set the source to "GitHub Actions".

3. The GitHub Action will automatically deploy your site when you push to the main branch.

### Manual Deployment

You can also manually deploy the site by running:

```bash
npm run deploy
```

and then pushing the `build` folder to the `gh-pages` branch of your repository.

## Customizing the Base Path

If your repository is not named `comentarios-site-svelte`, you'll need to update the base path in `svelte.config.js`:

```js
paths: {
  base: process.env.NODE_ENV === 'production' ? '/your-repo-name' : ''
}
