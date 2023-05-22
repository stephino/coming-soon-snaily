/**
 * Copyright 2013 Stephino
 */
$(document).ready(function(){
    "use strict";
    var intval = function (mixed_var, base) {var tmp;var type = typeof(mixed_var);if (type === 'boolean') {return +mixed_var;} else if (type === 'string') {tmp = parseInt(mixed_var, base || 10);return (isNaN(tmp) || !isFinite(tmp)) ? 0 : tmp;} else if (type === 'number' && isFinite(mixed_var)) {return mixed_var | 0;} else {return 0;}};
    var rand = function(numLow, numHigh) {var adjustedHigh = (parseFloat(numHigh) - parseFloat(numLow)) + 1;return Math.floor(Math.random()*adjustedHigh) + parseFloat(numLow);};

    var timeouts = [];
    var clearTimeouts = function() {
        for (var i = 0; i < timeouts.length; i++) {
            window.clearTimeout(timeouts[i]);
        }
    };
    var createSnail = function(){
        // Create the snail!
        var snailHolder = $('[snail]').length && $('[snail]').first();
        if (!snailHolder) {return;}
        
        // Get the options
        var options = {
            color: snailHolder.attr('snail-color'),
            trailColor: snailHolder.attr('trail-color'),
            duration: parseInt(snailHolder.attr('snail-duration'), 10),
            dialog: parseInt(snailHolder.attr('dialog-duration'), 10),
            percent: parseInt(snailHolder.attr('snail-percent'), 10),
            texts: [],
        };
        
        // Set the default color
        if (!options.color) {options.color = "green";}
        if (!options.trailColor) {options.trailColor = "green";}
        if (!options.duration) {options.duration = 2500;}
        if (!options.dialog) {options.dialog = 2000;}
        if (!options.percent) {options.percent = 75;}
        
        // Get the texts
        $.each(snailHolder.children('span'), function(){
           options.texts[options.texts.length] = $(this).html();
        });
        
        // Set the class on the body
        $('body').attr('class', options.color);
        
        // Create the snail
        var snail = $('<div class="snail"><div class="shell"><div class="percentage" style="color:'+options.color+';"></div></div><div class="body"><div class="eye eye-left"><div class="upper-lash"></div><div class="lower-lash"></div><div class="iris"></div></div><div class="eye eye-right"><div class="upper-lash"></div><div class="lower-lash"></div><div class="iris"></div></div></div></div>');
        
        // Add the snail to the track
        var track = $('<div class="track"><div class="trail" style="background-color:'+options.trailColor+';"></div></div>');
        track.prepend(snail);
        
        // Replace the snail holder with the track and the snail
        snailHolder.html(track);
        
        // Eye movement
        $(document).mousemove(function(event){
            var ym = event.pageY - snail.offset().top;
			var xm = event.pageX - snail.offset().left;
            var r = 10;
            var radius = 8;
            $.each($('.snail .iris'),function(k,v){
                var xo = $(v).parent().parent().width() - parseInt($(v).parent().css('right'), 10);
                var yo = parseInt($(v).parent().css('top'), 10);
                var ang = Math.atan((yo - ym) / (xm - xo));
                if (xo > xm) {ang += Math.PI;}
                $(v).css("top", (radius - Math.floor(Math.sin(ang) * r)) + "px").css("left", (Math.floor(Math.cos(ang) * r) + radius) + "px");
            });
        });
        
        var wink = function(left) {
            if (typeof left === 'undefined') {
                left = true;
            }
            var eye = $('.eye.eye-' + (left?'left':'right'));
            $('.upper-lash, .lower-lash', eye).stop().animate({
                height: '49%',
            }, {
                duration: 100,
                complete: function(){
                    $(this).animate({height: '0%'}, 1000);
                }
            });
        };
        $('.eye').on('click', function(){
            wink($(this).hasClass('eye-left'));
        });
        $('.shell').on('click', function(){
            wink(true);wink(false);walkAgain();
        });

        var winkLikeMad = function(){
            wink(rand(0,1)); wink(rand(0,1));
            timeouts[timeouts.length] = window.setTimeout(winkLikeMad, rand(500,3000));
        };
        
        var walkDistance = function(distance, duration) {
            if (distance<0) {distance = 0;}
            if (distance>100) {distance = 100;}
            var trackWidth = $(snail).parent().width() - $(snail).width();
            var subsetTime = 300;
            var contractRelax = function(contract, timeout) {
                if (contract) {
                    timeouts[timeouts.length] = window.setTimeout(function(){
                        $('.body', snail).addClass('contracted');
                    }, timeout);
                } else {
                    timeouts[timeouts.length] = window.setTimeout(function(){
                        $('.body', snail).removeClass('contracted');
                    }, timeout);
                }
            };
                
            for(var i=0; i < parseInt(duration/subsetTime, 10); i++) {
                contractRelax((i%2 === 0), subsetTime * i);
            }
            
            // Set the trail length
            var trailLength = ((distance <=5 ? 5 : distance >= 95 ? 95 : distance)/100 * $(snail).parent().width());
            
            // Move the trail
            $(snail).siblings('.trail').stop().animate({
                width: trailLength + 'px',
            }, {
                duration: duration,
                progress: function(a,p) {
                    $('.track > .snail > .shell > .percentage').html(parseInt(p*distance, 10) + '%');
                }
            });
            
            // Move the snail
            $(snail).stop().animate({
                left: (distance/100 * trackWidth) + 'px'
            }, {
                duration: duration
            });
        };
        
        // Make the snail breathe
        var breathe = function() {
            $('.track > .snail > .shell').addClass('breathe-in');
            timeouts[timeouts.length] = window.setTimeout(function(){
                $('.track > .snail > .shell').removeClass('breathe-in');
            }, 1000
            );
            timeouts[timeouts.length] = window.setTimeout(function(){
                breathe();
            }, 2000);
        };
        
        var createBubble = function(increment) {
            var otherBubbles = $('.bubble-holder', track);
            if (typeof increment === 'undefined') {increment = 0;}
            if (otherBubbles.length) {
                otherBubbles.fadeOut(function(){
                    $(this).remove();
                });
            }
            var text = typeof options.texts[increment] !== 'undefined' ? options.texts[increment] : '';
            var bubble = $('<div class="bubble-holder"><div class="large">'+text+'</div></div>');
            track.append(bubble);
            timeouts[timeouts.length] = window.setTimeout(function(){
                increment++;
                createBubble(increment >= options.texts.length ? 0 : increment);
            }, options.dialog);
        };
        
        
        // Countdown Class
        function Countdown() {
            var _this   = this;
            var countdown = $('.countdown');
            var date, color1, color2;
            this.debug  = true;
            this.daysChart = null;
            this.hoursChart = null;
            this.minutesChart = null;
            this.secondsChart = null;

            //create donut chart
            this.createPlot = function(id) {
                var s1 = [['a', 60], ['b', 0]];
                var width = intval($('#counter > .row > .col').width());
                var diameter = (width > 250 ? 250 : width) - 20;
                var thickness = diameter/10;
                var plot = $.jqplot(id, [s1], {
                    seriesDefaults: {
                        seriesColors: [color1, color2], 
                        markerOptions: {
                            size: 1
                        },
                        renderer: $.jqplot.DonutRenderer,
                        rendererOptions: {
                            sliceMargin: 3,
                            startAngle: 270,
                            padding: 0,
                            highlightMouseOver: false,
                            highlightMouseDown: false,
                            thickness: thickness,
                            shadowOffset: 1,
                            shadowDepth: 2,
                            shadowAlpha: 0.2,
                            diameter: diameter,
                        }
                    },
                    grid: {
                        shadow: false,
                        background: 'transparent',
                        borderWidth: 0
                    }
                });
                return plot;
            };

            //init application
            this.init = function() {
                if (countdown.length === 0) {return;}

                // Get the date
                date = countdown.attr('date');
                date = date.split('-');

                // Custom colors
                color1 = !countdown.attr('color1') ? '#1c202a' : countdown.attr('color1');
                color2 = !countdown.attr('color2') ? '#5ac834' : countdown.attr('color2');

                // Invalid date format
              if (date.length !== 3) {return;}

                // Set the actual date
                date = new Date(intval(date[0]), intval(date[1]) - 1, intval(date[2]));
                // Add the necessary HTML
                $('.countdown').html('<div id="counter">' + 
                      '<div class="row">' +
                      '<div class="span2 col">&nbsp;</div><div class="span2 col">' +
                        '<div id="daysChart" class="chart"></div>' +
                        '<div id="days" class="info"><span class="number">1</span><p>days</p></div>' +
                      '</div>' +
                      '<div class="span2 col">' +
                        '<div id="hoursChart" class="chart"></div>' +
                        '<div id="hours" class="info"><span class="number">1</span><p>hours</p></div>' +
                      '</div>' +
                      '<div class="span2 col">' +
                        '<div id="minutesChart" class="chart"></div>' +
                        '<div id="minutes" class="info"><span class="number">1</span><p>minutes</p></div>' +
                      '</div>' +
                      '<div class="span2 col">' +
                        '<div id="secondsChart" class="chart"></div>' +
                        '<div id="seconds" class="info"><span class="number">1</span><p>seconds</p></div>' +
                      '</div>' +
                    '</div>' +
                  '</div>');

                //create charts for days, hours, minutes and seconds
                this.daysChart = this.createPlot("daysChart");
                this.hoursChart = this.createPlot("hoursChart");
                this.minutesChart = this.createPlot("minutesChart");
                this.secondsChart = this.createPlot("secondsChart");

                //at start update counter
                this.checkDate();

                //every 1 sec update counter
                timeouts[timeouts.length] = window.setInterval(function() {
                    _this.checkDate();
                }, 1000);
            };

            //counter update function
            this.checkDate = function() {
                //get actually date
                var now = new Date();
                //get difference from launch date (declared in head in index.html)
                var diff = date.getTime() - now.getTime();

                //change multisecond result to seconds, minutes, hours and days
                var tmp = diff / 1000;
                var seconds = Math.floor(tmp % 60);
                tmp /= 60;
                var minutes = Math.floor(tmp % 60);
                tmp /= 60;
                var hours = Math.floor(tmp % 24);
                tmp /= 24;
                var days = Math.floor(tmp);

                //render in text
                $("#days .number").html(days);
                $("#hours .number").html(hours);
                $("#minutes .number").html(minutes);
                $("#seconds .number").html(seconds);
                
                var spelling = {
                    days:    [countdown.attr('day') ? countdown.attr('day') : "day", countdown.attr('days') ? countdown.attr('days') : "days"],
                    hours:   [countdown.attr('hour') ? countdown.attr('hour') : "hour", countdown.attr('hours') ? countdown.attr('hours') : "hours"],
                    minutes: [countdown.attr('minute') ? countdown.attr('minute') : "minute", countdown.attr('minutes') ? countdown.attr('minutes') : "minutes"],
                    seconds: [countdown.attr('second') ? countdown.attr('second') : "second", countdown.attr('seconds') ? countdown.attr('seconds') : "seconds"],
                };
                
                $("#days > p").html(days === 1 ? spelling.days[0] : spelling.days[1]);
                $("#hours > p").html(hours === 1 ? spelling.hours[0] : spelling.hours[1]);
                $("#minutes > p").html(minutes === 1 ? spelling.minutes[0] : spelling.minutes[1]);
                $("#seconds > p").html(seconds === 1 ? spelling.seconds[0] : spelling.seconds[1]);

                //prepare new data for charts
                var daysData    = [['a', 360 - days], ['b', days]];
                var hoursData   = [['a', 24  - hours], ['b', hours]];
                var minutesData = [['a', 60 - minutes], ['b', minutes]];
                var secondsData = [['a', 60 - seconds], ['b', seconds]];

                //draw charts with new data
                this.daysChart.series[0].data = daysData;
                this.daysChart.redraw();
                this.hoursChart.series[0].data = hoursData;
                this.hoursChart.redraw();
                this.minutesChart.series[0].data = minutesData;
                this.minutesChart.redraw();
                this.secondsChart.series[0].data = secondsData;
                this.secondsChart.redraw();
            };
        }
        
        // Redraw the character
        var recreateCharacter = function(){
            clearTimeouts();
            breathe();
            winkLikeMad();
            walkAgain();
            var countdown = new Countdown(); 
            countdown.init();
            createBubble();
        };
        
        var resizeParallax = function() {
            if (intval($(window).width()) >= 768) {
                $('section.parallax').css(
                    'marginTop', 
                    intval($('section.fixed').outerHeight()) + 'px'
                );
            } else {
                $('section.parallax').css(
                    'marginTop', 
                    'auto'
                );
            }
        };
        
        var walkAgain = function() {
            walkDistance(0, 1000);
            window.setTimeout(function(){
                walkDistance(options.percent, options.duration);
            }, 1100);
        };
        
        timeouts[timeouts.length] = window.setTimeout(recreateCharacter, 500);
        $(window).resize(function(){
            recreateCharacter();
            resizeParallax();
        });
        
        var createSlider = function() {
            // Get the image list
            var images = $('.slider > img');
            
            if (!images.length) {return;}
            
            // Replace the images with divs
            $.each(images, function(k){
                var replacement = $('<div class="slide" style="background-image: url('+$(this).attr('src')+');"></div>');
                $(this).replaceWith(replacement);
                images[k] = replacement;
            });
            
            // Get the options
            var options = {
                duration: $('.slider').attr('duration') ? intval($('.slider').attr('duration')) : 2000,
            };
            
            var currentSlide = 0;
            var totalSlides = images.length;
            
            var nextSlide = function(){
                // Set the active slide 
                $.each(images, function(){
                    $(this).fadeOut(options.duration/3);
                    $(this).removeClass('active');
                });
                $(images[currentSlide]).fadeIn(options.duration/5).addClass('active');
                
                // Increment the current slide
                currentSlide++;
                if (currentSlide > totalSlides - 1) {
                    currentSlide = 0;
                }
                
                window.setTimeout(nextSlide, options.duration);
            };
            nextSlide();
        };
        createSlider();
        
        // Parse forms
        $('.submit.btn').on('click', function(){
            $(this).closest('form').submit();
        });
        $.each($('form.validate'), function(){
            $(this).validate({
                submitHandler: function(form) {
                    var data = $(form).serializeArray();
                    var action = $(form).attr('action');
                    $.ajax({
                        method: 'post',
                        dataType: 'json',
                        url: action,
                        data: data,
                        success: function(d) {
                            // Prepare the message
                            var message = '';
                            $.each(d, function(k, m){
                                var messageType = 'boolean' === $.type(m.status) ? (m.status?'success':'error') : m.status;
                                message += '<div class="alert alert-'+messageType+'">'+m.message+'</div>';
                            });
                            // Replace the form with the message
                            $(form).replaceWith($(message));
                        },
                        error: function() {
                            var error = $('<div class="alert alert-error">Could not contact host. Please try again later.</div>');
                            $(form).replaceWith(error);
                        }
                    });
                }
            });
        });
        
        // Set the titles
        $('[title]').tooltip();
        $('.modal').draggable();
        $('.logo').append('<div class="image"></div><div class="ribbon"></div><div class="rectangle"></div><div class="arrow-down"></div>');
        
    };
    
    createSnail();
});