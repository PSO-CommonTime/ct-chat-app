(function() {

    window.lastTouchX = 0;

    window.bindSlideEvents = function(selector) {
        var panels = document.querySelectorAll(selector);

        for(var i = 0; i < panels.length; i++) {
            var p = panels[i];
            p.addEventListener('touchmove', slideToReveal, true);
            p.addEventListener('touchend', touchEnd, true);
        }

        console.log('Bound Slide Events for %s panels', panels.length);
    }

    window.unbindSlideEvents = function(selector) {
        var panels = document.querySelectorAll(selector);

        for(var i = 0; i < panels.length; i++) {
            var p = panels[i];
            p.removeEventListener('touchmove', slideToReveal, true);
            p.removeEventListener('touchend', touchEnd, true);
        }

        console.log('Unbound Slide Events for %s panels', panels.length);
    }

    function slideToReveal(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();

        var currLeft = e.currentTarget.style.left;

        if(currLeft) {
            currLeft = parseInt(e.currentTarget.style.left.replace('vw', ''));
        }
        else {
            currLeft = 0;
        }

        if(currLeft > -16) {
            if(window.lastTouchX === 0) {
                window.lastTouchX = e.changedTouches[0].clientX;
                window.lastTouchTime = new Date().getTime();
                return;
            }

            var diff = window.lastTouchX - e.changedTouches[0].clientX;
            window.lastTouchFinal = e.changedTouches[0].clientX;

            // We're moving left
            if(diff > 0) {
                currLeft--;

                if(currLeft > -16) {
                    e.currentTarget.style.left = currLeft + 'vw';
                }
            }
            else {
                currLeft++;

                if(currLeft < 1) {
                    e.currentTarget.style.left = currLeft + 'vw';
                }
            }
            
        }
    }

    function touchEnd(e) {
        e.stopPropagation();
        e.stopImmediatePropagation();

        var currLeft = e.currentTarget.style.left;

        if(currLeft) {
            currLeft = parseInt(e.currentTarget.style.left.replace('vw', ''));
        }
        else {
            currLeft = 0;
        }

        var velocity = calculateVelocityOfCurrentTouch();

        if(velocity > 1.2) {
            e.currentTarget.style.left = '0vw';
        }
        else if(velocity < -1.2) {
            e.currentTarget.style.left = '-15vw';
        }
        else {
            if(currLeft < -8) {
                e.currentTarget.style.left = '-15vw';
            }
            else {
                e.currentTarget.style.left = '0vw';
            }
        }

        window.lastTouchX = 0;
    }

    function calculateVelocityOfCurrentTouch() {
        var finalPos = window.lastTouchFinal;
        var initialPos = window.lastTouchX;

        var finalTime = new Date().getTime();
        var initialTime = window.lastTouchTime;

        var pos = finalPos - initialPos;
        var time = finalTime - initialTime;

        var velocity = pos / time;

        console.log('Velocity: %s', velocity);
        return velocity;
    }

})();