feeblepoint
=========== 

![feeblepoint has a logo?](http://www.beholder.co.uk/feeblepoint/demo/feeblepoint/feeblepoint_logo_200_x_120.gif)

### Minimal page-by-page "presentations" in a browser. 

> Ooh! feeblepoint can **explain itself**: try double-clicking the feeblepoint
> presentation (`index.html`) about feeblepoint that feeblepoint ships with -- or
> see [the presentation on the web](http://www.beholder.co.uk/feeblepoint/demo/index.html).

For nerds, feeblepoint is an easy way to prepare an **ignite talk**, or things like
ignite talks.

> Alternatively,
> if you want something more lovely than feeblepoint, check out Hakim El Hattab's
> [reveal.js](http://hakim.se/projects/reveal-js)

* copy feeblepoint as a directory
* make "slides" as numbered HTML files `01.html` `02.html` `03.html`
* feeblepoint automatically advances to the next slide
* fiddle with the simple settings

feeblepoint runs with either `http://` or `file://` -- this means you can have
your presentation standing by on localhost, on the web, or as a directory *on a
USB stick*... or *all three*.

So, when minutes before your presentation is due to start you can't find the
right adaptor to make your machine talk to the projector, you can jump onto the
previous speaker's laptop while it's still connected, and either hit the web or
shove a USB stick into their port. The day is saved!

Also, by dropping a bit of responsive CSS into the mix, you *could* play your
presentation on your mobile device... which means you can rehearse or memorise
your presentation sitting on the bus on the way to the event (or even sitting
in the auditorium before you're due on).

* [Requirements](#requirements)
* [Set up](#set-up)
* [What you get](#what-you-get)
* [Configurable details](#configurable-details)
* [`feeblepoint` JavaScript function](#feeblepoint-javascript-function)
* [Renumbering utility](#renumbering-utility)
* [Creating a new presentation](#creating-a-new-presentation)
* [Troubleshooting & tidbits](#troubleshooting--tidbits)
* [License and disclaimer](#license-and-disclaimer)

About the name
--------------

Feeblepoint is inspired by Philip Greenspun's
[wimpypoint](http://philip.greenspun.com/wp/).
It's the same idea, implemented slightly differently, and many years later.

Requirements
------------

A web browser running JavaScript.

Best for people who are OK editing HTML (and, if you want to get fancy, CSS and
JavaScript).


Set up
------

The easy bit:

* copy this whole project (download the zip)
* double-click/open `index.html` and see it work
* edit the numbered html files, delete any surplus
* edit `index.html` to set the title (and maybe the link to your first slide
  if you changed it)
* edit `feeblepoint.js` to fix `final_slide_number`

The tiny, fiddly bit:

* make sure you've no gaps in your numbers:

    01.html
    02.html 
    03.html 
    04.html
   
...and so on. There's a wee utility for sorting this out for you if they're not
-- see `feeblepoint/utils/renumber.pl` (details [below](#renumbering-utility)).

Delete the HTML files you don't want. Feeblepoint simply **ignores any HTML
files that don't look like slides** (roughly, stick to *digit* + *digit* +
`.html` and you'll be OK).

What you get
------------

feeblepoint comes with its own demo -- 20 html files which you can either edit
or simply delete and make new. There's a blank one called `_slide.html` for you
to use (it contains the bare HTML you need for a slide).

When feeblepoint runs the presentation, it ignores anything that does not look
like an HTML file with a number before the dot (if you know regexps, that's
basically `\w*\d+\.html?`)... which is why the `_slide.html` file can sit there
quite happily without breaking anything. Note that the slide loads the preamble
and -- this is important if you want things to work -- the container div with
`id="feeble-slide"`.

There's a `feeblepoint/` directory which contains the Javascript and CSS it
needs.

Then there's `custom.css` which every slide loads, and where you can (if you
want) add the CSS your slides need. If you look in that, you'll see it's making
the **demo** slides pretty. It uses images in the `demo-images/` directory,
which contains the images used in the demo. You can delete them. Alternatively,
you could use them... but if you do, kindly attribute the images as they've
all been released under CC-BY-NC from
[https://www.flickr.com/photos/pennymaycock/](Penny Maycock aka babar141)).

Inside the `feeblepoint/` directory there's another directory call `utils/`.
Currently this only contains a renumbering utility (`renumber.pl`), but this is
superuseful if you want to insert slides. For example, make `03a.html` and
`03b.html` slides and run the renumbering utility... and everything will shunt
along and those slides will be the new `04.html` and `05.html` (with all the
existing slides' numbers bumped up to make space). Of course it handles gaps in
the numbering too, if you've deleted files. Basically, it does what you'd
expect to make everything nicely in order again.

`renumber.pl` also updates the `final_slide_number` setting for you, by
updating `feeblepoint.js`.

Maybe there will be new utilities in the future. Maybe.

If you're comfortable with JavaScript, have a look in
`feeblepoint/feeblepoint.js` to understand how everything works, and
also look into slide `18.html` in the demonstration.


Configurable details
--------------------

You can change several things by editing `feeblepoint/feeblepoint.js` --
the key things you can easily change are at the top, and clearly marked:

### `want_auto_advance`
   
    want_auto_advance = true

The auto-advance is super helpful, but if you don't want it, you can switch it
off (`false`). You can always step through your presentation with the **F** key
(forward) (or just hit **ENTER**). Or back with **B** (or **backspace**).

Pretty much everything else here depends on `want_auto_advance` being `true`.

Auto-advance doesn't control you: any time, hit **space** or click anywhere on
the window to pause/resume the countdown timer.


### `final_slide_number`

    final_slide_number = 20

You should tell feeblepoint what your final slide number is, so it can stop
looking for more files when it gets there. Yes, yes, in theory feeblepoint
*could* try to autodetect this, but this is a deliberate feature: probing the
directory for the next file won't work over the `file://` protocol, and when
you're panicking because you're on stage running your presentation off a USB
stick on a stranger's machine, you do not want things to behave differently
from when you ran them on your laptop using `http://`. Also, honestly, you
really ought to know how many slides are in your presentation.

But even if you get this wrong, things still work:

* if the number is too low, the auto-advance will stop but you can
  punch through it and continue forward as usual by hitting **F**
  (or **ENTER**).
* if the number is too high, you'll get a 404. Oops. Browser-back
  and refresh. Hit **space** (or click anywhere) to freeze right there.

Note that the `renumber.pl` in `utils/` automatically tries to set the
`final_slide_number` variable for you by changing it in `feeblepoint.js`.


### `slide_duration_in_seconds`

    slide_duration_in_seconds = 15

Each slide will be on screen *in total* for this number of seconds -- there's a
wee bit of fading in and out (also configurable if you look inside
`feeblpoint.js`) which is taken out of this total.

So, `15` is the right setting for a 20-slide Ignite talk (20 x 15s = 5 minutes).

You can easily override this duration for any slide, by putting a value in the
slide's `data-delay` attribute. Of course, only do this if you don't want all
your slides to be shown for the same duration.

If the number is just a number, it's a delay in milliseconds:

    <div id="feeble-slide" data-delay="9000">

but if you want that in seconds (normal humans don't think in milliseconds),
add `s` suffix:

    <div id="feeble-slide" data-delay="9s">

Alternatively, use a `x` prefix to multiply the slide duration (this is useful
because it means things play nicely if you subsequently change the
`slide_duration_in_seconds` setting):

    <div id="feeble-slide" data-delay="x2">

Remember that feeblepoint takes the `fadein_delay` and `fadeout_delay` values
away from the total. If this results in a slide wanting to be displayed for no
time at all, feeblepoint will revert to your presentation's
`slide_duration_in_seconds` setting.


### `want_shouty_progress_bar`

    want_shouty_progress_bar = true;

By default, the progress bar, which plainly shows you how much time you've got
left before the next slide appears, is in-yer-face. If you're running an Ignite
talk this *might* be OK, but in practice this may be unhelpfully distracting
for your audience. Set `want_shouty_progress_bar` to `false` to make it
narrower: it's still there -- so you can still see how long you've got left --
but it's not so shouty.


`feeblepoint` JavaScript function
---------------------------------

If you want to run some JavaScript on a particular slide, if you wrap it all
as a function called `feeblepoint`, feeblepoint will execute it for you at the
end of its jQuery DOM-is-ready setup.

You can see an example of this inside `18.html` of the demo.


Renumbering utility
-------------------

Numbered HTML files are all very well but when you're writing your presentation
you keep having to rename them to make space for new slides that need to go in
front of things you've already done.

So feeblepoint comes with a wee Perl script that helps you out: make files like
`08a.html` or `08g.html` -- there's an implicit order in them (which you'll see
in your directory listing). Then run `renumber.pl` to flatten everything out
into a nice, contiguous number line. It also shuffles names the *other* way if
you've deleted some and left a gap.

> **renumber.pl takes a single argument:**
> the directory in which your presentation files can be found.
> If you don't provide one, it will use the **current directory**.

The script will attempt to update the `feeblepoint.js` file for you too, if it
thinks the `final_slide_number` setting is wrong. It also prints a summary of
the slides' durations, and the total length of your presentation. For example,
this is the output of `renumber.pl` when run against the demo presentation that
feeblepoint ships with:

    $> feeblepoint/utils/renumber.pl

    - feeblepoint: renumbering in the current directory
    - ...because you didn't provide one as an argument
    - renumbering isn't necessary, order seems OK
    - final_slide_number should be 20
    - peeking into feeblepoint.js...
    - everything looks OK in there
    
      slide  duration (secs)  data-delay
      -----  ---------------  ----------
         *              6.0   (default)
         8              8.0   8000
         9              7.5   x1.25
        11             12.0   12s
        13              7.2   x1.2
        17              9.0   x1.5
        18             24.0   x4
        19             18.0   x3
        20             12.0   x2
    
    - presentation lasts about 2 mins 49 secs
    - bye

Creating a new presentation
---------------------------

You can create a new presentation by editing, deleting and copying the demo
files (use the renumber utility to tidy it up too, if needed). Alternatively,
delete them all and run:

    $> feeblepoint/utils/renumber.pl --slides=10

with the `--slides` option to specifiy the number of slides/pages you want.
This creates the right number of duplicates of `_slide.html` for you.


Troubleshooting & tidbits
-------------------------

### Index's GO button goes to 404 page

The `index.html` file's big green GO button links to `01.html` but it's
possible your presentation doesn't start with that page. If you have a really
big presentation, your slides might have three-digit names. In this case, edit
`index.html` and change the `href` of the GO button's &lt;a&gt; tag to match
your first page.

In fact, once feeblepoint starts, it looks for the *next* slide by incrementing
the number in the current filename (matching the number of digits). This means
if you really need to, you can have entirely separate presentations in there,
distinguished by prefix. Normal users don't need/want this, but just in case
it's handy, this means you can have files like these:

    01.html 02.html 03.html
    foo01.html foo02.html foo03.html foo04.html foo05.html
    bar1.htm bar2.htm bar3.html bar4.htm

all in the directory together and, perhaps by adding links to each start page
on your `index.html` they can and will run separately. Ooh.

### Custom end-of-slide behaviour

If you want something custom to happen at the end of the slide, you can define 
your own function called `_end_slide` and feeblepoint will execute that instead of
its own one (which normally just moves to the next slide).

For example, if you want your presentation to run forever, on your final slide
do this (which jumps back to slide number 1):

    function _end_slide() {
      location.href = location.href.replace(
        /(\d+)\.htm/, 
        "00001".substr(-number_of_digits_in_filenumber)+".htm");
    }

### Pause doesn't stop "reveals"

The pause/resume (clicking on the window, or a spacebar) only freezes the progress
timer. It doesn't pause the animations and timeouts that are running the reveal
effects *within* the slide.


License and disclaimer
----------------------

FeeblePoint: http://www.beholder.co.uk/feeblepoint/
Copyright (C) 2014  Beholder
This program is free software: GNU General Public License by FSF
http://www.gnu.org/licenses/gpl-3.0.txt

Finally, as usual, this software is provided as-is, and you need to check it's
doing what you want before standing up in front of a crowd of 2,000 to deliver
a career-forming presentation. Remember that you're still a slave to browser
implementation, your own edits, and screen-sizes (for example, beware
projectors that change the pixel dimensions of your "full screen" if you've
used pixels as a unit of measure in your CSS). Also, JavaScript's timer -- and
the way feeblepoint uses it -- can be a little approximate, so if you must be
very precise with your timing, use a clock too.

Having said all that, hopefully feeblepoint will help. Yay if it does.

<http://www.beholder.co.uk/feeblepoint/>

