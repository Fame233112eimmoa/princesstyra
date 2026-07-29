Media folders are ready for your real upload set.

Use this structure:
- `media/photos/` for images
- `media/videos/` for video files
- `media/posters/` for optional video poster images

When your files arrive, each gallery item in `content.js` should follow this shape:

```js
{
  id: "memory-019",
  type: "image", // or "video"
  src: "media/photos/first-trip-01.jpg",
  thumbnail: "media/photos/first-trip-01.jpg", // optional for images
  poster: "media/posters/first-trip-01.jpg",   // optional for videos
  alt: "A short accessible description",
  caption: "The line you want to show in the gallery and lightbox.",
  date: "September 2023",
  layout: "portrait", // feature | portrait | square | wide | tall
  filters: ["travel", "together"]
}
```

Suggested workflow:
1. Drop the real files into the folders above.
2. Replace the sample entries in `content.js` with the real file paths.
3. Keep captions short in the grid; longer context can stay in the letters or timeline.

The gallery is already set up to batch large libraries, so you do not need to place all 50+ items directly in the HTML.
