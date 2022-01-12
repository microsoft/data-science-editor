using Jacdac;
using Jacdac.Clients;
using System;
using System.Threading;

...

var rot = new RotaryEncoderClient(bus, "rot");
var mouse = new HidMouseClient(bus, "mouse");
int lastPosition = 0;

rot.Connected += (s, e) => lastPosition = rot.Position;
rot.ReadingChanged += (s, e) =>
{
    var position = rot.Position;
    if (position < lastPosition)
        mouse.Wheel(-1, 0);
    else
        mouse.Wheel(1, 0);
    lastPosition = position;
};
