# Changelog

## 14/10/2022
- Created Discord server: https://discord.gg/qAuf27YQry
- Add Discord server to README.md
- Add Discord seever to /invite command

## 05/10/2022
- Fix https://github.com/Henry-Hiles/QuadraticBot2.0/issues/15.

## 31/08/2022
- Update README.md.

## 25/08/2022
- Add entrants number in giveaway embed.

## 23/08/2022

- Update Discord.JS to v14.
- Add config.yml for issue templates.

## 12/07/2022
- Fixed an error with ending giveaways when the user had DMs from the server turned off and the DMUsers config option was on.

## 19/06/2022
- Added Giveaway Info context menu.

## 18/05/2022
- Fixed a bug where giveaways sometimes wouldn't end.
- Remove an unneeded enviroment variable from package.json script.

## 17/05/2022
- Switched to pnpm
- Changed syntax from CommonJS to ES6
- Changed helpers to be a node module\
- Bot now only works on pnpm. (And perhaps yarn)

## 23/03/2022

-   Changed ping command to include "ms".
-   Added support for context menus.
-   Added end giveaway context menu (contextMenus/end.js)
-   Added reroll giveaway context menu (contextMenus/reroll.js)

## 20/03/2022

-   Added trycatch statement to end.js as to avoid an error when a giveaway message is deleted.
-   Added support command.
-   Changed deployCommands.js.

## 25/02/2022

-   Fixed a bug that made giveaways that you added required roles to not being joinable.
-   Added ability for members with `MANAGE_GUILD` permissions to create giveaways without the required role.
-   Made `/config` success reply ephemeral.

## 24/02/2022

-   Changed `/giveaway` to use modals, and fixed some bugs stemming from that.

## 23/02/2022

-   Fixed a bug where using `/config` where the bot didn't have `Manage Guild` permission would fail.
-   Fixed a bug where entering a giveaway you didn't have permission to enter, or that you created throws an error.
