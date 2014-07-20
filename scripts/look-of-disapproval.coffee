# Description:
#   Allows Hubot to give a look of disapproval
#
# Dependencies:
#   None
#
# Configuration:
#   None
#
# Commands:
#   hubot lod <name> - gives back the character for the look of disapproval, optionally @name
#
# Author:
#   ajacksified

module.exports = (robot) ->
  robot.hear /disapprove|disapproval|lod\s?(.*)/i, (msg) ->
    response = 'ಠ_ಠ'

    name = msg.match[1].trim()
    response += " @" + name if name != ""

    msg.send(response)