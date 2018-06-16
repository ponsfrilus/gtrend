gtrend(1) -- GitHub trending repo into terminal
===============================================

SYNOPSIS
--------

gtrend [OPTIONS]...


DESCRIPTION
-----------

`gtrend` use `trending-github` and `terminal-kit` to fetch GitHub trending repositories and display them into your terminal.

Using ↑ and ↓ keys you can select a repository and open it in your browser by pressing ENTER.


OPTIONS
-------

    -h, --help              Display this usage guide.
    -n, --num number        Number of items to display, default to 10.
    -t, --timespan string   Time span of repositories [ 'daily', 'weekly', 'monthly' ], default to daily.
    -s, --sort string       Sort repositories [ 'starsToday', 'stars', 'forks' ].
    -l, --language string   Specify a language, e.g. JavaScript, default to all.
    -b, --browser string    Specify a browser, e.g. firefox or google-chrome.
    --nocache               (re)Load repo from GitHub, renewing cache.
    --clearcache            Delete all previous cache files.
    -v, --version           Get the version.



INSTALLATION
------------

From the [npm registry](https://npmjs.com):

* locally (`--save`, `--save-dev`, or `--save-optional` add `gtrend` to your `package.json` file)

    npm install gtrend [--save|--save-dev|--save-optional]
    npm link

* globally (puts `gtrend` in your system's path):

    [sudo] npm i gtrend -g


USAGE
-----

* Typical Example  

    `gtrend -l javascript`

* Full Example  

    `gtrend -n 15 -t monthly -s stars -l ruby -b google-chrome`


INFO
----

[Project home](https://github.com/ponsfrilus/gtrend)


SEE ALSO
--------

[ponsfrilus](https://github.com/ponsfrilus)


REPORTING BUGS
--------------

See [gtrend repository](https://github.com/ponsfrilus/gtrend/issues).


[//]: # (rm doc/gtrend.1 && marked-man --version v0.0.3 --manual 'GitHub Utilities' doc/MAN.md > doc/gtrend.1 && man gtrend)
