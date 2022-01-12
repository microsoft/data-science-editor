using Jacdac;
using Jacdac.Clients;
using System;

...

var button = new ButtonClient(bus, "btn");
button.Down += (sender, args) => Console.WriteLine("button down");
button.Up += (sender, args) => Console.WriteLine("button up");
button.Hold += (sender, args) => Console.WriteLine("button hold");
