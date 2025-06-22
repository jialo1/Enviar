document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        const menuIcon = menuToggle.querySelector('i');

        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            if (menuIcon) {
                menuIcon.classList.toggle('fa-bars');
                menuIcon.classList.toggle('fa-times');
            }
            menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (menuIcon) {
                        menuIcon.classList.add('fa-bars');
                        menuIcon.classList.remove('fa-times');
                    }
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    if (menuIcon) {
                        menuIcon.classList.add('fa-bars');
                        menuIcon.classList.remove('fa-times');
                    }
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }
}); 