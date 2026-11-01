KAYA Portfolio — Japanese Editorial Edition

■ 開き方
ZIPを解凍し、「kaya_portfolio_web」フォルダ内の index.html をブラウザで開いてください。
インターネット接続やビルド作業は不要です。

■ サイト構成
- index.html：連続スクロール型の表紙、作品一覧、プロフィール
- home.js：縦方向のエディトリアル作品一覧の生成
- style.css：全ページ共通スタイル、レスポンシブ対応
- projects/：10件のプロジェクト詳細ページ
- pages/：元のポートフォリオから書き出した作品画像

■ 更新時のメモ
- 作品画像を差し替える場合は pages/ 内の画像を更新してください。
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
