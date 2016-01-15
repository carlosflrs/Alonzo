![Alonzo-Icon][icon]


[https://travis-ci.org/cs10/Alonzo](![Build Status](https://travis-ci.org/cs10/Alonzo.svg?branch=master))
# Alonzo

Alonzo is the sassy and helpful! bot for [CS10][awesomest-class]. He's our mascot. Alonzo has attitude, but that's OK, because he's pretty awesome in general! He's a big help to everyone on the team! If you haven't heard about CS10, you should check out the class, and learn how [we're changing the world][bjc4nyc]!
(See, we've got the cool start up marking buzz!)

Alonzo was born from GitHub's Campfire bot, hubot. Currently, Alonzo is configured to work with our staff HipChat instance.

#### Name
Alonzo's full name is, of course, Alonzo Church, the inventor of lambda calculus! He's the mascot of the CS10 class, as well as Snap<i>!</i>, and BJC. 

## Current Functionality
##### Caution: This is may not be up to date always... Documentation is hard, man.
### CS10 Tools
* bCourses interaction for lab check offs and slip days
* Slip days are handled through a web endpoint /slipdays/:sid
* Commands:
	* @Alonzo locker -- show the locker combo
	* @Alonzo links  -- give common links to TAs.
	* @Alonzo todo @user `task` -- assign that person a task in Asana.
	* @Alonzo shorten `url` -- Get a bjc.link short URL

### Fun Stuff & Useful Tools!
* @Alonzo question -- query wolfram alpha [Warning, currently broken. :(]
* ++ and -- score tracking are built in. Award your favorite TA some points!
* Meme generation is built in (@Alonzo <Meme Text>)
* Something called Hubots Against Humanity...idk what that's about. ;)
* Google Translate, Google Maps, Google Images!
* XKCD, of course!
* Url, base64 encoding and decoding as well as a bunch of hashing functions
* Specific Images of:
	* Programmer Ryan Gosling
	* Pugs
	* Pusheen The Cat
	* Octocats!

#### Please see the full list of [generated commands][help].

### Our class use of 'chat-ops' is described in the [TA-Ops](https://github.com/cs10/TA-Ops) repo.

## Setup Alonzo
Alonzo is designed to be deployed on Heroku and connected to HipChat. The initial setup has already been done, so adapting Alonzo should be easy.

1. Clone this repo to your machine.
2. These are the dependencies you should have:
    `node` (with `npm`) and the `heroku-toolbelt`
    On OS X systems, [`brew`](brew) is a good way to install these.
	* In general, you should have a recent version of `node` and `npm`.
3. If you have just cloned the repo, you should make sure to `npm install`.
4. Make a free Herkou account and get access to the Herkou app named 'alonzo'. Talk to the head TA to get access.
5. In your local copy of this repo add a remote as follows (this will allow you to push to Herkou in the next step):

    ```
    heroku git:remote -a alonzo
    ```

6. To update alonzo on Herkou (this pushes live to the chatbot!):

    ```bash
    git push heroku master
    heroku logs # make sure nothing broke!
    ```

7. Also push to this repo so that your changes get saved here.
8. All of the CS10 config values can be found in the file `.env [Alonzo]` (in a separate, secret, repo). The values are on Heroku or other places. You should be able to find where it is, if you have access. :) **If you want to test alonzo locally you'll need to copy this file into the root directory of this repo and name it `.env`.**

More detailed documentation can be found on the
[deploying Hubot to Heroku][deploy-heroku] wiki page.

## Other Notes
* When you're adding third party scripts be sure to `npm install --save SCRIPT` so others don't run into any issues!

### Testing Alonzo Locally

You can test Alonzo by running the following.

    $ ./alonzo

You'll see some start up output about where your scripts come from and a
prompt.

    [Sun, 04 Dec 2011 18:41:11 GMT] INFO Loading adapter shell
    [Sun, 04 Dec 2011 18:41:11 GMT] INFO Loading scripts from /home/tomb/Development/Alonzo/scripts
    [Sun, 04 Dec 2011 18:41:11 GMT] INFO Loading scripts from /home/tomb/Development/Alonzo/src/scripts
    Alonzo>

Then you can interact with Alonzo by typing `Alonzo help`.

    Alonzo> Alonzo help

    Alonzo> animate me <query> - The same thing as `image me`, except adds a few
    convert me <expression> to <units> - Convert expression to given units.
    help - Displays all of the help commands that Alonzo knows about.
    ...

__Please at least run Alonzo locally before deploying!__

## Writing New Scripts

Take a look at the scripts in the `./scripts` folder for examples.
Delete any scripts you think are useless or boring. Add whatever functionality you want Alonzo to have. Read up on what you can do with Alonzo in the [Scripting Guide][scripts]. Scripts are pretty easy to write!

https://leanpub.com/automation-and-monitoring-with-hubot/read#leanpub-auto-cross-script-communication-with-events

#### hubot-scripts repo
Please don't use scripts from [hubot-scripts][Hubot-scripts]. The repo is officially deprecated an no longer maintained! You should search for the script in question as it's own package, or just create a new script inside the local scripts directory. Please make sure any configuration is documented.

#### external-scripts
Alonzo is able to load scripts from third-party `npm` packages! To enable
this functionality you can follow the following steps.

1. Add the packages as dependencies into your `package.json`
2. `npm install --saves` to make sure those packages are installed

To enable third-party scripts that you've added you will need to add the package
name as a double quoted string to the `external-scripts.json` file in this repo.

A good collection of scripts can be found in the [hubot-scripts organization](https://github.com/hubot-scripts).

[icon]: http://snap.berkeley.edu/alonzo.svg
[awesomest-class]: http://cs10.org/
[bjc4nyc]: http://bjc.berkeley.edu/website/bjc4nyc.html
[help]: http://alonzo.herokuapp.com/Alonzo/help
[Hubot-scripts]: https://github.com/github/Hubot-scripts
[scripts]: https://github.com/github/Alonzo/blob/master/docs/scripting.md
[heroku-node-docs]: http://devcenter.heroku.com/articles/node-js
[deploy-heroku]: https://github.com/github/Hubot/blob/master/docs/deploying/heroku.md
