# Road to Worlds — Game Concept V1

# Project overview

Working title: Road to Worlds

The project is an original, single-player, text-based esports management web game.

It takes broad inspiration from:

* Esports management games for team development, coaching, preparation and strategy.
* Old browser-based text simulation games, particularly the way matches are presented through chronological written commentary.
* Simple browser games as an example of keeping the core gameplay loop focused and replayable.

The game must remain original. Do not copy protected names, characters, champions, teams, commentary, artwork, interfaces, formulas or proprietary content from any existing game.

This is a personal, zero-budget project created by a beginner with limited React and TypeScript knowledge.

# Technical direction

Use:

* React
* Vite
* TypeScript
* React Router
* Plain CSS
* `useReducer`
* React Context only where needed
* localStorage
* GitHub
* Vercel
* ESLint

Do not use a backend for the first version.

Do not add:

* User accounts
* Authentication
* Databases
* Cloud saves
* Multiplayer
* Paid APIs
* AI-generated commentary
* Redux
* Large UI frameworks
* Unnecessary dependencies

Python may be used separately for testing and balancing match formulas, but the deployed game should run entirely in the browser using TypeScript.

# Development principles

* Keep the first version small and playable.
* Provide complete replacement files rather than partial code fragments.
* Clearly identify every file being created or replaced.
* Use beginner-friendly explanations.
* Provide PowerShell commands for Windows.
* Make one manageable change at a time.
* Avoid silently restructuring the project.
* Use British English in visible game text and documentation.
* Ensure desktop and mobile compatibility.
* Preserve localStorage save compatibility where practical.
* Run `npm run lint` and `npm run build` before deployment.

# Team identity and visual direction

The owner can choose a team name and manager name when starting a career, and edit them on the roster page without restarting. Both names are stored locally with the game, limited to 32 characters each, and retained across seasons. Older saves display the original team name until edited. Naming does not change match calculations or saved commentary.

The owner-approved visual direction is red and black: charcoal surfaces, strong red accents, squared controls, bold condensed headings and readable body text. This replaces the earlier soft green-and-blue styling while keeping the existing weekly navigation.

# Core gameplay identity

The game is primarily a coaching and management game, not an action game.

The player manages a fictional professional esports team with five roles:

* Top
* Jungle
* Mid
* Carry
* Support

The player prepares the team, manages condition and development, studies opponents, assigns champions, selects a strategy and watches a text-based match simulation.

# Core weekly loop

1. Review the team’s condition.
2. Review the next opponent.
3. Choose one weekly management activity.
4. Resolve one small random team event.
5. Assign champions to the five players.
6. Select a match strategy.
7. Simulate the match.
8. Reveal about 20–35 connected chronological match events.
9. Trigger one meaningful random in-match event.
10. Display victory or defeat.
11. Apply morale, fatigue, development, fan and standings changes.
12. Advance to the next week.

The first season should contain six matches.

After the season ends, display the final result and allow a new season to begin.

# Match presentation

The owner-approved experience update highlights player names, champions and selected key moments. A progressively revealed estimated gold-lead chart visualises match advantage. This is a presentation estimate, not an economy or a new input into the match result.

Following the owner's Match Engine V2 brief, matches should be presented as connected play-by-play with about 20–35 chronological events. This intentionally replaces the original short-report target. Situations lead to actions, responses and consequences that change momentum, map control and advantage before the next encounter. The winner emerges from that progression.

Original short-report illustration (V2 expands these moments into linked actions and responses):

04:20 — Your jungler moves towards the top lane.

08:15 — Your bottom lane forces the opposing carry away from the objective.

13:40 — The opposing team secures the first major objective.

19:25 — Your mid player reads the rotation and creates a favourable fight.

26:10 — Your carry survives the final engagement and closes the match.

VICTORY

The commentary should describe the result of the simulation rather than being unrelated random flavour text.

The first version should reveal commentary progressively and include a button to skip or instantly display the remaining report.

# In-match random events

Each match should contain approximately one major random event.

The event may occur during the early, middle or late phase.

Examples include:

* A mechanical outplay
* A positioning mistake
* A successful objective read
* A communication breakdown
* A player adapting to the opponent
* A risky call succeeding
* A risky call failing
* A high-morale player producing a clutch play
* A fatigued player making a poor decision

Random events must not decide matches by themselves.

Their probabilities and effects should be influenced by:

* Player morale
* Player fatigue
* Player playstyle
* Player focus
* Game sense
* Teamwork
* Leadership
* Team synergy
* Selected champions
* Selected strategy
* Opponent analysis

Player decisions and team quality should matter more than randomness.

# Player structure

The owner-approved experience update generates original esports handles and fictional personal names for all five managed players when a new game starts. Each opponent also receives a five-role line-up of identities. Identities remain stable throughout that save, including later seasons. Team brands, player roles and starting ability balance remain authored. Existing saves retain their original identities.

Each player should have:

* Name
* Role
* Role focus
* Playstyle
* Two preferred champions
* Mechanics
* Game Sense
* Teamwork
* Leadership
* Morale
* Fatigue
* Potential
* Matches Played

Do not store a separate Skill attribute.

Calculate an overall rating from:

* Mechanics
* Game Sense
* Teamwork
* Leadership

Morale and fatigue are temporary condition values.

Potential affects development but does not directly improve match performance.

Matches Played determines an experience category such as:

* Rookie
* Developing
* Experienced
* Veteran

Experience should provide small consistency benefits rather than a large direct strength bonus.

The player with the highest Leadership may act as the team captain.

Leadership may:

* Reduce morale loss
* Improve recovery after setbacks
* Reduce communication mistakes
* Improve team-building activities
* Help during close late-game situations

# Player role focuses

Each player has one permanent role focus.

Top:

* Frontline
* Duelist
* Split-Pusher

Jungle:

* Vanguard
* Assassin
* Utility

Mid:

* Control
* Burst
* Roaming

Carry:

* Hypercarry
* Lane Pressure
* Artillery

Support:

* Engage
* Protection
* Roaming

Focus describes what the player is naturally good at.

# Player playstyles

Use three universal playstyles:

## Aggressive

* Creates more opportunities
* Produces more early pressure
* Has a higher chance of risky mistakes
* Generates greater match variance

## Balanced

* Consistent
* Flexible
* No major strength or weakness
* Works with most strategies

## Patient

* Waits for safer opportunities
* Makes fewer severe mistakes
* Performs better in controlled or late-game situations
* Produces less early pressure

Playstyle describes how the player approaches situations.

# Champion system

Use approximately 12 original champions for the first skeleton.

Every role should have approximately three eligible champion choices.

Some champions may overlap two roles.

Suggested flexible-role structure:

* One Top/Jungle champion
* One Jungle/Support champion
* One Mid/Carry champion

Each champion should initially contain only:

* Name
* Primary role
* Optional secondary role
* Archetype or focus
* Early-game rating
* Late-game rating
* Team-fighting rating
* Difficulty

Do not add:

* Individual abilities
* Items
* Runes
* Cooldowns
* Detailed damage statistics
* Skill trees
* Pick-and-ban phases
* Large counter-pick tables

Each player should have two preferred champions.

Champion compatibility should be affected by:

* Whether the champion is preferred
* Whether the champion’s archetype matches the player’s focus
* Whether it is being used in its primary or secondary role
* Whether the champion suits the player’s playstyle
* Whether the champion supports the selected team strategy

Champion compatibility should matter, but player skill, condition and preparation should remain more important.

# Initial strategies

Use four team strategies:

* Early Aggression
* Objective Control
* Late-Game Scaling
* Protect the Carry

Different player focuses and champion archetypes should support different strategies.

Examples:

Early Aggression:

* Assassin
* Burst
* Lane Pressure
* Engage

Objective Control:

* Vanguard
* Utility
* Control

Late-Game Scaling:

* Frontline
* Hypercarry
* Protection

Protect the Carry:

* Frontline
* Utility
* Hypercarry
* Protection

# Management system

The management layer should focus on preparation, player condition and gradual development.

Use one weekly activity per week.

Once an activity is resolved, it cannot be selected again during that week.

Initial activities:

## Team Training

* Improves teamwork
* Improves team synergy
* Adds moderate fatigue

## Individual Training

* Targets one selected player
* Improves Mechanics or Game Sense
* Adds higher fatigue to that player
* Development chance is affected by Potential and current ability

## Opponent Analysis

* Reveals information about the next opponent
* Reduces the opponent’s tactical advantage
* Improves the chance of positive tactical match events
* Does not permanently improve player attributes

## Rest

* Reduces fatigue
* Slightly improves morale
* Provides no permanent skill development

## Team Building

* Improves morale
* Improves team synergy
* Provides no direct skill increase

The player should not be able to improve every area every week.

# Team-level values

Track:

* Week
* Wins
* Losses
* Fans
* Team synergy
* Selected weekly activity
* Opponent knowledge
* Selected strategy
* Match history
* Season status

Money should either be excluded from the first version or remain cosmetic.

Do not add contracts, salaries, transfers, sponsors or complex finances during the initial skeleton.

# Opponent structure

Begin with four fictional opponent teams.

Each opponent should have:

* Original team name
* Team identity
* Overall strength
* Preferred strategy
* Strong match phase
* Weak match phase
* One notable player
* One exploitable weakness
* Champion or drafting tendency

The four initial opponent identities should include:

* An aggressive early-game team
* An objective-control team
* A defensive late-game team
* An unpredictable flexible team

Opponents should feel mechanically different rather than being the same team with different numerical ratings.

# Scouting and opponent knowledge

Opponent Analysis should reveal useful information about the next opponent.

Possible knowledge levels:

Level 0:

* Team name
* Record

Level 1:

* Preferred strategy

Level 2:

* Strongest match phase

Level 3:

* Strategic weakness
* Likely champion tendency

For the initial skeleton, choosing Opponent Analysis may immediately provide full knowledge for the next match.

# Match calculation principles

Match outcomes should be influenced by:

* Mechanics
* Game Sense
* Teamwork
* Leadership
* Morale
* Fatigue
* Experience
* Team synergy
* Champion compatibility
* Selected strategy
* Strategy versus opponent
* Opponent strengths and weaknesses
* Opponent analysis
* One small controlled random factor

The exact formula may change during balancing.

Player ability and decisions must matter more than randomness.

Do not simulate every second, attack or ability.

Simulate meaningful phases and moments:

* Early game
* Mid game
* Major objective
* Late game
* Final engagement

# Random weekly events

Resolve one small management event before each match.

Initial events should mostly be automatic rather than choice-based.

Examples:

* A player performs well in practice
* A veteran organises an extra review session
* A player becomes frustrated after a defeat
* A difficult training session increases fatigue
* A team discussion improves synergy
* A player gains confidence on a preferred champion

These events should create variety without severely punishing the player.

# Initial routes

The owner-approved navigation update makes `/dashboard` the "This week" hub. A shared three-step guide leads through weekly activity, line-up and strategy, then match and result. Preparation opens after the weekly activity. Applying a result returns to the next week or final standings. Roster and standings are supporting views; the home page is the game menu.

Use a small route structure:

* `/` — Home, new game and continue
* `/dashboard` — Current week, team condition and weekly management
* `/team` — Roster and player details
* `/match` — Champion assignment, strategy selection and match simulation
* `/standings` — League table and season progress

The season result may initially be displayed inside the standings page instead of requiring another route.

# Save system

Use localStorage with a versioned key such as:

`text-esports-manager-save-v1`

Validate loaded save data.

Invalid or outdated save data must not crash the application.

Provide:

* Continue game
* Start new game
* Reset game

A later version may add manual JSON export and import, but this is not required for the first skeleton.

# First development objective

Do not build the entire game immediately.

Begin with the technical foundation only:

1. Create the React Vite TypeScript project.
2. Install React Router.
3. Create the agreed folder structure.
4. Add the project documentation.
5. Create a simple placeholder home page.
6. Confirm the development server works.
7. Confirm ESLint passes.
8. Confirm the production build passes.

After the foundation works, proceed one manageable phase at a time.

# Explicitly excluded from the first skeleton

* Backend services
* Database
* User accounts
* Cloud saving
* Multiplayer
* Real esports teams
* Real professional players
* Existing copyrighted champions
* Hero abilities
* Detailed drafting
* Contracts
* Transfers
* Sponsors
* Equipment
* Staff management
* Facilities
* Injuries
* Relationships between every player
* Complex economics
* Animated matches
* AI commentary

The purpose of the first skeleton is to prove that the preparation, champion assignment, strategy choice and text-match loop is enjoyable.
