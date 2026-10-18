# Local development with LocalWP

## 1. Create the site

1. Install [LocalWP](https://localwp.com/) and create a new site (the "Preferred" environment is fine; PHP 8.x).
2. In WP Admin, go to **Appearance > Themes > Add New > Upload Theme**, upload your `Divi.zip` (5.15) and activate it.
3. Turn on debugging: in LocalWP, open the site folder (**Go to site folder**) and edit `app/public/wp-config.php`:

   ```php
   define( 'WP_DEBUG', true );
   define( 'WP_DEBUG_LOG', true );      // Writes to wp-content/debug.log
   define( 'WP_DEBUG_DISPLAY', false );
   ```

## 2. Install the plugin

### Option A: from source (for development)

You need [Node.js](https://nodejs.org/) 20.18 or newer and Git.

```bash
cd "<site folder>/app/public/wp-content/plugins"
git clone -b claude/divi-flip-card-plugin-w0gfks https://github.com/markusritschel/divi5-flip-cards.git
cd divi5-flip-cards
npm install
npm run build        # or: npm start (rebuilds on every change)
```

Then activate **Divi 5 Flip Cards** under **Plugins**.

After a change: with `npm start` running, reload the Visual Builder. PHP changes take effect on reload; changes to a `module.json` need a rebuild (which `npm start` does automatically).

### Option B: the ready-made ZIP (no Node needed)

1. On GitHub, open **Actions > Build**, pick the latest run of the branch and download the `divi5-flip-cards` artifact.
2. Unzip it once. Inside is `divi5-flip-cards-<version>.zip`.
3. Upload that ZIP under **Plugins > Add New > Upload Plugin** and activate it.

## 3. Test

Work through the checklist in [`PLAN.md`](../PLAN.md#milestone-1-verification-checklist-divi-515-localwp).
Check `wp-content/debug.log` and the browser console for errors.

### Automated browser tests

`e2e/` runs the same checks automatically against a separate Docker WordPress (Docker and
[pnpm](https://pnpm.io/) needed; your LocalWP site is not touched):

```bash
npm run build
e2e/setup.sh /path/to/Divi.zip     # unpacks Divi to ~/.cache/d5fc-e2e, starts http://localhost:8087
cd e2e && pnpm install && pnpm test
```

The site is reachable at <http://localhost:8087> (admin / admin) for trying things by hand.
Stop it with `docker compose -f e2e/docker-compose.yml down` (add `-v` to delete the site).

## 4. Continue with Claude Code locally

Open a terminal in the plugin folder and run `claude`. `CLAUDE.md` gives it the project context.
Divi's own code is at `../../themes/Divi/`, so Claude can look up how core modules
(for example Group or Accordion) are built.
