if (!customElements.get('shop-the-look')) {
	class ShopTheLook extends HTMLElement {
		constructor() {
			super();
		}
		connectedCallback() {
			window.addEventListener('DOMContentLoaded', (event) => {
				let drawer = document.getElementById('Product-Drawer'),
						body = document.body,
						_this = this;


				this.hotspots = this.querySelectorAll('.thb-hotspot');

				this.hotspots.forEach((hotspot, index) => {

					hotspot.addEventListener('click', function(evt) {
						evt.preventDefault();
						let productHandle = hotspot.dataset.productHandle,
			        	href = `${theme.routes.root_url}/products/${productHandle}?view=quick-view`;

						// remove double `/` in case shop might have /en or language in URL
			      href = href.replace('//', '/');
			      if (!href || !productHandle) {
			        return;
			      }
			      if (hotspot.classList.contains('loading')) {
			        return;
			      }
			      hotspot.classList.add('loading');
			      fetch(href, {
			          method: 'GET'
			        })
			        .then((response) => {
			          hotspot.classList.remove('loading');
			          return response.text();
			        })
			        .then(text => {
			          const sectionInnerHTML = new DOMParser()
			            .parseFromString(text, 'text/html')
			            .querySelector('#Product-Drawer-Content').innerHTML;

			          _this.renderQuickview(sectionInnerHTML, drawer, body, href, productHandle);

			        });
		      });
				});
			});
		}
		renderQuickview(sectionInnerHTML, drawer, body, href, productHandle) {
	    if (sectionInnerHTML) {
	      drawer.querySelector('#Product-Drawer-Content').innerHTML = sectionInnerHTML;

	      setTimeout(() => {
	        if (Shopify && Shopify.PaymentButton) {
	          Shopify.PaymentButton.init();
	        }
	      }, 300);
	      body.classList.add('open-cc');
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
	customElements.define('shop-the-look', ShopTheLook);
}
