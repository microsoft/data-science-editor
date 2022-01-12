using Jacdac;
using Jacdac.Clients;
using System;

...

var slider = new PotentiometerClient(bus, "slider");
slider.Connected += (s, e) => Console.WriteLine("connected");
slider.Disconnected += (s, e) => Console.WriteLine("connected");
slider.ReadingChanged += (s, e) =>
{
    var position = slider.Position;
    Console.WriteLine($"position: {position}");
};
