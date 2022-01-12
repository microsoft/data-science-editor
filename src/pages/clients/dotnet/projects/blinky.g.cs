using Jacdac;
using Jacdac.Clients;
using System;
using System.Threading;

...

var led = new LedClient(bus, "led");
led.Connected += (s, e) =>
{
    var speed = 64u;
    var brightness = 128u;
    while (led.IsConnected)
    {
        Console.WriteLine("blink");
        // blue
        led.Animate(0, 0, brightness, speed);
        Thread.Sleep(500);
        // red
        led.Animate(brightness, 0, 0, speed);
        Thread.Sleep(500);
    }
};
