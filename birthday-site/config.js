// Everything you can personalise lives in this file.
// Paths are relative to the /public folder (e.g. "assets/photos/15.jpg" → public/assets/photos/15.jpg).

const config = {
  herName: 'Tyra',
  myName: 'Your Name',

  // YYYY-MM-DD. The site unlocks at local midnight on this date.
  // Add ?preview=1 to the URL to skip the countdown while you build.
  birthday: '2026-12-14',
  age: 23,

  // Leave empty to disable. Not real security: it only keeps casual eyes out.
  password: '',
  passwordHint: 'The word only we use.',

  meta: {
    title: 'For Tyra',
    description: 'A small birthday website, made with love.',
  },

  // The site is split into chapters, one page each. Change the titles and short lines freely.
  // {age} and {name} are filled in automatically.
  chapters: [
    { page: 'home', file: 'index.html', numeral: 'Prologue', title: 'Make a wish', line: 'Candles, cake, and the start of your birthday.' },
    { page: 'story', file: 'story.html', numeral: 'Chapter I', title: 'The birthday girl', line: 'The moments that made this birthday worth celebrating.' },
    { page: 'letter', file: 'letter.html', numeral: 'Chapter II', title: 'Since June 5th', line: 'My birthday letter to you. Read it slowly, and come back to it often.' },
    { page: 'love', file: 'love.html', numeral: 'Chapter III', title: '{age} reasons', line: 'One for every year of you.' },
    { page: 'friends', file: 'wishes.html', numeral: 'Chapter IV', title: 'Wishes from friends', line: 'The people who love you have something to say.' },
    { page: 'me', file: 'from-me.html', numeral: 'Chapter V', title: 'Wishes from me', line: 'My birthday messages to you, on video.' },
    { page: 'surprise', file: 'surprise.html', numeral: 'Chapter VI', title: 'Your birthday surprise', line: 'One more wish, and a gift to unwrap.' },
  ],

  // Optional colour overrides. Any key here replaces the matching CSS variable.
  theme: {
    // '--accent-700': '#4F6B48',
  },

  hero: {
    photo: 'assets/photos/25.jpg',
    alt: 'Tyra smiling softly in warm light',
    // Crop inside the arched frame: zoom in on a point of the photo (x/y in %, 0 = left/top).
    focus: { x: 50, y: 30, zoom: 1.1 },
    line: 'Today is entirely, unapologetically yours.',
  },

  statement:
    'Of all the ordinary days I have lived, the ones with you in them are the ones I keep.',

  timeline: {
    title: 'Every year with you',
    intro: 'A few of the moments I am celebrating today, alongside you.',
    items: [
      {
        chapter: 'Chapter one',
        date: '', // e.g. 'March 2025'
        title: 'The first dinner',
        text: 'I remember almost nothing about the food and everything about the way you laughed.',
        photo: 'assets/photos/39.jpg',
        alt: 'The two of us talking at dinner',
      },
      {
        chapter: 'Chapter two',
        date: '',
        title: 'Learning distance',
        text: 'Calls that ran past midnight. Your face on a small screen still lit up the whole room.',
        photo: 'assets/photos/1.jpg',
        alt: 'A phone showing a video call while sitting outside',
      },
      {
        chapter: 'Chapter three',
        date: '',
        title: 'The passenger seat',
        text: 'Some of my favourite hours are the quiet ones, going nowhere in particular with you.',
        photo: 'assets/photos/2.jpg',
        alt: 'Tyra in the passenger seat of a car',
      },
      {
        chapter: 'Chapter four',
        date: '',
        title: 'One hundred days',
        text: 'We counted them, and somehow it felt like both a long time and no time at all.',
        photo: 'assets/photos/40.jpg',
        alt: 'A collage celebrating one hundred days together',
      },
      {
        chapter: 'Chapter five',
        date: '',
        title: 'A quiet night in',
        text: 'The kind of closeness that makes everything else go silent.',
        photo: 'assets/photos/15.jpg',
        alt: 'A close-up of the two of us resting together',
      },
    ],
  },

  gallery: {
    title: 'The birthday girl, in frames',
    intro: 'Tap any photo to see it larger.',
    photos: [
      { src: 'assets/photos/46.jpg', alt: 'Tyra in a black dress against a marble wall', caption: 'Marble, and you in black' },
      { src: 'assets/photos/43.jpg', alt: 'Dinner portrait in burgundy', caption: 'Dinner, and you in burgundy' },
      { src: 'assets/photos/47.jpg', alt: 'Standing outdoors in a textured pink dress', caption: 'Dressed like the day mattered' },
      { src: 'assets/photos/38.jpg', alt: 'Mirror portrait in a fitted black outfit', caption: 'Effortless, as always' },
      { src: 'assets/photos/5.jpg', alt: 'Candid dinner photo in a peach outfit', caption: 'Mid-sentence, mid-smile' },
      { src: 'assets/photos/49.jpg', alt: 'Portrait in blue scrubs', caption: 'The future, already looking good on you' },
      { src: 'assets/photos/36.jpg', alt: 'Close selfie in black with a peace sign', caption: 'A small burst of light' },
      { src: 'assets/photos/44.jpg', alt: 'Seated dinner portrait in burgundy', caption: 'An evening worth keeping' },
      { src: 'assets/photos/48.jpg', alt: 'Mirror photo with a jacket and heart stickers', caption: 'A little playful drama' },
    ],
  },

  reasons: {
    title: 'Reasons I love you',
    intro: 'One for every year. Tap a card to turn it over.',
    // One card is shown per year of her age. Add more lines if she is older than this list is long.
    list: [
      'The way you laugh before you reach the end of your own jokes.',
      'You make ordinary errands feel like plans.',
      'You remember the small things people tell you, and it shows.',
      'How calm you make a room feel the moment you walk in.',
      'You are kind even when nobody is keeping score.',
      'The way you say my name when you are half asleep.',
      'You chase what you want, and you work for it.',
      'Your patience with me on my worst days.',
      'You notice beauty in things other people walk past.',
      'Every call with you ends too early.',
      'You are honest with me, even when it is hard.',
      'The way you dress for a dinner like it is an event.',
      'You care for people for a living, and you mean it.',
      'You make distance feel like a detail.',
      'Your taste in songs, which has quietly become mine.',
      'You forgive quickly and love loudly.',
      'The face you make when food is very, very good.',
      'You believe in me before I believe in myself.',
      'You turn small moments into memories.',
      'You are my favourite person to do nothing with.',
      'You make me want to be better, without ever asking.',
      'Because it is you. It was always going to be you.',
      'The way you hold my hand like it is the most natural thing.',
      'You are brave in ways you do not even notice.',
      'Every year with you is better than the last.',
    ],
  },

  // Chapter II: your letter, shown as a slow, scrolling story.
  // Write it in the text below. Each line becomes one block; blank lines are ignored.
  //   # Title        starts a new part (I, II, III… are numbered for you)
  //   plain text     a normal paragraph
  //   ~ text         a short line on its own, larger and in italics
  //   ! text         a big moment: huge type that brightens word by word as she scrolls
  //   - text         a list line (consecutive lines are grouped)
  //   * text         one of the things you love, set very large (consecutive lines are grouped)
  //   + text         a wish, with a small leaf (consecutive lines are grouped)
  //   " text         a quote
  //   **words**      inside any line: highlighted in sage italics
  //   ❤️             becomes a small sage heart
  letter: {
    signoff: 'Happy birthday, my love. ❤️',
    finalLine: 'I love you. Today, tomorrow, and through every chapter life allows us to share. ❤️',
    closing: 'Always yours,',
    // signature defaults to myName
    text: `
# June 5th, 2025
! Sometimes I think about June 5th, 2025.
~ Just one day.
One ordinary day that neither of us knew would change so much for us.
I didn't know that meeting you would eventually give me someone I would care about this deeply. I didn't know that the girl I met that day would become the person whose happiness would genuinely matter so much to me. I didn't know that your name would eventually become attached to so many of my favourite memories.
~ But here we are.
~ More than a year later.
And this is already our second birthday together.
~ That thought alone makes me emotional.

# A story
Because when I look back at everything between that first day and today, I don't just see a relationship.
! I see a story.
I see two people who met unexpectedly, got closer, fell in love, learned each other, laughed together, missed each other, misunderstood each other sometimes, made mistakes, forgave each other, grew together and somehow kept finding their way back to one another.
And through all of that, I found something in you that I don't ever want to lose.
! I found home in a person.

# Becoming her
Sweety, my love, I wish you could see yourself the way I see you.
Because sometimes I know you worry about your future. You wonder whether you're doing enough. Whether you're moving fast enough. Whether you'll become the woman you dream about becoming.
And whenever you feel like that, I want you to remember something:
! You are already becoming her.
- You don't have to have everything figured out at 23.
- You don't have to know exactly where life is taking you.
- You don't have to be perfect.
~ You just have to keep going.
And I promise you, there is something so beautiful about watching you try.
- Watching you dream.
- Watching you fight for your future.
- Watching you continue even when you don't feel as strong as everyone thinks you are.
! I am proud of you, Tyra.
Not just for what you've achieved.
- I'm proud of you for surviving the days nobody sees.
- I'm proud of the woman you are when nobody is clapping for you.
- I'm proud of the girl who sometimes doubts herself but still wakes up and tries again.
And one day, when you're standing exactly where you've always dreamed of standing, I hope you remember this version of yourself.
- The version that didn't give up.
- The version that kept going.
- The version that didn't know exactly how everything would work out but chose to believe anyway.
And when you finally become that woman, I hope I am somewhere close enough to look at you and say,
" Baby, I told you. I always knew you could do it.

# The little things
There are so many things I love about you.
* Your heart.
* Your ambition.
* Your strength.
* Your softness.
* Your little ways.
* Your smile.
The way your presence can change my entire mood.
And even the little things you probably think I don't notice.
! I notice.
I notice more than you know.
Because when you love somebody deeply, they become part of the details of your life.
~ And somehow, you've become part of mine.

# Distance
That's why distance has never been easy.
There are moments I wish I could simply be beside you.
- Not on a phone.
- Not through a screen.
- Not through messages.
~ Just beside you.
+ I wish I could see your face when you're happy.
+ I wish I could hold you when you're having a terrible day.
+ I wish I could randomly show up with something you love.
+ I wish I could sit beside you in silence and not need a phone to feel close to you.
+ I wish I could experience more of your life physically instead of sometimes having to experience it from miles away.
But even with the distance, you've taught me something.
That someone can be far away and still feel incredibly close to your heart.
~ And you are.
You're closer to my heart than you probably realize.

# Still writing it
There have been moments between us that weren't perfect.
- We've had misunderstandings.
- We've had moments where we hurt each other.
- We've had days where loving each other required patience.
~ But honestly?
Those moments don't make me want to erase our story.
! They make me appreciate the fact that we are still writing it.
Because I don't want a relationship that only survives beautiful days.
I want us to become the kind of love that can look at the difficult days and say,
" We survived that too.
- I want us to grow.
- I want us to become better people together.
- I want us to look back years from now and laugh about the things that once felt so serious.
I want us to have stories that begin with,
" Do you remember when we…?

# More us
I want more birthdays.
* More anniversaries.
* More random calls.
* More late-night conversations.
* More arguments we eventually laugh about.
* More trips.
* More pictures.
* More ordinary days.
* More memories.
* More life.
! More us.
And if I'm being completely honest with you, that's probably what scares me the most about loving someone this much.
Because when someone becomes this important to you, you realize how much you have to lose.
~ But I would still choose it.
! I would choose you.
Because knowing you has been one of the most beautiful things that has happened to me.

# I'd still walk toward you
And if I had the chance to go back to June 5th, 2025, knowing everything I know now…
- Knowing the distance.
- Knowing the difficult days.
- Knowing the misunderstandings.
- Knowing the tears.
- Knowing how deeply I would eventually love you.
* I'd still walk toward you.
* I'd still want to meet you.
* I'd still want to know you.
* I'd still want our story.
! Because you are worth every beautiful and difficult part of it.

# What I pray for you
My baby, as you enter another year of your life, I don't just pray for money, success, school, career or achievements for you.
! I pray for peace.
The kind of peace that makes you stop questioning whether you're enough.
+ I pray that God gives you a heart that isn't constantly afraid of the future.
+ I pray that you never lose yourself while trying to become successful.
+ I pray that you get the life you've been dreaming about.
+ I pray that your dreams of becoming a midwife become reality.
+ I pray that one day you look around and realize that all the things you cried about, worried about and prayed about eventually worked out.
And when that day comes, I hope you remember the girl you were today.
- Because she deserves credit too.
- She deserves to be loved too.
- She deserves to be celebrated too.
~ And today, I celebrate her.
! I celebrate you.
- Not the perfect version of you.
- Not some future version of you.
! You.
- The Sweety I know right now.
- The girl I fell in love with.
- The girl who became my person.
- The girl whose birthday I get to celebrate for the second time.

# One day
And maybe one day we'll be much older.
Maybe we'll look completely different.
Maybe life will have taken us places we can't even imagine right now.
~ But I hope we still remember this.
I hope we remember being young and stupidly in love.
I hope we remember the distance.
- The calls.
- The messages.
- The birthdays.
- The little surprises.
- The days we missed each other.
- The days we couldn't stop laughing.
~ I hope we remember that before life became everything we dreamed it would be, we had each other.
And if life allows me to be beside you through those future chapters, I want to be there.
- When you win.
- When you fail.
- When you're tired.
- When you're scared.
- When you're celebrating.
- When you're becoming.
- When you need someone to remind you who you are.
I want to be the person you can look beside you and find.
Because loving you isn't something I only want to do when everything is beautiful.
! I want to love you through the becoming.
- Through every version of you.
- Through every chapter.
- Through every season.

# How far you've come
So today, my love, please don't worry about how far you still have to go.
! Look at how far you've already come.
~ And be proud of yourself.
~ Because I am.
~ More than you know.
! Happy birthday, my beautiful Sweet. ❤️
- Thank you for being born.
- Thank you for finding your way into my life.
- Thank you for giving me memories I will carry for the rest of my life.
- And thank you for allowing me to love you.
I don't know what the future has written for us.
~ But I know what I hope for.
I hope there are many more birthdays where I get to say this to you.
I hope there are many more years where your birthday isn't just something I celebrate from a distance, but something I get to wake up beside you and experience with you.
I hope one day I can look at you on your birthday, hold your hand, look into your eyes and tell you all of this without a phone between us.
And if that day comes, I probably won't even need a long speech.
I'll just look at you and think:
" We really made it.

# That man is me
Until then, never forget this:
There is a man somewhere in this world who is incredibly grateful that a girl named **Tyra Maame Serwaa Osei-Wusu** was born.
- A man who is proud to call you his love.
- A man who believes in you even on the days you don't believe in yourself.
- A man who wants to see you win.
- A man who wants to watch your dreams become reality.
- A man who loves you not just for who you are today, but for every beautiful version of you that you're still becoming.
! And that man is me.

# May 23 be gentle
! Happy birthday, my baby. ❤️
+ May 23 be gentle with you.
+ May it bring you closer to your dreams.
+ May it heal the parts of you that you've never spoken about.
+ May it give you reasons to smile more than you cry.
+ May God protect you everywhere you go.
And may this year become one of the chapters you'll look back on and say,
" That was the year everything started changing for me.

# All over again
! I love you, Tyra.
- More than these words can carry.
- More than one birthday message can explain.
And if you ever doubt it, come back to this message years from now.
~ Read it again.
And remember that on your 23rd birthday, there was someone who looked at your life, your dreams, your imperfections, your heart, your past, your present and everything you were still becoming…
~ and still thought,
" I would choose her all over again.
`,
  },

  cake: {
    line: 'Make a wish, then blow out the candles.',
    // Photo of the cake, background removed, with the candles in the photo left unlit.
    image: 'assets/cake/chocolate-cake.webp',
    imageAlt: 'A chocolate birthday cake with rainbow sprinkles and six striped candles',
    // Where each wick tip is in the photo, in % of the image width (x) and height (y).
    // An animated flame is placed on each one. Only change these if you swap the photo.
    flames: [
      { x: 20.31, y: 14.47 },
      { x: 29.3, y: 8.07 },
      { x: 41.41, y: 20.18 },
      { x: 57.91, y: 6.58 },
      { x: 73.63, y: 19.3 },
      { x: 79.3, y: 11.4 },
    ],
    // Your video birthday wish. It starts playing by itself, with sound, right after the celebration.
    // Put the file in public/assets/videos (a poster image is optional). The current file is a sample clip.
    afterVideo: {
      label: 'One more thing',
      title: 'A birthday wish from me',
      line: 'I have been waiting all day to say this.',
      video: 'assets/videos/birthday-wish.mp4',
      poster: 'assets/videos/birthday-wish.jpg',
    },
    // Shown under "Happy Birthday" once the candles are out. {age} is replaced with her age.
    finaleLine: 'Here is to {age}, and to every wish coming true.',
    // One short blow puts out every candle. Raise above 1 to make it even easier, lower if talking sets it off.
    sensitivity: 1,
  },

  // Chapter III: video wishes from friends. Put the files in public/assets/videos.
  // Missing files show an elegant "Coming soon" card.
  wishes: {
    title: 'Happy birthday, from all of us',
    intro: 'A few people who love you recorded a birthday message. Tap a card to play it.',
    friends: [
      { name: 'Friend One', relation: 'Best friend', video: 'assets/videos/friend-1.mp4', poster: 'assets/videos/friend-1.jpg' },
      { name: 'Friend Two', relation: 'Since school', video: 'assets/videos/friend-2.mp4', poster: 'assets/videos/friend-2.jpg' },
      { name: 'Friend Three', relation: 'Family', video: 'assets/videos/friend-3.mp4', poster: 'assets/videos/friend-3.jpg' },
    ],
  },

  // Chapter IV: your own birthday videos. Add as many as you like.
  fromMe: {
    title: 'Happy birthday, from me',
    intro: 'A few things I wanted to tell you on your birthday, face to face, even through a screen.',
    // When true, these unlock once she has watched every available friend video.
    lockUntilFriendsWatched: true,
    lockedText: "Watch your friends' wishes first",
    videos: [
      { title: 'Happy birthday, my love', note: 'Start with this one.', video: 'assets/videos/from-me-1.mp4', poster: 'assets/videos/from-me-1.jpg' },
      { title: 'What this year meant to me', note: '', video: 'assets/videos/from-me-2.mp4', poster: 'assets/videos/from-me-2.jpg' },
      { title: 'My birthday wish for you', note: 'Save this one for last.', video: 'assets/videos/from-me-3.mp4', poster: 'assets/videos/from-me-3.jpg' },
    ],
  },

  music: {
    enabled: true,
    // Starts when she taps "Open" on the intro screen.
    startOnOpen: true,
    tracks: [
      { title: 'Our first song', artist: 'Artist', src: 'assets/music/song-1.mp3' },
      { title: 'The one from the car', artist: 'Artist', src: 'assets/music/song-2.mp3' },
    ],
    // Optional short sound played when the last candle goes out (e.g. 'assets/music/cue.mp3').
    cue: '',
  },

  wishJar: {
    title: 'The birthday wish jar',
    intro: 'Birthdays deserve more than one wish. Write another and let it go. Nothing is saved; it is just for you.',
  },

  scratch: {
    title: 'Your birthday gift',
    intro: 'Scratch the card to unwrap it.',
    surpriseTitle: 'Dinner is booked.',
    surpriseText: 'Saturday, 8pm. Wear something you love. I will pick you up.',
  },

  closing: {
    line: 'Happy birthday, my love.',
    photo: 'assets/photos/50.jpg',
    alt: 'Tyra in soft afternoon light',
  },

  // Hidden: tap the small heart in the footer five times (or type her name on a keyboard).
  easterEgg: {
    title: 'You found it.',
    message: 'I hid this here because you notice everything. I love that about you. Look under your pillow tonight.',
  },
};

export default config;
