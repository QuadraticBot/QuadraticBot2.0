# Changelog

## 20/03/2022

* Added trycatch statement to end.js as to avoid an error when a giveaway message is deleted.
* Added support command.
* Changed deployCommands.js.

## 25/02/2022

* Fixed a bug that made giveaways that you added required roles to not being joinable.
* Added ability for members with `MANAGE_GUILD` permissions to create giveaways without the required role.
* Made `/config` success reply ephemeral.

## 24/02/2022

* Changed `/giveaway` to use modals, and fixed some bugs stemming from that.

## 23/02/2022

-   Fixed a bug where using `/config` where the bot didn't have `Manage Guild` permission would fail.
-   Fixed a bug where entering a giveaway you didn't have permission to enter, or that you created throws an error.
