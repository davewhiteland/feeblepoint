// FeeblePoint: http://www.beholder.co.uk/feeblepoint/
// Copyright (C) 2014  Beholder
// This program is free software: GNU General Public License by FSF
// http://www.gnu.org/licenses/gpl-3.0.txt

//======================================================================
// want_auto_advance:
//----------------------------------------------------------------------
// feeblepoint will automatically advance to the next slide (set the
// delay between advances below: see 'slide_duration_in_seconds').
// It's easy to pause/resume this (just click on the screen/hit a key),
// but if you really don't want your presentation to advance itself,
// set want_auto_advance to false to switch it off.
// Default/suggested value: true
   
var want_auto_advance = true;


//======================================================================
// final_slide_number:
//----------------------------------------------------------------------
// If you leave this too high, you'll end with a 404.
// If you leave this too low, your presentation will freeze at that page.
// For an "ignite talk", this should be 20
// feeblepoint will stop auto-advancing when it gets to this slide
// number (you can manually step past it)
   
var final_slide_number = 20;

// Note:
// It would be nice to simply test for existence of the next file (that is, to
// automatically detect when we've got to the end), but (for good reasons) that
// won't work over a file:// protocol, so for now, do it this way. This is a
// design policy decision: feeblepoint presentations *must* work over the
// file:// protocol (so you can stick a USB stick into someone's machine and
// double-click index.html, and it will reliably work). Moments before a
// presentation, up on stage, you don't have time to think/find a webserver.
//
// Also, if you get this wrong, and your presentation freezes, don't
// panic: feeblepoint ignores this if you manually advance (that is,
// hitting the *next* button will always try to advance for you.


//======================================================================
// slide_duration_in_seconds:
//----------------------------------------------------------------------
// For an "ignite talk", this should be 15
// (because 20 x 15-second slides = 5 minutes)
//
// Note you can override this value on any individual slide with
// the data-delay attribute:
//
//     <div id="feeble-slide" data-delay="0.25">...</div>

var slide_duration_in_seconds = 6;


//======================================================================
// want_shouty_progress_bar:
//----------------------------------------------------------------------
// The progress bar, showing time running out is subtle...
// unless it's shouty.
// Set this to true if you want everyone, including your audience, to
// clearly see time running out.
// This can be distracting, so set it to false.
// The default is true simply so it's obvious in the demo.

var want_shouty_progress_bar = true; 




// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// ** Below this point you're starting to fiddle with things that you
// ** don't need to change for a a normal presentation (but you might
// ** want to change anyway)
//
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -




//======================================================================
// fadein_delay, fadeout_delay
//-----------------------------------------------------------------------
// feeblepoint fades out the old slide, then fades in the new slide.
// Set the duration (in milliseconds) of each transition.
// These times eat into the total slide display time, they are not
// in addition to them.
// The default is 500 (for both), which seems to work fine.
// Be wary of changing these: if you make them too big: if you've set
// custom slide delays that are shorter than these fade-times combined,
// those slides will use the default slide delay instead.

var fadein_delay = 500;
var fadeout_delay = 500;


//======================================================================
// number_of_digits_in_filenumber:
//-----------------------------------------------------------------------
// feeblepoint insists all the slides' filenames contain the same number
// of digits. This is a design decision, since on most systems this 
// is what you want for sensible directory/editor sidebar list order.
// You can probably go quite high, but if you really do have 10,000
// slides then your presentation is probably too long.
// Default/suggested value: 2 (for 01.html, 02.html, etc.) unless you
// have over 100 slides, in which case, 3.

var number_of_digits_in_filenumber = 2; 


//======================================================================
// progress_amber_time, progress_red_time
//-----------------------------------------------------------------------
// Progress bar goes amber and then red when this many milliseconds
// remain, respectively. Note this is not a percentage of the slide's
// duration: it's fixed time.
// Default/suggested values: amber 4000, red 2000

var progress_amber_time = 4000;
var progress_red_time = 2000;


//======================================================================
// default_reveal_delay
//-----------------------------------------------------------------------
// If you give an element class "reveal", then it will initially be
// hidden (CSS display:none) until the default_reveal_delay number of
// milliseconds has passed. You can override this on a case-by-case
// basis by setting a data-delay value, for example:
//
//     <p class="reveal" data-delay="1000">One</p>
//     <p class="reveal" data-delay="2000">Two</p>
//     <p class="reveal" data-delay="2000">Three</p>
//
// If you don't specify a delay, it defaults to (roughly) half-way
// through the slide's duration.
//-----------------------------------------------------------------------


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// end of obviously customisable things... below here, tweak 
// everything to get it to do what you want :-)
//
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

var key_code_DELETE = 8; // char code for the backspace/del key
var key_code_ENTER = 13; // char code for the enter/return key

var timer_tick = 100; // resolution of the setTimeouts
var progress_bar_id = 'feeble-timer';
var slide_id = 'feeble-slide';
var pause_alert_id = 'feeble-pause-alert';

var default_slide_duration_in_ms = slide_duration_in_seconds * 1000
var slide_display_time;
var is_paused = false;
var $pause_alert;

var NEXT = true;
var PREVIOUS = false;

function get_page_number(str){
  var url = str? str : ("" + location.href + "");
  var nums = url.match(/(\d+)(?=\.htm)/);
  if (nums){
    return parseInt(nums[nums.length-1],10);
  } else {
    return NaN;
  } 
}

function end_slide(){
  if (typeof(_end_slide) == typeof(Function)){
    _end_slide();
  } else {
    var slide_number = get_page_number();
    // note: if slide_number > final_slide_number, keep auto-advancing!
    // this happens because user has punched past the final_slide_number
    // and is still going, so help them out by ingoring it
    if ((! isNaN(slide_number)) && slide_number != final_slide_number){
      jQuery("#" + slide_id).fadeOut(fadeout_delay, function () {display_another_slide(NEXT)});
    }
  }
}

// accept strings such as 8000, 8s, x2.5
// base_value used for multipliers, default_value used if result < min_value
function parse_delay_string(delay_string, base_value, default_value, min_value) {
  var delay = 0;
  if (delay_string != null) {
    var match = (""+delay_string).match(/\s*(x?)\s*(\d+\.?\d*)(s?)/i);
    if (match != null) {
      if (match.length > 1 && match[1]) { // it's a multiplier
        delay = base_value * match[2];
      } else if (match.length > 1 && match[2]) {
        delay = match[2];
        if (match.length > 2 && match[3]){ // e.g., 4s
          delay = delay * 1000;
        }
      }
    }
  }
  if (delay <= min_value) {
    delay = default_value;
  }
  return delay;
}

function display_slide(){
  var $slide = jQuery("#" + slide_id);
  $slide.fadeIn(fadein_delay);
  if (want_auto_advance) {
    delay = parse_delay_string(
              $slide.data("delay"), 
              default_slide_duration_in_ms, default_slide_duration_in_ms,
              fadein_delay + fadeout_delay);
    slide_display_time = delay;
    countdown(delay - fadeout_delay);
  }
}

function display_another_slide(is_going_forward) {
  var newLocation = location.href + "";
  var page_number = get_page_number();
  if ((is_going_forward == null) || (page_number === 1 && ! is_going_forward)) {
    newLocation=newLocation.replace(/(\w+)\.htm/, "index.htm");    
  } else {
    var newSlideNumber = 
      (
        (
          page_number + (is_going_forward? 1:-1)
          + Math.pow(10, number_of_digits_in_filenumber) // aka fancypadding ;-)
        ) + ""
      ).substr(-number_of_digits_in_filenumber);
    newLocation=newLocation.replace(/(\d+)\.htm/, newSlideNumber+".htm");
  }
  location.href=newLocation;
}

function countdown(time_left){
  if (is_paused){
    setTimeout("countdown(" + (time_left) + ")", timer_tick);
  } else {
    var $progress_bar = jQuery("#" + progress_bar_id);
    if (time_left <= 0){
      $progress_bar.fadeOut(); // slightly prettier than hiding
      end_slide();
    } else {
      if (time_left <= progress_amber_time){
        $progress_bar.css({"background-color": (time_left <= progress_red_time?"#ff0000":"#ff9933")})
      }
      var width = Math.floor(jQuery("body").width() * (time_left/slide_display_time));
      $progress_bar.width(width);
      setTimeout("countdown(" + (time_left-timer_tick) + ")", timer_tick); 
    }
  }
}

function toggle_pause_play(){
  is_paused = ! is_paused;
  var x = (jQuery(document).width()-$pause_alert.width())/2;
  if (is_paused) {
    $pause_alert.removeClass('feeble-resume');    
  } else {
    $pause_alert.addClass('feeble-resume');
  }
  $pause_alert.css('left', x).stop().show().fadeOut();
}

// using jQuery, not $, *just in case* you've pasted something into your
// presentation slides that interferes with this. Unlikely, but heh.

jQuery(function() {
  var page_number = get_page_number();
  if (isNaN(page_number) || page_number==0){
    exit; // all bets are off if this doesn't feel like a slide
  }
  jQuery(document).keypress( function(e) {
    var key_pressed = String.fromCharCode(e.which).toUpperCase();
    if (key_pressed == ' ') {
      toggle_pause_play();
    } else if (e.which == key_code_DELETE || key_pressed == 'B' ) {
      display_another_slide(PREVIOUS);      
    } else if (e.which == key_code_ENTER || key_pressed == 'F' ) {
      display_another_slide(NEXT);
    } else if (key_pressed == 'I') {
      display_another_slide(null);
    }
    e.preventDefault();    
  });
  if (want_auto_advance) {
    var $progress_bar = jQuery("<div></div>").attr("id", progress_bar_id);
    var $body = jQuery("body")
    if (want_shouty_progress_bar) {
      $body.addClass('feeble-want-shouty-timer');
    }
    $body.prepend($progress_bar);
    $body.append(jQuery("<div></div>").attr("id", pause_alert_id));
    $body.on('click', function(){toggle_pause_play()});
  }
  $pause_alert = jQuery('#'+pause_alert_id);  
  display_slide(); // note; sets slide_display_time
  jQuery(".reveal").each(function(){
    var delay = parse_delay_string(
                  jQuery(this).data("delay"),
                  slide_display_time,
                  slide_display_time/2, // default reveal: half-time in slide
                  0);
    if (jQuery(this).data('method') === 'slideDown') {
      jQuery(this).delay(delay).slideDown();
    } else {
      jQuery(this).delay(delay).fadeIn();      
    }
  });
  // if the user has made a function called feeblepoint, run it
  // now that the DOM is ready:
  // this is useful if you want to write JavaScript for a specific
  // slide in the presentation, and have it executed when the page 
  // has loaded
  if (typeof(feeblepoint) == typeof(Function)){
    feeblepoint();
  }
})