/**
 * Countdown Header Timer Component
 * Uses a different custom element name to avoid conflicts
 */
if (!customElements.get('countdown-header-timer')) {
  class CountdownHeaderTimer extends HTMLElement {
    constructor() {
      super();

      const timezone = this.dataset.timezone,
        date = this.dataset.date.split('-'),
        day = parseInt(date[0]),
        month = parseInt(date[1]),
        year = parseInt(date[2]);

      let time = this.dataset.time,
        tarhour, tarmin;

      if (time != null) {
        time = time.split(':');
        tarhour = parseInt(time[0]);
        tarmin = parseInt(time[1]);
      }

      // Set the date we're counting down to
      let date_string = month + '/' + day + '/' + year + ' ' + tarhour + ':' + tarmin + ' GMT' + timezone;
      // Time with timezone
      this.countDownDate = new Date(date_string).getTime();
      this.debugDateString = date_string; // Store for debugging
      
      // Debug: Log the countdown date setup
      console.log('Countdown setup:', {
        date_string,
        countDownDate: this.countDownDate,
        currentTime: new Date().getTime(),
        difference: this.countDownDate - new Date().getTime()
      });
    }

    connectedCallback() {
      let _this = this;
      const updateTime = function() {
        // Get current date and time
        const now = new Date().getTime();

        // Find the distance between now and the countdown date
        const distance = _this.countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the corresponding elements
        const daysEl = _this.querySelector('.days .countdown-timer__number');
        const hoursEl = _this.querySelector('.hours .countdown-timer__number');
        const minutesEl = _this.querySelector('.minutes .countdown-timer__number');
        const secondsEl = _this.querySelector('.seconds .countdown-timer__number');

        if (daysEl) daysEl.innerHTML = CountdownHeaderTimer.addZero(days);
        if (hoursEl) hoursEl.innerHTML = CountdownHeaderTimer.addZero(hours);
        if (minutesEl) minutesEl.innerHTML = CountdownHeaderTimer.addZero(minutes);
        if (secondsEl) secondsEl.innerHTML = CountdownHeaderTimer.addZero(seconds);

        // Add urgent class when time is running low (less than 1 hour)
        const isUrgent = days === 0 && hours === 0 && minutes < 60;
        [daysEl, hoursEl, minutesEl, secondsEl].forEach(el => {
          if (el) {
            el.classList.toggle('urgent', isUrgent);
          }
        });

        // If the countdown is finished, hide the header
        if (distance < 0) {
          console.log('Countdown expired! Distance:', distance, 'Current time:', new Date().getTime(), 'Target time:', _this.countDownDate);
          console.log('Current date:', new Date(), 'Target date:', new Date(_this.countDownDate));
          console.log('Date string was:', _this.debugDateString);
          
          // Temporarily comment out auto-hide to debug
          // clearInterval(_this.interval);
          // _this.hideCountdownHeader();
          
          // Just show expired state in timer instead
          if (daysEl) daysEl.innerHTML = '00';
          if (hoursEl) hoursEl.innerHTML = '00';
          if (minutesEl) minutesEl.innerHTML = '00';
          if (secondsEl) secondsEl.innerHTML = '00';
        }
      };

      // Update the countdown every 1 second
      updateTime();
      this.interval = setInterval(updateTime, 1000);
    }

    hideCountdownHeader() {
      const countdownHeader = document.querySelector('.countdown-header');
      if (countdownHeader) {
        countdownHeader.classList.add('expired');
        document.body.classList.remove('countdown-header-active');
        
        // Remove CSS custom property and direct styles
        document.documentElement.style.removeProperty('--countdown-header-height');
        const stickyHeader = document.querySelector('.header.header-sticky--active');
        if (stickyHeader && stickyHeader.style.top) {
          stickyHeader.style.removeProperty('top');
        }
      }
    }

    disconnectedCallback() {
      if (this.interval) {
        clearInterval(this.interval);
      }
    }

    static addZero(x) {
      return (x < 10 && x >= 0) ? "0" + x : x;
    }
  }

  customElements.define('countdown-header-timer', CountdownHeaderTimer);
}

// Initialize countdown header functionality
document.addEventListener('DOMContentLoaded', function() {
  const countdownHeader = document.querySelector('.countdown-header');
  
  if (countdownHeader) {
    // Check if user previously dismissed the header
    const dismissedKey = 'countdownHeaderDismissed_' + new Date().toDateString();
    if (localStorage.getItem(dismissedKey) === 'true') {
      countdownHeader.classList.add('expired');
      return;
    }

    // Add body class for spacing adjustment
    document.body.classList.add('countdown-header-active');
    
    // Set countdown header height as CSS custom property instead of direct style manipulation
    const headerHeight = countdownHeader.offsetHeight;
    document.documentElement.style.setProperty('--countdown-header-height', headerHeight + 'px');
    
    // Remove any direct style.top manipulation to avoid conflicts with Header class
    const stickyHeader = document.querySelector('.header.header-sticky--active');
    if (stickyHeader && stickyHeader.style.top) {
      stickyHeader.style.removeProperty('top');
    }

    // Add close functionality if close button exists
    const closeButton = countdownHeader.querySelector('.countdown-header__close');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        countdownHeader.classList.add('expired');
        document.body.classList.remove('countdown-header-active');
        
        // Remove CSS custom property and direct styles
        document.documentElement.style.removeProperty('--countdown-header-height');
        const stickyHeader = document.querySelector('.header.header-sticky--active');
        if (stickyHeader && stickyHeader.style.top) {
          stickyHeader.style.removeProperty('top');
        }
        
        // Store in localStorage to remember user dismissed it (for today only)
        localStorage.setItem(dismissedKey, 'true');
      });
    }
  }
  
  // Handle window resize
  window.addEventListener('resize', function() {
    const countdownHeader = document.querySelector('.countdown-header');
    
    if (countdownHeader && !countdownHeader.classList.contains('expired')) {
      const headerHeight = countdownHeader.offsetHeight;
      document.documentElement.style.setProperty('--countdown-header-height', headerHeight + 'px');
    }
  });
});
