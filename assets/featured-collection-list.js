/**
 *  @class
 *  @function FeaturedCollectionList
 */

if (!customElements.get('featured-collection-list')) {
  class FeaturedCollectionList extends HTMLElement {
    constructor() {
      super();
      this.buttons = Array.from(this.querySelectorAll('.featured-collection-list--button'));
    }
    connectedCallback() {
      this.setupAnimations();
      this.buttons.forEach((button, i) => {
        button.addEventListener('mousemove', (event) => {
          this.onMove(event, button, i);
        });
      });
      if (Shopify.designMode) {
        this.addEventListener('shopify:section:load', (event) => {
          let index = this.buttons.indexOf(event.target);
          this.buttons[index].dispatchEvent(new Event('mousemove'));

          this.setAnimations();

          setTimeout(() => {
            ScrollTrigger.refresh();
          }, 100);
        });
      }
    }
    onMove(event, button, i) {
      let image = button.querySelector('.featured-collection-list--image');

      if (image && event.layerX > 0 && event.layerY > 0 && event.target.classList.contains('featured-collection-list--span')) {
        image.style.transform = 'translate3d(' + event.layerX + 'px, ' + event.layerY + 'px, 0px)';
      }
    }
    setupAnimations() {
      ScrollTrigger.batch(this.querySelectorAll('.featured-collection-list--span span'), {
        onEnter: (elements, triggers) => {
          gsap.to(elements, { y: 0, stagger: 0.1, ease: window.theme.settings.animation_easing });
        },
      });
    }
  }
  customElements.define('featured-collection-list', FeaturedCollectionList);
}