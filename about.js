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
        <p class="about-body">It's a new way to engage with the "King's Game." Same strategy, same depth, but now the board has personality. The pawns have stories. The queen has presence. Every match feels like something more than a puzzle.</p>
        <p class="about-body">At our core, we exist to teach chess and help more people fall in love with the game. Not just the rules, but the thinking, the patience, the moments that stick with you long after the game is won or lost.</p>
        <p class="about-body">We're still building. If you're here, you're early, and we're glad you found us.</p>
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
