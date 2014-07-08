#!/usr/bin/perl
use warnings;

# feebelpoint: http://www.beholder.co.uk/feeblepoint/
#
# Utility for renumbering presentation files (slides) in a feeblepoint project
# so that they're all contiguously numbered, starting from 1. It will preserve
# the number of digits in the filenames. To insert a slide between 04.html and
# 05.html, simply make 04a.html (or b, or c) and then run this utility.
#
# Similarly, if you've deleted a file and left a gap, this script smooths that
# out too.
#
# Note it works by temporarily renaming files with underscore prefixes (so
# 02.html will briefly be _02.html) so don't create files with such names
# yourself.
#
# Finally, the script checks the setting you have for the final slide
# number in the feeblepoint.js file, and if it looks wrong, it will
# attempt to fix that for you too.
#
#---------------------------------------------------------------------------


# Since it's easy to slap a feeblepoint presentation onto a webserver
# (for good reasons), let's anticipate people unwittingly putting this
# perl script up there too, and make such a thing harmless:

if (exists $ENV{'HTTP_HOST'}){
  print "Content-type:text/plain\n\nscript won't run on a webserver\n";
  exit;  
}

use File::Spec;
use File::Copy;
use Getopt::Long;

# feeblepoint can cope with huge presentations, but a big number of
# slides is so unusual, let's guess that anything over three digits
# is a silly typo
my $max_number = 999;
my $created_new_presentation = 0;
my $debug = 0;
my $js_filename = 'feeblepoint.js';
my $js_var_final_slide = 'final_slide_number';
my $js_var_default_dur = 'slide_duration_in_seconds';
my @js_var_fade_delays = ('fadein_delay', 'fadeout_delay');
my $feeblepoint_default_fade = 1;
my $template_filename = "_slide.html";

my $final_slide_number = 0;
my $dir_argument = shift;
my $presentation_dir =  $dir_argument || '.'; # default to current dir

GetOptions (
  "slides=i" => \$final_slide_number,
  "debug"  => \$debug)
or die("Error in command line arguments\n");

  # returns delay, in seconds
  sub parse_delay {
    my ($delay_str, $default_delay, $min_delay) = @_;
    my $delay = 0;
    my ($multi, $number, $secs) = $delay_str =~ /^(x?)(\d+\.?\d*)(s?)/i;
    if ($multi) {
      $delay = $default_delay * $number;
    } elsif ($secs) {
      $delay = $number;
    } else {
      $delay = $number/1000;
    }
    if ($delay < $min_delay) {
      $delay = $default_delay;
    }
    return $delay;
  }

  
my @dirs = File::Spec->splitdir( $presentation_dir );

print "- feeblepoint: renumbering in ";
if ($dir_argument) {
  print qq!directory "$presentation_dir"!;
} else {
  print "the current directory\n- ...because you didn't provide one as an argument";
}
print "\n";

opendir(my $dh, $presentation_dir) || die "can't opendir $presentation_dir: $!\n";
@numbered_filenames = sort grep { 
    /\d+\w?\.html?$/ # anything ending in numbers (maybe a letter too) + ext
    && !/^_/         # but not if it begins with underscore: ignore those files!
    && -f "$presentation_dir/$_"  # and only if it's a plain file
  } readdir($dh);
closedir $dh;

if ($final_slide_number) {
  if ($final_slide_number=~/^\d+$/) {
    print("- attempting to create $final_slide_number slide(s)\n");
    die("- will NOT create new files\n" .
        "- you must delete the existing slides first:\n" .
        "  " . join(", ", @numbered_filenames) . "\n")
        if @numbered_filenames;
    die("- will NOT create new files\n" .
        "- maximum number of files for this utility is $max_number\n" .
        "- if you really do want $final_slide_number, edit this script's \$max_number setting\n")
        if $final_slide_number >= $max_number;
    foreach my $i (1..$final_slide_number) {
      # big presentation, go to 3 digits (90+ slides: allow for future adds)
      my $filename = sprintf(($final_slide_number > 90? '%03d':'%02d').".html", $i);
      print "- copying _slide.html to $filename\n";
      my $from = File::Spec->catfile( @dirs, $template_filename );
      my $to = File::Spec->catfile( @dirs, $filename );
      copy($from, $to) or die "- failed to copy $from to $to:\n- $!\n";
      push @numbered_filenames, $to;
    }
    $created_new_presentation++;
  } else {
    die("- invalid slides option: whole number only!\n");
  }
}
die("- didn't find any presentation files (e.g., 01.html, 02.html) in $presentation_dir\n")
  unless @numbered_filenames;

my %transition_filenames;
my %target_filenames;
my $i = 0;
my $order_is_wrong = 0;
my %slide_duration_strings;
foreach my $old_filename (@numbered_filenames) {
  $i++;
  $slide_duration_strings{$i} = "";
  my $new_filename = $old_filename;
  # Actually should determine the number of digits used in filenames by finding
  # the most common case... but here we're just using the number found, which is
  # OK but might catch someone out who's not realised it needs to be consistent.
  $new_filename =~ s/^(\D*)(\d+)(\w*)(\.html?)$/"_$1" . sprintf('%0' . length($2) . 'd', $i) . $4/e;
  if ($i != $2 or $3) { # order has jumped (or didn't start at 1) or has chars
    $order_is_wrong++;
  }
  $transition_filenames{$old_filename} = $new_filename;
  my $from = File::Spec->catfile( @dirs, $old_filename );
  if (open HTML, $from) {
    my $html;
    while(<HTML>){$html.=$_}
    close HTML;
    if ($html=~/(<div[^>]+\bid\s*\=\s*["']?feeble-slide\b[^>]*>)/i) {
      my $slide_tag = $1;
      if ($slide_tag =~ /\bdata-delay\s*\=["']?(x?\d+\.?\d*s?)/i) {
        $slide_duration_strings{$i} = lc $1;
      }
    }
  }
}

if (not $order_is_wrong) {
  print "- renumbering isn't necessary, order seems OK\n" unless $created_new_presentation;
} else {
  foreach my $old_filename (@numbered_filenames) {  
    print " - $i: $old_filename --> $transition_filenames{$old_filename}\n" if $debug;
    my $from = File::Spec->catfile( @dirs, $old_filename );
    my $to = File::Spec->catfile( @dirs, $transition_filenames{$old_filename} );
    rename $from, $to or die("failed to rename $from to $to:\n$!\n");
  }
  print " - renamed all to _*, now finishing...\n" if $debug;
  foreach my $tmp_filename (values %transition_filenames) {
    my $final_filename = substr($tmp_filename, 1); # strip prefix underscore
    my $from = File::Spec->catfile( @dirs, $tmp_filename );
    my $to = File::Spec->catfile( @dirs, $final_filename );
    rename $from, $to or die("failed to rename $from to $to:\n$!\n");
  }
  print "- files shuffled/renamed: $order_is_wrong\n";
}

$final_slide_number = @numbered_filenames;
print "- final_slide_number should be $final_slide_number\n";

# javascript file in feeblepoint/ within presentation directory
my $javascript_file = File::Spec->catfile( (@dirs, 'feeblepoint'), $js_filename);
my $js_needs_changing = 0;
my $default_duration_in_seconds;
my %fade_delays;
if (open JS, $javascript_file) {
  print "- peeking into $js_filename...\n";
  my $js_body;
  my $settings_found = 0;
  while (my $line = <JS>) {
    if ($line =~ /(var\s+$js_var_final_slide\s*\=\s*(\d+))/){
      $settings_found++;
      if ($2 != $final_slide_number) {
        print "***\n";
        print "*** $js_var_final_slide has wrong value ($2) in $js_filename: \n";
        $line =~ s/$1/var $js_var_final_slide = $final_slide_number/;
        $js_needs_changing++
      }
    }
    if ($line =~ /\bvar\s+$js_var_default_dur\s*\=\s*(\d+\.?\d*)/){
      $default_duration_in_seconds = $1;
    }
    foreach my $fade_var (@js_var_fade_delays) {
      if ($line =~ /\bvar\s+$fade_var\s*\=\s*(\d+\.?\d*)/) {
        $fade_delays{$fade_var} = $1;
      }
    }
    $js_body.=$line;
  }
  if ($settings_found != 1) {
    die("- something is broken in $javascript_file:\n" .
      "- expected to see $js_var_final_slide being set once, but found it x $settings_found\n");
  }
  close JS;
  if ($js_needs_changing) {
    if (open JS, ">$javascript_file") {
      print JS $js_body;
      close JS;
      print "*** automatically updated $javascript_file\n";
      print "*** it's now set to $$final_slide_number\n";
    } else {
      print "*** please change it!\n";
      print "*** (script failed to open (for write) $javascript_file:\n    $!\n)";
    }
    print "***\n";
  } else {
    print "- everything looks OK in there\n";
  }
  print "\n";
  my $presentation_delay_in_seconds = 0;
  my @delay_report_lines;
  my $fade_delay_in_seconds = 0;
  # fade_delay is fadein_delay + fadeout_delay (in ms)
  foreach (values %fade_delays){$fade_delay_in_seconds += $_/1000};
  foreach my $i (sort {$a <=> $b} keys %slide_duration_strings) {
    my $delay_str = $slide_duration_strings{$i};
    if ($delay_str) {
      my $delay = parse_delay($delay_str, $default_duration_in_seconds, $fade_delay_in_seconds);
      $presentation_delay_in_seconds += $delay;
      push @delay_report_lines, sprintf("   %3d        %9.1f   %s\n",
        $i, $delay, $delay_str);
    } else {
      $presentation_delay_in_seconds += $default_duration_in_seconds;
    }
  }
  print  "  slide  duration (secs)  data-delay\n";
  print  "  -----  ---------------  ----------\n";
  printf("     *        %9.1f   (default)\n", $default_duration_in_seconds);
  foreach (@delay_report_lines) { print };
  print "\n";
  if ($fade_delay_in_seconds != $feeblepoint_default_fade) {
    printf("- fade in+out lasts %.1f sec", $fade_delay_in_seconds);
    print "s" if $fade_delay_in_seconds != 1;
    print " (within those durations)\n";
  }
  my $presentation_delay_in_mins = int($presentation_delay_in_seconds/60);
  $presentation_delay_in_seconds = $presentation_delay_in_seconds % 60;
  print "- presentation lasts about $presentation_delay_in_mins min";
  print "s" if $presentation_delay_in_mins != 1;
  if ($presentation_delay_in_seconds) {
    print " $presentation_delay_in_seconds sec";
    print "s" if $presentation_delay_in_seconds != 1;
  }
  print "\n";
} else {
  print "- failed to open (to read only) $javascript_file: $!\n";
}

print "- bye\n";

