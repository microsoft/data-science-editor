using Jacdac;
using Jacdac.Clients;
using System;
using System.Threading;

...

var led = new LedClient(bus, "led");
// wait for jacdac to find a LED service
led.Connected += (s, e) =>
{
    // as long as the led is connected, blink
    while (led.IsConnected)
    {
        // send red 24-bit RGB color (same as HTML colors!)
        led.SetColor(0xff0000);
        Thread.Sleep(500);
        // send blue
        led.SetColor(0x0000ff);
        Thread.Sleep(500);
    }
};
