# googlefonts
Cloudflare worker to proxy [Google Fonts](https://fonts.google.com/).
Get your favourite google fonts while preserving your users' privacy and maintaining performance.

## installation
```bash
gh repo clone sportshead/googlefonts # git clone https://github.com/sportshead/googlefonts.git
cd googlefonts
bun install
bun run deploy
```

## usage
Prefix `fonts.googleapis.com` with your worker's host. See https://googlefonts.sportshead.workers.dev/ for more info.
