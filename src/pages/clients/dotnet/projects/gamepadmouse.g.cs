using Jacdac;
using Jacdac.Clients;
using System;
using System.Threading;

...

var gamepad = new GamepadClient(bus, "gamepad");
var mouse = new HidMouseClient(bus, "mouse");
// listen for gamepad actions
gamepad.ReadingChanged += (s, e) =>
{
    // read stick position
    var dx = (int)(gamepad.X * 100);
    var dy = (int)(gamepad.Y * 100);
    // if enough movement, convert to mouse movement
    if (Math.Abs(dx) > 20 || Math.Abs(dy) > 20)
        mouse.Move(dx / 4, dy / 4, 0);
};
