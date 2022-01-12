using Jacdac;
using Jacdac.Clients;
using System.Threading;

...

var led = new LedClient(bus, "led");
var slider = new PotentiometerClient(bus, "slider");
var speed = 64u;

while (true)
{
    try
    {
        // grab brightness
        var brightness = (uint)(slider.Position * 100);
        // blue
        led.Animate(0, 0, brightness, speed);
        Thread.Sleep(500);
        // red
        led.Animate(brightness, 0, 0, speed);
        Thread.Sleep(500);
    }
    catch (ClientDisconnectedException)
    {
        Thread.Sleep(1000);
    }
}
