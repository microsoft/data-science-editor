using Jacdac;
using Jacdac.Clients;
using System;
using System.Threading;

...

var humidity = new HumidityClient(bus, "humidity");
// read humidity in a timer
new Timer(state =>
{
    try
    {
        var h = humidity.Humidity;
        Console.WriteLine($"humidity: {h}");
    }
    catch (ClientDisconnectedException) { }
}, null, 0, 500);
