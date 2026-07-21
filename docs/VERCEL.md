# Vercel deployment

Course Signal deploys to Vercel as static dashboard assets plus one Flask serverless function. The deployment database is read-only and is rebuilt during Vercel's build phase for the selected institution. UIUC is only the default demo configuration.

## First deployment

1. Push this repository to GitHub and import it into Vercel.
2. Use Python 3.12+. Vercel reads the build command from `pyproject.toml` and runs `python3 build_vercel.py`.
3. For the UIUC demo, leave `COURSE_SIGNAL_INSTITUTION` unset (it defaults to `uiuc`).
4. Deploy and verify `/api/health`, `/api/institution`, and the dashboard.

For a different configured institution, set `COURSE_SIGNAL_INSTITUTION` in Vercel's project environment before deploying. Its configured source must be available during the build. Do not place protected registrar data in Git; use an approved build-time retrieval mechanism and Vercel environment secrets.

## Local Vercel check

```bash
pip install -r requirements.txt
python3 build_vercel.py
vercel dev
```

The first hosted deployment needs Vercel authentication/project selection, so deploy with `vercel` or connect the repository in the Vercel dashboard after the local checks pass.
