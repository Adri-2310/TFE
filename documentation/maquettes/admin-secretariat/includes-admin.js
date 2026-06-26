// Charger la sidebar spécifique à Admin-Secrétariat
const sidebarHTML = `<!-- ===== SIDEBAR ADMIN-SECRÉTARIAT ===== -->
<aside class="fixed left-0 top-0 w-64 h-screen bg-sidebar text-white flex flex-col z-40">
  <!-- Logo -->
  <div class="px-6 py-5 border-b border-white/10">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
      </div>
      <div>
        <div class="text-white font-bold text-sm">SocialFlow</div>
        <div class="text-white/50 text-xs">Admin Secrétariat</div>
      </div>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
    <div class="text-white/30 text-xs uppercase tracking-widest font-semibold px-3 mb-4">Gestion</div>

    <a href="./01-dashboard-admin-secretariat.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10 sidebar-link" data-page="dashboard">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
      Dashboard
    </a>

    <a href="./02-gestion-employes.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10 sidebar-link" data-page="employes">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
      Employés
      <span class="ml-auto bg-primary/30 text-primary-light text-xs px-2 py-1 rounded font-semibold">4</span>
    </a>

    <a href="./03-gestion-paie.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10 sidebar-link" data-page="paie">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Paie
      <span class="ml-auto bg-secondary/20 text-secondary text-xs px-2 py-1 rounded font-semibold">3</span>
    </a>

    <a href="./04-gestion-documents.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10 sidebar-link" data-page="documents">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      Documents
    </a>

    <a href="./05-heures-travail.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10 sidebar-link" data-page="heures">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      Heures de travail
    </a>

    <div class="text-white/30 text-xs uppercase tracking-widest font-semibold px-3 mt-6 mb-4">Configuration</div>

    <a href="./06-config-local.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10 sidebar-link" data-page="config">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
      Configuration
    </a>

    <div class="text-white/30 text-xs uppercase tracking-widest font-semibold px-3 mt-6 mb-4">Données & Abonnement</div>

    <a href="./07-import-donnees.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10 sidebar-link" data-page="import">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
      </svg>
      Import données
    </a>

    <a href="./08-export-donnees.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10 sidebar-link" data-page="export">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      Export RGPD
    </a>

    <a href="./09-gestion-abonnement.html" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/10 sidebar-link" data-page="abonnement">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
      </svg>
      Abonnement
    </a>
  </nav>

  <!-- User Profile Menu -->
  <div class="px-4 py-4 border-t border-white/10 relative">
    <button id="profileBtn" class="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer w-full">
      <div class="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">AS</div>
      <div class="flex-1 min-w-0 text-left">
        <div class="text-white text-sm font-medium truncate">Admin Secrétariat</div>
        <div class="text-white/50 text-xs truncate">admin@secretariat.be</div>
      </div>
      <svg class="w-4 h-4 text-white/50 flex-shrink-0 transition-transform" id="profileMenuIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <div id="profileMenu" class="hidden absolute left-4 right-4 bottom-full mb-2 bg-white rounded-lg shadow-lg overflow-hidden z-50">
      <a href="javascript:void(0)" class="flex items-center gap-3 px-4 py-3 text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-200">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
        <span class="text-sm font-medium">Mon Profil</span>
      </a>
      <button id="logoutBtn" class="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full text-left">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        <span class="text-sm font-medium">Déconnexion</span>
      </button>
    </div>
  </div>
</aside>`;

function loadSidebar() {
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    sidebarContainer.innerHTML = sidebarHTML;

    // Mettre en surbrillance le lien actif
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-link').forEach(link => {
      const href = link.getAttribute('href').split('/').pop();
      if (href === currentPage) {
        link.classList.add('bg-white/10', 'text-white');
        link.classList.remove('text-white/70');
      }
    });

    // Setup profile menu
    setTimeout(() => {
      const profileBtn = document.getElementById('profileBtn');
      const profileMenu = document.getElementById('profileMenu');
      const profileMenuIcon = document.getElementById('profileMenuIcon');
      const logoutBtn = document.getElementById('logoutBtn');

      if (profileBtn && profileMenu) {
        profileBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          profileMenu.classList.toggle('hidden');
          profileMenuIcon.classList.toggle('rotate-180');
        });

        document.addEventListener('click', (e) => {
          if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.classList.add('hidden');
            profileMenuIcon.classList.remove('rotate-180');
          }
        });
      }

      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            window.location = '../../auth/logout.html';
          }
        });
      }
    }, 0);
  }
}

// Utilitaires
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg toast`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============ FONCTIONS PAIE - CONFORMITÉ BELGIQUE ============
const PayrollCalculator = {
  // Taux ONSS employé (13.07% du brut)
  ONSS_EMPLOYEE_RATE: 0.1307,

  // Taux ONSS employeur (~25% du brut)
  ONSS_EMPLOYER_RATE: 0.25,

  // Cotisations patronales (~30% du brut)
  EMPLOYER_CONTRIBUTIONS_RATE: 0.30,

  // Tranches de précompte professionnel (simplifiées)
  TAX_BRACKETS: [
    { min: 0, max: 1500, rate: 0.00 },
    { min: 1500, max: 2500, rate: 0.25 },
    { min: 2500, max: 4000, rate: 0.40 },
    { min: 4000, max: Infinity, rate: 0.45 }
  ],

  /**
   * Calcule la paie complète selon conformité Belgique
   * @param {number} brut - Salaire brut
   * @param {string} maritalStatus - 'single' ou 'married'
   * @returns {object} Détails de calcul
   */
  calculatePayroll: function(brut, maritalStatus = 'single') {
    const onssEmployee = brut * this.ONSS_EMPLOYEE_RATE;
    const baseTax = brut - onssEmployee;

    // Précompte professionnel (simplifié - appliqué sur la base après ONSS)
    const taxableIncome = baseTax;
    let precompte = 0;
    for (let bracket of this.TAX_BRACKETS) {
      if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
        precompte = taxableIncome * bracket.rate;
        break;
      }
    }

    const net = brut - onssEmployee - precompte;

    // Côté employeur
    const onssEmployer = brut * this.ONSS_EMPLOYER_RATE;
    const contributions = brut * this.EMPLOYER_CONTRIBUTIONS_RATE;
    const totalEmployerCost = brut + onssEmployer + contributions;

    return {
      brut: brut,
      onssEmployee: onssEmployee,
      precompte: precompte,
      net: net,
      onssEmployer: onssEmployer,
      contributions: contributions,
      totalEmployerCost: totalEmployerCost,
      maritalStatus: maritalStatus
    };
  },

  /**
   * Formate les détails de paie pour affichage
   */
  formatPayrollDetails: function(calc) {
    return {
      brut: calc.brut.toFixed(2),
      onssEmployee: calc.onssEmployee.toFixed(2),
      precompte: calc.precompte.toFixed(2),
      net: calc.net.toFixed(2),
      onssEmployer: calc.onssEmployer.toFixed(2),
      contributions: calc.contributions.toFixed(2),
      totalEmployerCost: calc.totalEmployerCost.toFixed(2)
    };
  }
};

// ============ VALIDATION NISS BELGIQUE ============
const NissValidator = {
  /**
   * Valide un NISS belge (13 chiffres)
   * Format: YY.MM.DD-XXX.XX
   */
  validate: function(niss) {
    if (!niss) return false;
    // Enlever les points et tirets
    const clean = niss.replace(/[\.\-]/g, '');
    // Doit être exactement 13 chiffres
    return /^\d{13}$/.test(clean);
  },

  /**
   * Formate un NISS pour affichage: XX.XX.XX-XXX.XX
   */
  format: function(niss) {
    if (!niss) return '';
    const clean = niss.replace(/[\.\-]/g, '');
    if (clean.length !== 13) return niss;
    return `${clean.substring(0, 2)}.${clean.substring(2, 4)}.${clean.substring(4, 6)}-${clean.substring(6, 9)}.${clean.substring(9, 13)}`;
  },

  /**
   * Retourne un NISS partiellement masqué pour privacy: XX.XX.XX-XXX.XX
   */
  maskForDisplay: function(niss) {
    if (!niss) return '';
    const clean = niss.replace(/[\.\-]/g, '');
    if (clean.length !== 13) return niss;
    // Affiche: XX.XX.XX-***.**
    return `${clean.substring(0, 2)}.${clean.substring(2, 4)}.${clean.substring(4, 6)}-***.${clean.substring(9, 13)}`;
  },

  /**
   * Génère un NISS fictif aléatoire (pour démo)
   */
  generateDemo: function() {
    const yy = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const mm = (Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0');
    const dd = (Math.floor(Math.random() * 28) + 1).toString().padStart(2, '0');
    const xxx = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const xx = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${yy}${mm}${dd}${xxx}${xx}`;
  }
};

// ============ VALIDATION IBAN ============
const IbanValidator = {
  /**
   * Valide un IBAN belge (format simplifié)
   */
  validate: function(iban) {
    if (!iban) return false;
    // Format belge: BE + 2 chiffres + 3 chiffres banque + 7 chiffres compte
    // Exemple: BE68539007547034
    const clean = iban.replace(/\s/g, '').toUpperCase();
    return /^BE\d{12}$/.test(clean);
  },

  /**
   * Formate un IBAN pour affichage
   */
  format: function(iban) {
    if (!iban) return '';
    const clean = iban.replace(/\s/g, '').toUpperCase();
    if (!/^BE\d{12}$/.test(clean)) return iban;
    return `${clean.substring(0, 4)} ${clean.substring(4, 8)} ${clean.substring(8, 12)} ${clean.substring(12)}`;
  }
};

// Charger au chargement du document
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
  loadSidebar();
}
