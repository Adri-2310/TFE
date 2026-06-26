// Charger la sidebar réutilisable dans toutes les pages
async function loadSidebar() {
  try {
    const response = await fetch('./_sidebar.html');
    const sidebarHTML = await response.text();
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
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la sidebar:', error);
  }
}

// Charger la sidebar au chargement du document
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
  loadSidebar();
}
