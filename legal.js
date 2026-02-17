/* Chessbuds — Legal & Compliance */

(function () {
  const YEAR = new Date().getFullYear();

  // ── Privacy Policy Content ──
  const privacyContent = `
    <div class="legal-updated">Last updated February 2026</div>

    <div class="legal-section">
      <h4>Overview</h4>
      <p>Chessbuds is a browser-based chess game. This policy explains what data we collect, how it's used, and your rights.</p>
    </div>

    <div class="legal-section">
      <h4>Data We Collect</h4>
      <p>Chessbuds stores data locally on your device using your browser's localStorage:</p>
      <ul>
        <li>Game statistics (wins, losses, draws, streaks)</li>
        <li>Game preferences (difficulty, color, time controls)</li>
        <li>Recent game history (last 20 games)</li>
      </ul>
      <p>This data never leaves your device and is not transmitted to any server.</p>
    </div>

    <div class="legal-section">
      <h4>Waitlist & Email</h4>
      <p>If you provide your email through our waitlist, it is used solely to notify you about updates. We will never sell, share, or distribute your email to third parties. You may request removal at any time.</p>
    </div>

    <div class="legal-section">
      <h4>Cookies & Tracking</h4>
      <p>Chessbuds does not use cookies, tracking pixels, or third-party analytics. We do not track your browsing behavior.</p>
    </div>

    <div class="legal-section">
      <h4>Third-Party Services</h4>
      <p>We use the following external services for functionality only:</p>
      <ul>
        <li>Google Fonts — typeface delivery</li>
        <li>jsDelivr CDN — Three.js library</li>
      </ul>
      <p>These services may collect standard request data (e.g. IP addresses) per their own policies.</p>
    </div>

    <div class="legal-section">
      <h4>Data Retention & Deletion</h4>
      <p>All game data lives in your browser's localStorage. You can clear it at any time through your browser settings. No server-side data exists.</p>
    </div>

    <div class="legal-section">
      <h4>Children's Privacy</h4>
      <p>Chessbuds does not knowingly collect personal information from children under 13.</p>
    </div>

    <div class="legal-section">
      <h4>Changes</h4>
      <p>We may update this policy from time to time. Changes will be reflected here with an updated date.</p>
    </div>

    <div class="legal-section">
      <h4>Contact</h4>
      <p>Questions about this policy can be directed to us through the project's GitHub repository.</p>
    </div>
  `;

  // ── Terms of Service Content ──
  const termsContent = `
    <div class="legal-updated">Last updated February 2026</div>

    <div class="legal-section">
      <h4>Acceptance of Terms</h4>
      <p>By accessing and using Chessbuds, you agree to these Terms of Service. If you do not agree, please do not use the site.</p>
    </div>

    <div class="legal-section">
      <h4>Description of Service</h4>
      <p>Chessbuds is a free, browser-based chess game featuring original character designs and 3D pieces. The service is provided "as is" for entertainment and educational purposes.</p>
    </div>

    <div class="legal-section">
      <h4>Intellectual Property</h4>
      <p>All content — including character designs, illustrations, 3D models, names, logos, and code — is the property of Chessbuds and its creators. You may not:</p>
      <ul>
        <li>Copy, modify, or distribute content without written permission</li>
        <li>Use any assets for commercial purposes</li>
        <li>Reverse-engineer, decompile, or extract game assets</li>
        <li>Claim ownership of any Chessbuds intellectual property</li>
      </ul>
    </div>

    <div class="legal-section">
      <h4>User Conduct</h4>
      <p>You agree to use Chessbuds consistent with its intended purpose. You may not:</p>
      <ul>
        <li>Attempt to disrupt or compromise the site's functionality</li>
        <li>Use automated tools to interact with the service</li>
        <li>Exploit bugs or vulnerabilities for unfair advantage</li>
      </ul>
    </div>

    <div class="legal-section">
      <h4>Disclaimer of Warranties</h4>
      <p>Chessbuds is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee uninterrupted or error-free service.</p>
    </div>

    <div class="legal-section">
      <h4>Limitation of Liability</h4>
      <p>To the fullest extent permitted by law, Chessbuds and its creators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.</p>
    </div>

    <div class="legal-section">
      <h4>Modifications</h4>
      <p>We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of the revised terms.</p>
    </div>

    <div class="legal-section">
      <h4>Governing Law</h4>
      <p>These terms are governed by applicable law. Disputes shall be resolved in the appropriate jurisdiction.</p>
    </div>

    <div class="legal-section">
      <h4>Contact</h4>
      <p>Questions about these terms can be directed to us through the project's GitHub repository.</p>
    </div>
  `;

  // ── Inject HTML ──
  function injectLegal() {
    // Footer
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = `
      <div class="site-footer-left">
        <span class="footer-copyright">&copy; ${YEAR} Chessbuds</span>
      </div>
      <div class="site-footer-right">
        <button class="footer-link" onclick="openLegalDrawer('privacy')">Privacy</button>
        <span class="footer-dot"></span>
        <button class="footer-link" onclick="openLegalDrawer('terms')">Terms</button>
      </div>
    `;

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'legal-overlay';
    overlay.id = 'legal-overlay';
    overlay.addEventListener('click', closeLegalDrawer);

    // Privacy Drawer
    const privacyDrawer = document.createElement('div');
    privacyDrawer.className = 'legal-drawer';
    privacyDrawer.id = 'legal-drawer-privacy';
    privacyDrawer.innerHTML = `
      <div class="legal-drawer-header">
        <h3>Privacy Policy</h3>
        <button class="legal-close" onclick="closeLegalDrawer()">&times;</button>
      </div>
      ${privacyContent}
    `;

    // Terms Drawer
    const termsDrawer = document.createElement('div');
    termsDrawer.className = 'legal-drawer';
    termsDrawer.id = 'legal-drawer-terms';
    termsDrawer.innerHTML = `
      <div class="legal-drawer-header">
        <h3>Terms of Service</h3>
        <button class="legal-close" onclick="closeLegalDrawer()">&times;</button>
      </div>
      ${termsContent}
    `;

    document.body.appendChild(footer);
    document.body.appendChild(overlay);
    document.body.appendChild(privacyDrawer);
    document.body.appendChild(termsDrawer);
  }

  // ── Drawer Logic ──
  let activeLegalDrawer = null;

  function openLegalDrawer(type) {
    closeLegalDrawer();
    activeLegalDrawer = type;
    document.getElementById('legal-overlay').classList.add('active');
    document.getElementById('legal-drawer-' + type).classList.add('open');
    document.getElementById('legal-drawer-' + type).scrollTop = 0;
  }

  function closeLegalDrawer() {
    document.getElementById('legal-overlay')?.classList.remove('active');
    if (activeLegalDrawer) {
      document.getElementById('legal-drawer-' + activeLegalDrawer)?.classList.remove('open');
      activeLegalDrawer = null;
    }
  }

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && activeLegalDrawer) {
      closeLegalDrawer();
    }
  });

  // ── Expose & Init ──
  window.openLegalDrawer = openLegalDrawer;
  window.closeLegalDrawer = closeLegalDrawer;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectLegal);
  } else {
    injectLegal();
  }
})();
