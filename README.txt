LOGILATOR WEBSITE 2.7 (new headline, speed disclaimers, payment page, changelog, image viewer)
================================================
Upload the contents of the "site" folder to any static host
(Cloudflare Pages, Netlify, GitHub Pages, Vercel). No build step.

PRE-FILLED in site/assets/config.js (edit there to change):
  wallet       your USDT TRC20 address (starts with T, 34 characters)
  payAmount    price as a number, e.g. 49
  price        text for the home-page pricing card, e.g. 49 USDT
  priceNote    e.g. one-time payment
  deliveryTime what you promise after proof is sent (default: within 24 hours)
  version      current app version

Until wallet and payAmount are valid, buy.html shows "Payments opening soon"
and does NOT show an address. After you set them, open buy.html and compare
the address on screen with your wallet, character by character.

HOW A SALE WORKS
1. Buyer sends USDT (TRC20) to your address and emails or DMs the TXID and a
   reference like LGL-1A2B3C4D.
2. You look the TXID up on tronscan.org: check the receiving address, amount,
   that it is USDT TRC20 and that it is confirmed.
3. You send the buyer the zip or a download link (buyer zip, not your personal one).
4. Refunds: in USDT to the address the buyer gives you (see terms.html).
   Contact addresses used: logithslogic@gmail.com and @itsmelogith on X.

CHECK BEFORE GOING LIVE
- Use a wallet you fully control. Never give anyone your seed phrase.
- Read terms.html, privacy.html and risk.html. The 7-day refund, single-user
  licence, liability wording and delivery time are proposed defaults, not legal
  advice. Change anything you will not honour.
- Because you are under 18, involve a parent or guardian before you advertise
  or take payment (contracts, taxes, platform advertising rules). Many ad
  platforms restrict crypto-related ads, so read their policy first.
- Screenshots and the demo video use sample data on a demo account.
- Fonts load from Google Fonts (stated on the privacy page).
- Once the domain is known, make the og:image URL absolute for link previews.

NEW RELEASES
Edit the "rows" list in build_pages.py is NOT needed: simply open site/changelog.html
and copy an existing entry block. Move the "Latest" pill (<span class="pill">Latest</span>)
and the class "latest" to the newest version, then set version in site/assets/config.js.

IMAGE VIEWER
Click any screenshot to enlarge it. Scroll wheel or trackpad pinch zooms toward the cursor,
drag pans, double-click zooms in or resets, two-finger pinch on phones. Arrow keys switch
between images (or pan when zoomed in). + and - also zoom. 0 resets. Esc closes.

DEMO VIDEO
site/assets has demo.mp4 (H.264, plays everywhere) and demo.webm (fallback). Keep BOTH
files next to each other in assets/. If the video does not play when you open index.html
by double-clicking it, first EXTRACT the whole zip (do not open the page from inside the
zip), or upload the site to a host. Videos need the assets folder beside the page.
