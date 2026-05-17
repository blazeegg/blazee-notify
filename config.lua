Config = {}

Config.DefaultDuration = 5500
Config.DefaultPosition = 'top-center'
Config.DefaultType = 'info'
Config.MaxVisible = 5
Config.Volume = 0.5

Config.TestCommand = 'notifytest'
Config.ShowcaseCommand = 'notifyshowcase'
Config.ClearCommand = 'notifyclear'

-- These make common third-party event styles route through this UI.
-- If another framework notification UI is also active and you see duplicates,
-- set the matching compatibility toggle to false.
Config.Compatibility = {
    genericEvents = false,
    qbcoreEvent = false,
    esxEvent = false
}
