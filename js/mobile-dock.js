// Mobile Dock Navigation
document.addEventListener('DOMContentLoaded', function() {
    const dockItems = document.querySelectorAll('.dock-item');
    const sections = document.querySelectorAll('section[id]');
    
    // Update active dock item based on scroll position
    function updateActiveDockItem() {
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                currentSection = section.getAttribute('id');
            }
        });
        
        dockItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === currentSection) {
                item.classList.add('active');
            }
        });
    }
    
    // Smooth scroll to section when dock item is clicked
    dockItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            const section = document.getElementById(targetSection);
            
            if (section) {
                const offsetTop = section.offsetTop - 80;
                if (window.lenis) {
                    window.lenis.scrollTo(Math.max(0, offsetTop));
                } else {
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Update active state on scroll
    window.addEventListener('scroll', updateActiveDockItem);
    
    // Initial update
    updateActiveDockItem();
});
