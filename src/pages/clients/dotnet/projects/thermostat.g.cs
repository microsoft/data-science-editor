using Jacdac;
using Jacdac.Clients;
using System;
using System.Threading;

...

var thermometer = new TemperatureClient(bus, "temp");
var relay = new RelayClient(bus, "relay");
var lastCommand = DateTime.MinValue;
var desired = 21;
thermometer.ReadingChanged += (s, e) =>
{
    var temp = thermometer.Temperature;
    var error = temp - desired;
    // is there a relay available?
    if (!relay.IsConnected)
    {
        Console.WriteLine("no relay, did the furnace go down?");
    }
    // turn on when temperature drops
    else if (error < -1)
    {
        if (!relay.Active)
            Console.WriteLine("too cold..., turning the heat on");
        relay.Active = true;
    }
    // turn off when too hot
    else if (error > 0)
    {
        if (relay.Active)
            Console.WriteLine("just right..., turning the heat off");
        relay.Active = false;
    }
    // 0..1 zone, do nothing
};
   // 0..1 zone, do nothing
    }
    catch (ClientDisconnectedException)
    {
        Thread.Sleep(1000);
    }
};
