# FINDA — Cinematic investor pitch

A standalone, motion-led web pitch for FINDA, the Nigerian housing technology company. An original investor story inspired by exceptional interaction design and typography, built in plain HTML/CSS/JavaScript. No Node packages are needed to serve or deploy the website.

**Independent project:** no source files, hosting configuration, databases or assets are changed in the existing GitLab showroom or production FINDA apps.

## Sections

- Housing should move you forward
- The broken housing journey (animated 404 metaphor)
- Nigerian housing market, cited
- FINDA's technology company vision
- Interactive left-to-right product experience
- RentPlan + Rent Track lifestyle loop
- Move-In Pay Later (lender-partner stage, not live)
- FINDA Direct, Managed, Agent OS, and partnership revenue
- Competitive thesis + city-by-city rollout
- Just launched / early validation
- FINDA's long-term housing technology vision
- Investor and partnership contact

## Preview locally

Open `index.html` in Chrome/Firefox, or run:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Publish on GitHub Pages

1. Create a **new public repository** (suggested name `finda-investor-pitch`) on GitHub. Do not modify the current FINDA code repository or GitLab showroom.
2. Upload all files, including the `.github/workflows/deploy.yml` workflow and `assets` folder, to the repository's `main` branch.
3. In **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**. The workflow is ready to publish this static site. Wait for a successful Pages build.
4. Verify the site opens in a private/incognito window without a GitHub sign-in request. The expected URL is `https://<YOUR-USER>.github.io/finda-investor-pitch/` only if the repository name is exactly `finda-investor-pitch` and Pages is enabled.
5. Share the public link with investors once browser interaction checks pass.

Or use the included Termux helper: `bash publish-github-termux.sh` after downloading and extracting this package. The helper runs only in this extracted folder and prompts you for GitHub authentication through the official GitHub CLI if necessary.

## Investor accuracy

- Product materials distinguish developed concepts and currently deployed features; do not claim full Android/web parity without QA.
- The finance offering is proposed, not live; no lender has been signed and FINDA does not currently custody tenant/loan funds.
- Market statistics sourced directly in the clickable Research Sources panel.
- No invented user counts, financing take rates, customer acquisition, GMV or revenue.
- Contact address in the current deck is `adebimpe476@gmail.com`.
- Web design references: recent.design, Awwwards, Codrops and supplied example motion videos. This is original code, not a copied site.

## Accessibility & performance

Responsive mobile-first grid; native smooth horizontal scroll + keyboard arrows; reduced-motion accessibility; animation only when visible; CSS and SVG visualizations with small local product images; no interactive overlays blocking links.
