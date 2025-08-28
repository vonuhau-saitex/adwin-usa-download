function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
var dispatchCustomEvent = function dispatchCustomEvent(eventName) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var detail = {
    detail: data
  };
  var event = new CustomEvent(eventName, data ? detail : null);
  document.dispatchEvent(event);
};

/**
 *  @class
 *  @function Quantity
 */
if (!customElements.get('quantity-selector')) {
  class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector('.qty');
      this.step = this.input.getAttribute('step');
      this.changeEvent = new Event('change', {
        bubbles: true
      });
      // Create buttons
      this.subtract = this.querySelector('.minus');
      this.add = this.querySelector('.plus');

      // Add functionality to buttons
      this.subtract.addEventListener('click', () => this.change_quantity(-1 * this.step));
      this.add.addEventListener('click', () => this.change_quantity(1 * this.step));

    }
    connectedCallback() {
      this.classList.add('buttons_added');
    }
    change_quantity(change) {
      // Get current value
      let quantity = Number(this.input.value);

      // Ensure quantity is a valid number
      if (isNaN(quantity)) quantity = 1;

      // Check for min & max
      if (this.input.getAttribute('min') > (quantity + change)) {
        return;
      }
      if (this.input.getAttribute('max')) {
        if (this.input.getAttribute('max') < (quantity + change)) {
          return;
        }
      }
      // Change quantity
      quantity += change;

      // Ensure quantity is always a number
      quantity = Math.max(quantity, 1);

      // Output number
      this.input.value = quantity;

      this.input.dispatchEvent(this.changeEvent);
    }
  }
  customElements.define('quantity-selector', QuantityInput);
}

/**
 *  @class
 *  @function ArrowSubMenu
 */
class ArrowSubMenu {

  constructor(self) {
    this.submenu = self.parentNode.querySelector('.sub-menu');
    this.arrow = self;
    // Add functionality to buttons
    self.addEventListener('click', (e) => this.toggle_submenu(e));
  }

  toggle_submenu(e) {
    e.preventDefault();
    let submenu = this.submenu;

    if (!submenu.classList.contains('active')) {
      submenu.classList.add('active');

    } else {
      submenu.classList.remove('active');
      this.arrow.blur();
    }
  }
}
let arrows = document.querySelectorAll('.thb-arrow');
arrows.forEach((arrow) => {
  new ArrowSubMenu(arrow);
});

/**
 *  @class
 *  @function ProductCard
 */
if (!customElements.get('product-card')) {
  class ProductCard extends HTMLElement {
    constructor() {
      super();
      this.swatches = this.querySelector('.product-card-swatches');
      this.image = this.querySelector('.product-featured-image-link .product-primary-image');
      this.additional_images = this.querySelectorAll('.product-secondary-image');
      this.additional_images_nav = this.querySelectorAll('.product-secondary-images-nav li');
      this.quickview_button = this.querySelector('.product-card-quickview');
      this.select_size = this.querySelector('.select-size');      
      this.select_size_close = this.querySelector('.select-size-close'); 
      this.select_size_popup = this.querySelector('.select-size-popup'); 
    }

    connectedCallback() {
      if (this.swatches) {
        this.enableSwatches(this.swatches, this.image);
      }
      if (this.quickview_button) {
        this.enableQuickview(this.quickview_button);
      }
      if (this.select_size) {
        this.enableSelectsize(this.select_size, this.select_size_close, this.select_size_popup);
      }
      if (this.additional_images) {
        this.enableAdditionalImages();
      }
    }
    enableAdditionalImages() {
      let image_length = this.additional_images.length;
      let images = this.additional_images;
      let nav = this.additional_images_nav;
      let image_container = this.querySelector('.product-featured-image');
      const mousemove = function(e) {
        let l = e.offsetX;
        let w = this.getBoundingClientRect().width;
        let prc = l / w;
        let sel = Math.floor(prc * image_length);
        let selimg = images[sel];
        images.forEach((image, index) => {
          if (image.classList.contains('hover')) {
            image.classList.remove('hover');
            if (nav.length) {
              nav[index].classList.remove('active');
            }
          }
        });
        if (selimg) {
          if (!selimg.classList.contains('hover')) {
            selimg.classList.add('hover');
            if (nav.length) {
              nav[sel].classList.add('active');
            }
          }
        }

      };
      const mouseleave = function(e) {
        images.forEach((image, index) => {
          image.classList.remove('hover');
          if (nav.length) {
            nav[index].classList.remove('active');
          }
        });
      };
      if (image_container) {
        image_container.addEventListener('touchstart', mousemove, {
          passive: true
        });
        image_container.addEventListener('touchmove', mousemove, {
          passive: true
        });
        image_container.addEventListener('touchend', mouseleave, {
          passive: true
        });
        image_container.addEventListener('mouseenter', mousemove, {
          passive: true
        });
        image_container.addEventListener('mousemove', mousemove, {
          passive: true
        });
        image_container.addEventListener('mouseleave', mouseleave, {
          passive: true
        });
      }

    }
    enableSwatches(swatches, image) {
      let swatch_list = swatches.querySelectorAll('.product-card-swatch'),
        org_srcset = image ? image.dataset.srcset : '',
        active = swatches.querySelector('.product-card-swatch.active');

      swatch_list.forEach((swatch, index) => {

        swatch.addEventListener('mouseover', function() {

          [].forEach.call(swatch_list, function(el) {
            el.classList.remove('active');
          });
          if (image) {
            if (swatch.dataset.srcset) {
              image.setAttribute('srcset', swatch.dataset.srcset);
            } else {
              image.setAttribute('srcset', org_srcset);
            }
          }

          swatch.classList.add('active');
        });
        swatch.addEventListener('click', function(evt) {
          window.location.href = this.dataset.href;
          evt.preventDefault();
        });
      });
    }
    enableSelectsize(select_size, select_size_close, select_size_popup) {      
        select_size.addEventListener('click', function(evt) {
          let popup = '.size-popup-'+select_size.dataset.handle;
          let popupLoading = '.size-loading-'+select_size.dataset.handle;           
          $('.select-size-popup').slideUp();
          $(popup).slideDown();
          $('.select-size-loading-overlay').removeClass('active');
          $(popupLoading).slideUp();
        });        

        select_size_close.addEventListener('click', function(evt) {
          $('.select-size-popup').slideUp();
        });
        
        let selectsize_pick_list = select_size_popup.querySelectorAll('.selectsize-pick');
        selectsize_pick_list.forEach((pickValue, index) => {
          pickValue.addEventListener('click', function(evt) {
            const variantid = pickValue.dataset.variantid;            
            let popupLoading = '.size-loading-'+select_size.dataset.handle,
                formClass = '.form-'+select_size.dataset.handle;
            $(popupLoading).addClass('active');
            var formsubmit = $(formClass).find('button');
            $(formClass).find('input[name=id]').val(variantid);
            setTimeout(function () {
              formsubmit.trigger('click');
            }, 1200);
          });
        })
    }  

    enableQuickview(quickview_button) {
      const _this = this,
        drawer = document.getElementById('Product-Drawer'),
        body = document.body;

      quickview_button.addEventListener('click', function(evt) {
        evt.preventDefault();
        let productHandle = quickview_button.dataset.productHandle,
          href = `${theme.routes.root_url}/products/${productHandle}?view=quick-view`;

        // remove double `/` in case shop might have /en or language in URL
        href = href.replace('//', '/');
        if (!href || !productHandle) {
          return;
        }
        if (quickview_button.classList.contains('loading')) {
          return;
        }
        quickview_button.classList.add('loading');
        fetch(href, {
            method: 'GET'
          })
          .then((response) => {
            quickview_button.classList.remove('loading');
            return response.text();
          })
          .then(text => {
            const sectionInnerHTML = new DOMParser()
              .parseFromString(text, 'text/html')
              .querySelector('#Product-Drawer-Content').innerHTML;
            _this.renderQuickview(sectionInnerHTML, drawer, body, href, productHandle);

          });
      });
    }
    renderQuickview(sectionInnerHTML, drawer, body, href, productHandle) {
      if (sectionInnerHTML) {
        drawer.querySelector('#Product-Drawer-Content').innerHTML = sectionInnerHTML;
        let quantity = drawer.querySelector('.quantity:not(.buttons_added)');

        setTimeout(() => {
          if (Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
          }
        }, 300);
        body.classList.add('open-cc');
        body.classList.add('open-quick-view');
        drawer.classList.add('active');
        setTimeout(() => {
          drawer.querySelector('.product-quick-images--container').classList.add('active');
        });
        drawer.querySelector('.side-panel-close').focus();
        dispatchCustomEvent('quick-view:open', {
          productUrl: href,
          productHandle: productHandle
        });
      }
    }
  }
  customElements.define('product-card', ProductCard);
}
/**
 *  @class
 *  @function Header
 */
class Header {
  constructor() {
    const header = document.querySelector('.header-section'),
      header_main = document.getElementById('header'),
      menu = document.getElementById('mobile-menu'),
      toggle = document.querySelector('.mobile-toggle-wrapper'),
      setHeaderOffset = this.setHeaderOffset,
      setAnnouncementHeight = this.setAnnouncementHeight,
      setHeaderHeight = this.setHeaderHeight;

    if (!header_main) {
      return;
    }
    document.addEventListener('keydown', (e) => {
      if (e.code.toUpperCase() === 'ESCAPE') {
        toggle.removeAttribute('open');
        toggle.classList.remove('active');
      }
    });
    toggle.querySelector('.mobile-toggle').addEventListener('click', (e) => {
      setAnnouncementHeight(header);
      if (toggle.classList.contains('active')) {
        e.preventDefault();
        document.body.classList.remove('overflow-hidden');
        toggle.classList.remove('active');
        this.closeAnimation(toggle);
      } else {
        document.body.classList.add('overflow-hidden');
        setTimeout(() => {
          toggle.classList.add('active');
        });
      }
      window.dispatchEvent(new Event('resize.resize-select'));
    });

    // Store original header position on load (before any countdown interference)
    let originalHeaderTop = null;
    
    // Calculate original header position
    const calculateOriginalHeaderTop = () => {
      // Get countdown height from CSS custom property if available
      const countdownHeightStr = getComputedStyle(document.documentElement).getPropertyValue('--countdown-header-height');
      const countdownHeight = parseInt(countdownHeightStr) || 0;
      
      // Check if countdown header actually exists in DOM and is not expired
      const countdownHeaderExists = document.querySelector('.countdown-header-standalone') && 
                                   !document.querySelector('.countdown-header-standalone').classList.contains('countdown-expired');
      
      if (countdownHeaderExists && countdownHeight > 0) {
        // If countdown header exists and is visible, calculate the header's natural position
        // The header is positioned below the countdown, so its natural scroll trigger point
        // should be when the countdown header would start to scroll out of view
        originalHeaderTop = countdownHeight;
      } else {
        // No countdown header, header starts at the top
        originalHeaderTop = 0;
      }
    };
    
    // Calculate on initial load
    calculateOriginalHeaderTop();
    
    // Expose function globally for countdown header to call
    window.recalculateHeaderPosition = calculateOriginalHeaderTop;

    // Mobile Menu offset
    window.addEventListener('scroll', function() {
      setHeaderOffset(header);
      setHeaderHeight(header_main);
            // Sticky Header Class
      if (header_main.classList.contains('header-sticky--active')) {
        // Recalculate if we haven't done it yet or if countdown state changed
        if (originalHeaderTop === null) {
          calculateOriginalHeaderTop();
        }
        
        header_main.classList.toggle('is-sticky', window.scrollY >= originalHeaderTop && window.scrollY > 0);
      }

    }, {
      passive: true
    });
    window.dispatchEvent(new Event('scroll'));

    if (document.getElementById('shopify-section-announcement-bar')) {
      const a_bar = document.getElementById('shopify-section-announcement-bar');
      window.addEventListener('resize', function() {
        setAnnouncementHeight(a_bar);
        // Recalculate original header position on resize
        calculateOriginalHeaderTop();
      }, {
        passive: true
      });
      window.dispatchEvent(new Event('resize'));
    } else {
      // Still need to handle resize for header position even without announcement bar
      window.addEventListener('resize', function() {
        calculateOriginalHeaderTop();
      }, {
        passive: true
      });
    }
    // Buttons.
    menu.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    menu.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }
  setAnnouncementHeight(a_bar) {
    let h = a_bar.clientHeight;
    document.documentElement.style.setProperty('--announcement-height', h + 'px');
  }
  setHeaderOffset(header) {
    let h = header.getBoundingClientRect().top;
    document.documentElement.style.setProperty('--header-offset', h + 'px');
  }
  setHeaderHeight(header) {
    let h = header.clientHeight;
    
    // Add countdown header height if it exists (from CSS custom property)
    const countdownHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--countdown-header-height')) || 0;
    if (countdownHeight > 0) {
      h += countdownHeight;
    }
    
    document.documentElement.style.setProperty('--header-height', h + 'px');
  }
  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const parentMenuElement = detailsElement.closest('.link-container');
    const isOpen = detailsElement.hasAttribute('open');

    setTimeout(() => {
      detailsElement.classList.add('menu-opening');
      parentMenuElement && parentMenuElement.classList.add('submenu-open');
    }, 100);
  }
  onCloseButtonClick(event) {
    event.preventDefault();
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }
  closeSubmenu(detailsElement) {
    detailsElement.classList.remove('menu-opening');
    this.closeAnimation(detailsElement);
  }
  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
      }
    };

    window.requestAnimationFrame(handleAnimation);
  }
}
/**
 *  @class
 *  @function FullMenu
 */
if (!customElements.get('full-menu')) {
  class FullMenu extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.submenus = this.querySelectorAll('.thb-full-menu>.menu-item-has-children:not(.menu-item-has-megamenu)>.sub-menu');

      if (!this.submenus.length) {
        return;
      }
      const _this = this;
      // resize on initial load
      window.addEventListener('resize', debounce(function() {
        _this.resizeSubMenus();
      }, 100));

      window.dispatchEvent(new Event('resize'));

      document.fonts.ready.then(function() {
        _this.resizeSubMenus();
      });

    }
    resizeSubMenus() {
      this.submenus.forEach((submenu) => {
        let sub_submenus = submenu.querySelectorAll(':scope >.menu-item-has-children>.sub-menu');

        sub_submenus.forEach((sub_submenu) => {
          let w = sub_submenu.offsetWidth,
            l = sub_submenu.parentElement.parentElement.getBoundingClientRect().left + sub_submenu.parentElement.parentElement.clientWidth + 10,
            total = w + l;
          if (total > document.body.clientWidth) {
            sub_submenu.parentElement.classList.add('left-submenu');
          } else if (sub_submenu.parentElement.classList.contains('left-submenu')) {
            sub_submenu.parentElement.classList.remove('left-submenu');
          }
        });
      });
    }
  }
  customElements.define('full-menu', FullMenu);
}
/**
 *  @class
 *  @function PanelClose
 */
if (!customElements.get('side-panel-close')) {
  class PanelClose extends HTMLElement {

    constructor() {
      super();
      let cc = document.querySelector('.click-capture');

      // Add functionality to buttons
      this.addEventListener('click', (e) => this.close_panel(e));
      document.addEventListener('panel:close', (e) => {
        let panel = document.querySelectorAll('.side-panel.active');
        if (panel) {
          this.close_panel(e, panel[0]);
        }
      });
      cc.addEventListener('click', (e) => {
        let panel = document.querySelectorAll('.side-panel.active');
        if (panel) {
          this.close_panel(e, panel[0]);
        }
      });
    }

    close_panel(e, panel) {
      if (e) {
        e.preventDefault();
      }
      if (!panel) {
        panel = e.target.closest('.side-panel');

        if (!panel) {
          return;
        }
      }
      if (panel.classList.contains('product-drawer')) {
        this.close_quick_view(panel);
      } else if (panel.classList.contains('cart-drawer')) {
        if (panel.querySelector('.product-recommendations--full')) {
          if (!document.body.classList.contains('open-quick-view')) {
            panel.querySelector('.product-recommendations--full').classList.remove('active');
          }
        }
        if (window.innerWidth < 1069) {
          if (!document.body.classList.contains('open-quick-view')) {
            panel.classList.remove('active');
            document.body.classList.remove('open-cc');
            document.body.classList.remove('open-cart');
          } else {
            this.close_quick_view();
          }
        } else {
          if (panel.querySelector('.product-recommendations--full')) {
            if (!document.body.classList.contains('open-quick-view')) {
              setTimeout(() => {
                panel.classList.remove('active');
                document.body.classList.remove('open-cc');
                document.body.classList.remove('open-cart');
              }, 500);
            } else {
              this.close_quick_view();
            }
          } else {
            panel.classList.remove('active');
            document.body.classList.remove('open-cc');
            document.body.classList.remove('open-cart');
          }
        }
      } else {
        panel.classList.remove('active');
        document.body.classList.remove('open-cc');
      }
    }
    close_quick_view(panel) {
      panel = panel ? panel : document.getElementById('Product-Drawer');

      if (panel.querySelector('.product-quick-images--container')) {
        panel.querySelector('.product-quick-images--container').classList.remove('active');
      }
      if (window.innerWidth < 1069) {
        panel.classList.remove('active');
        if (!document.body.classList.contains('open-cart')) {
          document.body.classList.remove('open-cc');
        }
        document.body.classList.remove('open-quick-view');
      } else {
        if (panel.querySelector('.product-quick-images--container')) {
          setTimeout(() => {
            panel.classList.remove('active');
            if (!document.body.classList.contains('open-cart')) {
              document.body.classList.remove('open-cc');
            }
            document.body.classList.remove('open-quick-view');
          }, 500);
        }
      }
    }
  }
  customElements.define('side-panel-close', PanelClose);

  document.addEventListener('keydown', (e) => {
    if (e.code.toUpperCase() === 'ESCAPE') {
      dispatchCustomEvent('panel:close');
    }
  });
}
/**
 *  @class
 *  @function CartDrawer
 */
class CartDrawer {

  constructor() {
    this.container = document.getElementById('Cart-Drawer');

    if (!this.container) {
      return;
    }
    let _this = this,
      button = document.getElementById('cart-drawer-toggle'),
      quantities = this.container.querySelectorAll('.quantity input');


    // Add functionality to buttons
    button.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.add('open-cc');
      document.body.classList.add('open-cart');
      this.container.classList.add('active');
      this.container.focus();
      setTimeout(() => {
        if (this.container.querySelector('.product-recommendations--full')) {
          this.container.querySelector('.product-recommendations--full').classList.add('active');
        }
      });
      dispatchCustomEvent('cart-drawer:open');
    });


    this.debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, 300);

    this.container.addEventListener('change', this.debouncedOnChange.bind(this));

    this.notesToggle();
    this.removeProductEvent();
    this.updateFreeShipping();
    // Terms checkbox
    this.termsCheckbox();
  }
  onChange(event) {
    if (event.target.classList.contains('qty')) {
      this.updateQuantity(event.target.dataset.index, event.target.value);
    }
  }
  removeProductEvent() {
    let removes = this.container.querySelectorAll('.remove');

    removes.forEach((remove) => {
      remove.addEventListener('click', (event) => {
        this.updateQuantity(event.target.dataset.index, '0');

        event.preventDefault();
      });
    });
  }
  getSectionsToRender() {
    return [{
      id: 'Cart-Drawer',
      section: 'cart-drawer',
      selector: '.cart-drawer'
    },
    {
      id: 'cart-drawer-toggle',
      section: 'cart-bubble',
      selector: '.thb-item-count'
    }];
  }
  getSectionInnerHTML(html, selector) {
    return new DOMParser()
      .parseFromString(html, 'text/html')
      .querySelector(selector).innerHTML;
  }
  termsCheckbox() {
    let terms_checkbox = this.container.querySelector('#CartDrawerTerms'),
      checkout_button = this.container.querySelector('.button.checkout');

    if (terms_checkbox && checkout_button) {
      terms_checkbox.setCustomValidity(theme.strings.requiresTerms);
      checkout_button.addEventListener('click', function(e) {
        if (!terms_checkbox.checked) {
          terms_checkbox.reportValidity();
          terms_checkbox.focus();
          e.preventDefault();
        }
      });
    }
  }
  notesToggle() {
    let notes_toggle = document.getElementById('order-note-toggle');

    if (!notes_toggle) {
      return;
    }

    notes_toggle.addEventListener('click', (event) => {
      notes_toggle.nextElementSibling.classList.add('active');
    });
    notes_toggle.nextElementSibling.querySelectorAll('.button, .order-note-toggle__content-overlay').forEach((el) => {
      el.addEventListener('click', (event) => {
        notes_toggle.nextElementSibling.classList.remove('active');
        this.saveNotes();
      });
    });
  }
  saveNotes() {
    fetch(`${theme.routes.cart_update_url}.js`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': `application/json`
      },
      body: JSON.stringify({
        'note': document.getElementById('mini-cart__notes').value
      })
    });
  }
  updateFreeShipping() {
    const free_shipping = this.container.querySelector('.free-shipping');

    if (free_shipping) {
      let amount_text = free_shipping.querySelector('.free-shipping--text span');
      let total = parseInt(free_shipping.dataset.cartTotal, 10);
      let minimum = Math.round(parseInt(free_shipping.dataset.minimum, 10) * (Shopify.currency.rate || 1));
      let percentage = 1;

      if (total < minimum) {
        percentage = total / minimum;

        if (amount_text) {
          let remaining = minimum - total,
            format = window.theme.settings.money_with_currency_format || "${{amount}}";
          amount_text.innerHTML = formatMoney(remaining, format);
        }
      }

      free_shipping.style.setProperty('--percentage', percentage);
    }
  }
  updateQuantity(line, quantity) {
    this.container.querySelector(`#CartDrawerItem-${line}`).classList.add('thb-loading');
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname
    });

    dispatchCustomEvent('line-item:change:start', {
      quantity: quantity
    });
    if (this.container.querySelector('.product-recommendations--full')) {
      this.container.querySelector('.product-recommendations--full').classList.remove('active');
    }
    fetch(`${theme.routes.cart_change_url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': `application/json`
        },
        ...{
          body
        }
      })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);

        this.getSectionsToRender().forEach((section => {
          const elementToReplace = document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);

          if (parsedState.sections) {
            elementToReplace.innerHTML = this.getSectionInnerHTML(parsedState.sections[section.section], section.selector);
          }
        }));

        this.removeProductEvent();
        this.notesToggle();
        this.termsCheckbox();
        this.updateFreeShipping();
        dispatchCustomEvent('line-item:change:end', {
          quantity: quantity,
          cart: parsedState
        });

        if (this.container.querySelector(`#CartDrawerItem-${line}`)) {
          this.container.querySelector(`#CartDrawerItem-${line}`).classList.remove('thb-loading');
        }
      });
  }
}

/**
 *  @class
 *  @function ModalDialog
 */
class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
      });
    }
  }

  connectedCallback() {
    if (this.moved) return;
    this.moved = true;
    document.body.appendChild(this);
  }

  show(opener) {
    this.openedBy = opener;
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    this.removeAttribute('open');
    this.querySelectorAll('.js-youtube').forEach((video) => {
      video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
    });
    this.querySelectorAll('.js-vimeo').forEach((video) => {
      video.contentWindow.postMessage('{"method":"pause"}', '*');
    });
    this.querySelectorAll('video').forEach((video) => video.pause());
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

/**
 *  @class
 *  @function Localization
 */
class Localization {
  constructor() {
    let _this = this;
    // resize on initial load
    document.querySelectorAll('.thb-localization-forms').forEach((localization) => {
      localization.addEventListener('change', (e) => {
        localization.querySelector('form').submit();
      });
    });
  }
}



/**
 *  @class
 *  @function SelectWidth
 */
class SelectWidth {
  constructor() {
    let _this = this;
    // resize on initial load
    window.addEventListener('load', () => {
      document.querySelectorAll('.resize-select').forEach(_this.resizeSelect);
    });

    // delegated listener on change
    document.body.addEventListener('change', (e) => {
      if (e.target.matches('.resize-select') && e.target.offsetParent !== null) {
        _this.resizeSelect(e.target);
      }
    });
    window.addEventListener('resize.resize-select', function() {
      document.querySelectorAll('.resize-select').forEach(_this.resizeSelect);
    });
  }

  resizeSelect(sel) {
    let tempOption = document.createElement('option');
    tempOption.textContent = sel.selectedOptions[0].textContent;

    let tempSelect = document.createElement('select'),
      offset = 13;
    tempSelect.style.visibility = 'hidden';
    tempSelect.style.position = 'fixed';
    tempSelect.appendChild(tempOption);
    if (sel.classList.contains('thb-language-code') || sel.classList.contains('thb-currency-code') || sel.classList.contains('facet-filters__sort')) {
      offset = 2;
    }
    sel.after(tempSelect);
    if (tempSelect.clientWidth > 0) {
      sel.style.width = `${+tempSelect.clientWidth + offset}px`;
    }
    tempSelect.remove();
  }
}

if (typeof SelectWidth !== 'undefined') {
  new SelectWidth();
}

/**
 *  @class
 *  @function FooterMenuToggle
 */
class FooterMenuToggle {
  constructor() {
    let _this = this;
    // resize on initial load
    document.querySelectorAll('.thb-widget-title.collapsible').forEach((button) => {
      button.addEventListener('click', (e) => {
        button.classList.toggle('active');
      });
    });
  }
}

/**
 *  @class
 *  @function SidePanelContentTabs
 */
if (!customElements.get('side-panel-content-tabs')) {
  class SidePanelContentTabs extends HTMLElement {
    constructor() {
      super();
      this.buttons = this.querySelectorAll('button');
      this.panels = this.parentElement.querySelectorAll('.side-panel-content--tab-panel');
    }
    connectedCallback() {
      this.setupButtonObservers();
    }
    disconnectedCallback() {

    }
    setupButtonObservers() {
      this.buttons.forEach((item, i) => {
        item.addEventListener('click', (e) => {
          this.toggleActiveClass(i);
        });
      });
    }
    toggleActiveClass(i) {
      this.buttons.forEach((button) => {
        button.classList.remove('tab-active');
      });
      this.buttons[i].classList.add('tab-active');

      this.panels.forEach((panel) => {
        panel.classList.remove('tab-active');
      });
      this.panels[i].classList.add('tab-active');
    }
  }

  customElements.define('side-panel-content-tabs', SidePanelContentTabs);
}

/**
 *  @class
 *  @function CollapsibleRow
 */
if (!customElements.get('collapsible-row')) {
  class CollapsibleRow extends HTMLElement {
    constructor() {
      super();

      this.details = this.querySelector('details');
      this.summary = this.querySelector('summary');
      this.content = this.querySelector('.collapsible__content');
    }
    connectedCallback() {
      this.setListeners();
    }
    setListeners() {
      if (document.body.classList.contains('animations-true') && typeof gsap !== 'undefined') {
        setTimeout(() => {
          this.prepareAnimations();
          this.querySelector('summary').addEventListener('click', (e) => this.onClick(e));
        }, 400);
      }
    }
    prepareAnimations() {
      let _this = this,
        summary_height = this.querySelector('summary').offsetHeight,
        content_height = this.querySelector('.collapsible__content').offsetHeight,
        initial_height = summary_height,
        final_height = summary_height + content_height;

      this.tl = false;
      this.tl = gsap.timeline({
        reversed: !_this.details.open,
        paused: true,
        inherit: false,
        ease: 'sine.inOut',
        onStart: function() {
          _this.details.open = true;
          _this.details.style.overflow = 'hidden';
        },
        onReverseComplete: function() {
          _this.details.open = false;
          _this.details.style.overflow = '';
        }
      });

      this.tl
        .fromTo(_this.details, {
          height: function() {
            let h = Math.max(Math.max(initial_height, 0), 24);
            return h;
          },
          clearProps: 'height'
        }, {
          duration: 0.6,
          height: final_height,
          clearProps: 'height'
        });

      if (this.details.open) {
        this.tl.progress(1);
      }
    }
    instantClose() {
      this.tl.timeScale(10).reverse();
    }
    animateClose() {
      this.tl.timeScale(3).reverse();
    }
    animateOpen() {
      this.tl.timeScale(1).play();
    }
    onClick(e) {
      e.preventDefault();
      if (this.tl.reversed()) {
        this.tl.timeScale(1).play();
      } else {
        this.tl.timeScale(3).reverse();
      }
    }
  }
  customElements.define('collapsible-row', CollapsibleRow);
}

document.addEventListener('DOMContentLoaded', () => {

  if (typeof Localization !== 'undefined') {
    new Localization();
  }
  if (typeof CartDrawer !== 'undefined') {
    new CartDrawer();
  }
  if (typeof Header !== 'undefined') {
    new Header();
  }
  if (typeof FooterMenuToggle !== 'undefined') {
    new FooterMenuToggle();
  }
});