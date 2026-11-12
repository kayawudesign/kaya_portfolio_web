KAYA Portfolio — Japanese Editorial Edition

■ 開き方
ZIPを解凍し、「kaya_portfolio_web」フォルダ内の index.html をブラウザで開いてください。
インターネット接続やビルド作業は不要です。

■ サイト構成
- index.html：連続スクロール型の表紙、作品一覧、プロフィール
- home.js：縦方向のエディトリアル作品一覧の生成
- style.css：全ページ共通スタイル、レスポンシブ対応
- projects/：11件のプロジェクト詳細ページ
- pages/：元のポートフォリオから書き出した作品画像

■ 更新時のメモ
- 作品画像の名前と差し替え場所は pages/IMAGE-GUIDE.txt を参照してください。
- 作品名・説明・表示順は home.js と projects/ 内の各HTMLで編集できます。
- プロフィール文は index.html の PROFILE セクションで編集できます。
- 現在の作品画像は元のポートフォリオを保持しています。画像内に含まれる中国語表記は原作品の一部として残しています。
- 公開前に、作品の制作年・担当範囲・使用ツール・連絡先など、応募先に合わせて必要な情報を追記してください。

■ 表現方針
日本企業への応募を想定し、ナビゲーション・プロフィール・各プロジェクトの説明を日本語中心に整理しました。
既存の作品画像、10件の詳細ページ、ギャラリーの操作性は維持しています。


v5 Parallax update:
- The homepage is rebuilt as a continuous vertical editorial flow rather than a horizontal carousel or stacked cards. All project detail pages share the same ambient parallax layers.
- GSAP + ScrollTrigger drives a site-wide scrubbed parallax world and image-level depth movement in parallax.js.
- GSAP is loaded from CDN, so an internet connection is required for the scroll animation.
- prefers-reduced-motion is respected; without GSAP the static hero remains visible.


Continuous Parallax rebuild:
- The homepage project gallery is now a long-form staggered vertical sequence.
- A shared far / middle / near atmospheric layer moves at different speeds across the full document.
- Project artwork on the homepage and all 10 detail pages has subtle scroll-linked image movement.
- Section panels and autoplay horizontal gallery controls have been removed from the homepage experience.
- Mobile layout falls back to a single flowing column; reduced-motion preferences disable scroll animation.


v6 Carousel fix:
- Works carousel now auto-advances every ~4.5s (pause on hover / focus / drag / hidden tab / off-screen; ❚❚ button to stop; respects prefers-reduced-motion).
- Fixed duplicate panels piling up on every slide, per-panel ScrollTriggers + ScrollTrigger.refresh() hitches, CSS transform transition fighting the parallax, and pointer capture swallowing link clicks.
- pages/page-01, 05, 09, 24 were resized to 2400px wide (3-5MB -> ~0.5MB).


v7 Marquee:
- The works gallery is now a continuous right-to-left marquee (home.js: SPEED = px/sec).
- Hover pauses and expands the panel under the cursor; drag/swipe, arrow buttons and keyboard arrows nudge it; ❚❚ button stops it.
- prefers-reduced-motion: starts stopped.


v8 Menu + project pages:
- data.js is the single list of works (used by the marquee and the menu). Edit works there.
- menu.js adds a MENU button (top right) on every page: full-screen menu with HOME / WORKS / PROFILE and all 10 projects. Esc or CLOSE to dismiss.
- The KAYA wordmark (top left, also inside the menu) returns to index.html. The header now stays fixed while scrolling.

v9: page background is #A8A9AA (see --bg at the end of style.css).

v10: pages/page-01 is now a PNG (2400px wide, made from the original).

v11: hero image is full-bleed (no frame); hero parallax range reduced so edges never show.

v12: hero shows the whole image (no crop, no clip box), soft top/bottom edge, stronger layered parallax (see parallax.js).


v13 Split-screen project pages:
- projects/*.html: left = sticky image stage, right = scrolling chapters (split.js, ScrollTrigger start "top 55%" / end "bottom 55%").
- Chapters whose image file is missing are skipped automatically. Missing in this package: page-06, 07, 08, 10, 12, 14, 17, 18, 30, 31 (put them in pages/ and the chapters appear).
- Write chapter copy where the "ここにこのページの説明文を書きます" comment is.

v14: removed the play/pause button; project links open reliably (clones were inert, press now opens the pressed panel); phone hero shows the whole main visual.

v15: menu is grouped like the portfolio contents page (Illustration / Project / Concept). Edit names, order and page numbers in KAYA_MENU at the bottom of data.js. Pastel Art Association 2022 + 2023 is one entry.

v16: menu is a collapsible accordion (Illustration / Project / Concept) with one type system (serif for all text) and one motion system (shared easing and 3 speeds) defined at the top of the v16 block in style.css (--menu-* variables).

v17: every project page now shows at least 3 images. Dummy images live in pages/placeholders/ and dummy copy is marked with data-placeholder in projects/*.html (search for it to find and replace). Delete a placeholder figure + its chapter when real artwork is added.

v18: Traditional Chinese (default) + Japanese switch (中 / 日 in the header and menu). Both languages are written in the HTML (lang="zh-Hant" / lang="ja") and CSS shows the active one; English titles/labels stay in both. Home texts: index.html. Works: data.js (local/note = ja, localZh/noteZh = zh). Project pages: edit projects/*.html directly (each text exists as lang="zh-Hant" and lang="ja").

v19: project page footer = copyright notice (edit the text in projects/*.html footer).

v19b: footer is a centered English copyright line on every page, no top rule.

v20: hero water ripple (water.js). Tuning values are at the top of water.js. Needs http(s) hosting; opening index.html straight from disk (file://) keeps the still image.

v21: menu redesign (layout + motion from kaya_portfolio_menu_redesign.zip), recoloured with the site palette (--bg / --ink / --muted / --line / --accent). HOME and WORKS rows removed (categories numbered 01-03). The menu header is the same as the cover header (KAYA wordmark, PORTFOLIO 2017-2024, language switch + CLOSE).

v22: copyright / year range unified to 2017—2026; one serif (Ming) type system for the whole site (Noto Serif TC/JP via Google Fonts + Georgia); the menu's red wave line is replaced by text running along a curve (SVG textPath, GSAP ScrollTrigger scrub on startOffset 100% -> -100%, scroller = the menu). Phrase: menu.js (menuWaveText). Curve: menuWavePath.

v23: Succuba Secret Fruit page uses the new editorial text layout (class split--editorial on the section; CSS at the end of style.css). Figures can carry data-fallback="..." so a sample image shows until the real file exists (page-14.webp here).

v24: removed the three-column skills block (VISUAL DESIGN / BRANDING & PRODUCT / CREATIVE PLANNING) and the AREA OF INTEREST row from the home page profile section.

v25: removed the WORKS / PROFILE links from the home page header (the header now has the language switch and MENU only).

v26: hero ripple now also works when index.html is opened straight from disk (file://): water.js falls back to the embedded texture in water-tex.js. Stronger default (BEND 0.00016, SHEEN 0.0012). For current image locations and replacement instructions, see pages/IMAGE-GUIDE.txt.

v27: menu item 03 now has the English title '2022 Land Administration Day – Lakeside Hiking Event' (data.js KAYA_MENU), so all 10 rows are English title + Chinese name.

v28: Pastel Art Association split into projects/pastel-art-association-2022.html and -2023.html (11 works now). 2022 = printed pp.11-12 (files page-15/16); 2023 = printed pp.13-18 (files page-17..22; 17 and 18 are missing and show sample images until the files exist). Printed page number = file number - 4.

v29: Succuba Secret Fruit page = 'strip' layout (class split--strip): the four images are one full-bleed long strip that scrolls normally (inactive images dim to 40%); the text is the sticky part and cross-fades with a zoom-back as each image passes the 55% line. Images 3 and 4 share one text state (data-state=2). Logic: split.js (strip mode), CSS: end of style.css.

v30: Succuba text animation = option A. The title, Chinese name and rule are fixed; only the subtitle and the content swap (old fades up 0.3s, new rises 14px over 0.6s, staggered). No scaling. Image/text switch happens when an image reaches 65% of the viewport (split.js, 'top 65%'). Timings: style.css (v30 block) and the --d delays in the page.

v31: all project pages use the Succuba strip format (long image strip + fixed title block with swapping subtitle/content). Sample text and sample images (pages/placeholders/<slug>-01..04.webp) everywhere except Succuba Secret Fruit, which keeps its real text. Real artwork files in pages/ are untouched. Search 'data-placeholder' in projects/*.html to find what to replace.

v32: the last data row label is CREDIT on every project page (was PANITER on Succuba).

v33: editorial text: Japanese uses palt + 0 letter-spacing (6 lines like the layout draft); bottom clearance above the counter line is at least 24px; type sizes follow window height (svh) as well as width.

v34: the 10 other project pages follow the layouts (names, subtitles, data rows, color-palette dots, per-page image/text mapping). Title/name changes also applied to the menu and marquee (data.js). Long body text scrolls inside the text area (Don't Play With Your Food). Body paragraphs and CREDIT names are still sample text; palette dot colors are sample grays (edit <i style="--c:#rrggbb"> in each page).

v35: real texts from the layout drafts are in all 10 pages (Chinese as written in the drafts; Japanese = my translation, please review). Color-palette dots use the colors sampled from the drafts. Credits: Don't Play = KAYA｜陳致伶｜吳政欣｜張靜慧, Elf = KAYA｜陳致伶. Don't Play With Your Food uses the full-width exclamation mark. Images are still sample images.
