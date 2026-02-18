/* Chessbuds — About Modal */

(function () {
  function injectAbout() {
    const overlay = document.createElement('div');
    overlay.className = 'about-overlay';
    overlay.id = 'about-overlay';
    overlay.innerHTML = `
      <div class="about-modal">
        <button class="about-close" onclick="closeAbout()">&times;</button>
        <img class="about-logo" src="King Favicon.png" alt="Chessbuds">
        <h2 class="about-title">Chessbuds</h2>
        <p class="about-tagline">Chess with Character</p>
        <div class="about-divider"></div>
        <p class="about-body">Chess has always been deep. We wanted to make it personal. Chessbuds gives every piece on the board a name, a face, and a reason to root for them.</p>
        <p class="about-body">The strategy doesn't change. The depth is still there. But when the pieces have personality and the board tells a story, you stop playing positions and start playing moments. That's a different relationship with the "King's Game."</p>
        <p class="about-body">At its core, Chessbuds exists to teach chess and help more people fall in love with the game. Not just the rules, but the thinking, the patience, the moments that stick with you long after the game is won or lost.</p>
        <p class="about-body">We're still building. If you're here, you're early, and we're glad you found us. Welcome to the Kingdom.</p>
        <div class="about-footer">For the love of the game</div>
      </div>
    `;

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeAbout();
    });

    document.body.appendChild(overlay);

    // Bind the logo
    const logo = document.getElementById('game-title');
    if (logo) {
      logo.addEventListener('click', function (e) {
        e.preventDefault();
        openAbout();
      });
    }
  }

  function openAbout() {
    document.getElementById('about-overlay').classList.add('active');
  }

  function closeAbout() {
    document.getElementById('about-overlay').classList.remove('active');
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.getElementById('about-overlay')?.classList.contains('active')) {
      closeAbout();
    }
  });

  window.openAbout = openAbout;
  window.closeAbout = closeAbout;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectAbout);
  } else {
    injectAbout();
  }
})();
