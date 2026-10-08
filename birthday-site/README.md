# Birthday site

A small, motion-rich birthday website. Built with Vite, vanilla JS, GSAP + ScrollTrigger and Lenis.

Everything you need to personalise is in **`config.js`**. You should never need to touch `src/`.

## Run it locally

```bash
cd birthday-site
npm install
npm run dev
```

Open the URL it prints. While her birthday is still in the future, the site shows a countdown. To skip it while you work, add `?preview=1`:

```
http://localhost:5173/?preview=1
```

To try it on your phone, open the "Network" URL that `npm run dev` prints (the phone must be on the same Wi-Fi). The microphone will **not** work over that plain-http address. Use the deployed https link to test blowing out the candles.

## Pages

The site is split into chapters, one page each, so heavy content like long videos only loads on its own page:

| Page | File | Contains |
| --- | --- | --- |
| Prologue · Make a wish | `index.html` | Countdown, name intro, hero, the cake, "For you", list of chapters |
| Chapter I · The birthday girl | `story.html` | Timeline and gallery |
| Chapter II · Since June 5th | `letter.html` | Your letter, as a scrolling story in 14 parts |
| Chapter III · 23 reasons | `love.html` | Reason cards |
| Chapter IV · Wishes from friends | `wishes.html` | Friends' video messages |
| Chapter V · Wishes from me | `from-me.html` | Your own birthday videos |
| Chapter VI · Your birthday surprise | `surprise.html` | Wish jar, scratch card, closing |

- Rename chapters in `config.chapters`.
- Every page has a **Chapters** menu (top right) and a "Next chapter" link at the bottom. Moving between pages uses a soft curtain transition.
- The name intro plays once per visit. Coming back to the home page skips it.
- Music carries on from page to page. Some phones need one tap on the new page before it resumes.
- The countdown and password protect every page, including direct links.
- `?preview=1` is remembered for the rest of the visit, so you only need it once.

## Personalise

Open `config.js` and edit:

| Setting | What it does |
| --- | --- |
| `herName`, `myName`, `age` | Used throughout the site |
| `herFullName`, `myFullName` | Shown in the footer |
| `birthday` | `YYYY-MM-DD`. The site unlocks at local midnight on that date |
| `countdown` | `true` shows the countdown screen until her birthday, `false` turns it off for testing |
| `password` | Optional secret word. Leave `''` to turn it off. It's a light privacy gate, not real security |
| `hero`, `statement` | The first two sections |
| `timeline.items` | Chapters of your story: title, text, optional date, photo |
| `gallery.photos` | The horizontal gallery |
| `reasons.list` | One card is shown per year of her age |
| `letter` | Your letter (`text`), sign-off, `finalLine`, closing, optional `signature`. See [The letter](#the-letter) |
| `cake` | Headline, candle count (defaults to age), mic `sensitivity` |
| `wishes` | Friends' video messages and your own finale video |
| `music` | Playlist and an optional "candles out" sound cue |
| `scratch` | The surprise under the scratch card |
| `easterEgg` | Hidden message: tap the small heart in the footer 5 times (or type her name on a keyboard) |
| `theme` | Optional colour overrides, e.g. `'--accent-700': '#4F6B48'` (main sage), `'--tint-100': '#E1E8DB'` (pale sage) |

## The letter

`letter.text` in `config.js` holds the letter. Each line becomes one block, and a short marker at the start of a line changes how it looks:

| Start a line with | Shown as |
| --- | --- |
| `# ` | A new part, numbered I, II, III… automatically |
| *(nothing)* | A normal paragraph |
| `~ ` | A short line on its own, larger and in sage italics |
| `! ` | A big moment: huge type that brightens word by word as she scrolls |
| `- ` | A list line (consecutive lines are grouped) |
| `* ` | One of the things you love, set very large (consecutive lines are grouped) |
| `+ ` | A wish with a small leaf (consecutive lines are grouped) |
| `" ` | A quote |
| `**words**` *(anywhere in a line)* | Highlighted in sage italics, as used for her full name |
| `❤️` | Shown as a small sage heart |

The background shifts gently between white and pale sage from one part to the next.

## Adding photos

1. Put images in `public/assets/photos/`.
2. Reference them in `config.js` as `assets/photos/your-file.jpg`.
3. Always write a short `alt` description.

**Compression tips.** Aim for under 300 KB per photo.

- Resize to about **1400 px** on the long edge. Phones don't need more.
- Export as JPEG quality ~75–80, or use [Squoosh](https://squoosh.app) (MozJPEG or WebP).
- On a Mac you can batch-resize in place: `sips -Z 1400 public/assets/photos/*.jpg`

## Adding video wishes

**Your birthday wish after the cake** (`config.cake.afterVideo`)

Right after she blows out the candles and the celebration ends, the page glides to a "One more thing" moment, and this video **starts playing by itself, with sound**, inside an arched frame. There is a button to watch it full screen.

Phones only allow a video to start with sound if it was unlocked by a tap. Her tap on "Tap to begin" (or on a candle) quietly does this. If a browser still refuses sound, the video plays muted with a "Tap for sound" button.

The file there now (`birthday-wish.mp4`) is a sample clip from your videos. Replace it with your real message.

- Save it as `public/assets/videos/birthday-wish.mp4`.
- Add an optional poster image, `birthday-wish.jpg`.
- Change the label, title and line in the config.

There are also two video chapters.

**Wishes from friends** (`config.wishes.friends`)

1. Ask friends to film in **portrait**, 30–60 seconds, in good light.
2. Save the files to `public/assets/videos/` with the names in `config.js` (e.g. `friend-1.mp4`). Rename the friends and add or remove entries freely.
3. Add a poster image (a still frame) with the same name, e.g. `friend-1.jpg`. Without one, the card shows the friend's initial.

**Wishes from me** (`config.fromMe.videos`)

1. Add as many of your own videos as you like, each with a `title` and an optional short `note` (e.g. "Start with this one.").
2. The default files are `from-me-1.mp4`, `from-me-2.mp4` and `from-me-3.mp4`, each with a matching `.jpg` poster.
3. With `lockUntilFriendsWatched: true`, your chapter stays locked until she has watched every friend video that exists. She sees a note linking her back to the friends' chapter. When she finishes the last friend video, a note invites her to yours. Set it to `false` to keep everything open.

Watched videos are remembered on her device. Missing files show an elegant "Coming soon" card, so you can deploy before every video has arrived.

**Compression tips.** Aim for under 10 MB each.

- Use **MP4 (H.264 + AAC)**. iPhone `.MOV` files should be converted.
- With [HandBrake](https://handbrake.fr): preset "Fast 720p30", then "Web Optimized".
- Or with ffmpeg:
  ```bash
  ffmpeg -i input.mov -vf "scale=-2:1280" -c:v libx264 -crf 26 -preset slow -c:a aac -b:a 128k -movflags +faststart friend-1.mp4
  ffmpeg -i friend-1.mp4 -ss 00:00:01 -frames:v 1 -q:v 3 friend-1.jpg
  ```

## Adding music

1. Put MP3 or M4A files in `public/assets/music/`.
2. List them in `config.music.tracks` with a title and artist.
3. Music starts when she taps **Open** on the intro screen (browsers block autoplay before a tap). A small control in the bottom-right corner pauses it and shows "Our songs". Music pauses automatically while a video wish plays.
4. Optional: set `music.cue` to a short sound that plays when the last candle goes out.

**Compression tips.** 128 kbps MP3 is plenty, about 1 MB per minute. Keep the playlist to 2–4 songs.

## The cake photo

The cake is a real photo, `public/assets/cake/chocolate-cake.webp`.

- Its background has been removed.
- The flames in the original photo were erased, so the candles are unlit and their wicks still show.
- The site places a live, animated flame on each wick, listed in `cake.flames` in `config.js`.

To use a different cake photo:

1. Pick a photo with candles in it. Lit or unlit both work, but lit flames have to be painted out first.
2. Remove the background. On a Mac, open it in Preview and choose **Tools → Remove Background**, then export as PNG.
3. Save it in `public/assets/cake/` and set `cake.image` in `config.js`.
4. For each candle, add an entry to `cake.flames` with the wick tip's position in % of the image:
   - `x`: from the left edge
   - `y`: from the top edge

   The number of entries is the number of candles.

## The candles (microphone)

- Tapping **Tap to begin** asks for the microphone. **One short, gentle blow** (about a quarter of a second) puts out every candle, rippling across the cake. The site keeps measuring the room's background noise, so it adapts to a quiet bedroom or a noisy party. Claps, taps and music don't count.
- Audio is analysed live and never recorded, stored or sent anywhere. The microphone is switched off as soon as the candles are out.
- **The microphone requires HTTPS.** It works on the deployed Netlify or GitHub Pages link and on `localhost`, but not on a `192.168…` network address.
- If permission is denied or no mic is available, she can tap the cake to put the candles out one by one. A "Can't blow? Tap instead" link is always there.
- To make it even easier, raise `cake.sensitivity` (e.g. `1.5`). If talking sets it off, lower it (e.g. `0.7`).

Tested in Chrome. Built to work on iOS Safari 16+ and Android Chrome.

## Deploy for free (HTTPS)

### Netlify (easiest)

**Drag and drop:**

1. Run `npm run build`.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop) and drop the `dist` folder.
3. You get an `https://…netlify.app` link. Rename the site in Site settings.

**From GitHub:** "Add new site" → import your repo. Set **Base directory** to `birthday-site`. The build settings come from `netlify.toml`.

### GitHub Pages

The build uses relative paths, so it works from any sub-path.

1. Run `npm run build`.
2. Publish the contents of `dist/`. The simplest option is a GitHub Actions workflow. Create `.github/workflows/birthday.yml` at the **repository root**:

```yaml
name: Deploy birthday site
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    defaults:
      run:
        working-directory: birthday-site
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: birthday-site/dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

3. In the repo on GitHub, go to **Settings → Pages → Source: GitHub Actions**.

Note: this replaces whatever GitHub Pages currently serves for the repo.

## Before you send it

- Open the deployed link on your own phone and go through everything once: the countdown (without `?preview=1`), the candles, the videos and the music.
- Your own visits mark videos as watched on *your* device only. It won't affect hers.
- Keep the link private. Anyone with it can see the site, and the password only keeps casual visitors out.

## Project structure

```
birthday-site/
├─ config.js              ← all your content
├─ index.html             ← prologue (home)
├─ story.html, love.html, wishes.html, surprise.html
├─ public/assets/
│  ├─ photos/             ← images
│  ├─ videos/             ← video wishes + posters
│  └─ music/              ← songs
└─ src/
   ├─ main.js             ← wires everything together (shared by every page)
   ├─ styles/main.css     ← design tokens + styles
   └─ modules/            ← one file per feature (cake, wishes, music, …)
```
