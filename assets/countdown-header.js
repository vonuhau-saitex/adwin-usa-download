/**
 *  @class
 *  @function CountdownTimerHeader
 */
if (!customElements.get('countdown-timer')) {
  class CountdownTimer extends HTMLElement {
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
      // Time without timezone
      this.countDownDate = new Date(year, month - 1, day, tarhour, tarmin, 0, 0).getTime();

      // Time with timezone
      this.countDownDate = new Date(date_string).getTime();

      // Add class to body for styling purposes
      if (this.classList.contains('countdown-timer-header')) {
        document.body.classList.add('countdown-header-active');
      }
    }

    convertDateForIos(date) {
      var arr = date.split(/[- :]/);
      date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
      return date;
    }

    connectedCallback() {
      let _this = this;
      const updateTime = function() {

        // Get todays date and time
        const now = new Date().getTime();

        // Find the distance between now an the count down date
        const distance = _this.countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        if (distance < 0) {
          // Timer expired - hide the countdown header
          const countdownHeader = document.querySelector('.countdown-header-standalone');
          if (countdownHeader) {
            console.log("hey display in here")
            countdownHeader.style.display = 'none';
            document.body.classList.remove('countdown-header-active');
            
            // Reset header section top position
            const headerSection = document.querySelector('.header-section');
            if (headerSection) {
              headerSection.style.top = '0px';
            }
            
            // Reset CSS custom property
            document.documentElement.style.setProperty('--countdown-header-height', '0px');
            
            // Trigger header recalculation
            if (window.recalculateHeaderPosition) {
              window.recalculateHeaderPosition();
            }
          }
          
          _this.querySelector('.days .countdown-timer--column--number').innerHTML = 0;
          _this.querySelector('.hours .countdown-timer--column--number').innerHTML = 0;
          _this.querySelector('.minutes .countdown-timer--column--number').innerHTML = 0;
          _this.querySelector('.seconds .countdown-timer--column--number').innerHTML = 0;
        } else {
          requestAnimationFrame(updateTime);
          _this.querySelector('.days .countdown-timer--column--number').innerHTML = CountdownTimer.addZero(days);
          _this.querySelector('.hours .countdown-timer--column--number').innerHTML = CountdownTimer.addZero(hours);
          _this.querySelector('.minutes .countdown-timer--column--number').innerHTML = CountdownTimer.addZero(minutes);
          _this.querySelector('.seconds .countdown-timer--column--number').innerHTML = CountdownTimer.addZero(seconds);
        }
      };
      requestAnimationFrame(updateTime);
    }

    static addZero(x) {
      return (x < 10 && x >= 0) ? "0" + x : x;
    }
  }
  customElements.define('countdown-timer', CountdownTimer);
}

// Initialize countdown header functionality
document.addEventListener('DOMContentLoaded', function() {
  const countdownHeader = document.querySelector('.countdown-header-standalone');
  
  if (countdownHeader) {
    // Add class to body for styling purposes
    document.body.classList.add('countdown-header-active');
    
    // Function to adjust header position dynamically
    function adjustHeaderPosition() {
      const headerSection = document.querySelector('.header-section');
      if (headerSection && countdownHeader) {
        const countdownHeight = countdownHeader.offsetHeight;
        headerSection.style.top = countdownHeight + 'px';
        
        // Set CSS custom property for app.js to use
        document.documentElement.style.setProperty('--countdown-header-height', countdownHeight + 'px');
        
        // Trigger header recalculation
        if (window.recalculateHeaderPosition) {
          window.recalculateHeaderPosition();
        }
      }
    }
    
    // Function to remove countdown and reset header
    function removeCountdown() {
      // countdownHeader.style.display = 'none';
      document.body.classList.remove('countdown-header-active');
      
      // Reset header section top position
      const headerSection = document.querySelector('.header-section');
      if (headerSection) {
        headerSection.style.top = '0px';
      }
      
      // Reset CSS custom property
      document.documentElement.style.setProperty('--countdown-header-height', '0px');
      
      // Trigger header recalculation
      if (window.recalculateHeaderPosition) {
        window.recalculateHeaderPosition();
      }
    }
    
    // Adjust position on load and resize
    adjustHeaderPosition();
    window.addEventListener('resize', adjustHeaderPosition);
    
    // Optional: Add close functionality
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.className = 'countdown-close';
    closeButton.style.cssText = `
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    `;
    
    closeButton.addEventListener('click', function() {
      removeCountdown();
      // Store in localStorage to remember user preference
      localStorage.setItem('countdown-header-closed', 'true');
    });
    
    // Check if user previously closed the countdown
    if (localStorage.getItem('countdown-header-closed') === 'true') {
      removeCountdown();
    } else {
      countdownHeader.appendChild(closeButton);
      // Adjust position after adding close button
      setTimeout(adjustHeaderPosition, 100);
    }
  } else {
    // No countdown header, make sure CSS property is set to 0
    document.documentElement.style.setProperty('--countdown-header-height', '0px');
  }
});