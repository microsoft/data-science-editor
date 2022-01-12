using Jacdac;
using System;

...

bus.IsStreaming = true;
foreach (var transport in bus.Transports)
{
    transport.ConnectionChanged += (sender, newState) =>
    {
        Console.WriteLine($"{sender.Kind}: {newState}");
    };
}
bus.DeviceConnected += (_, conn) =>
{
    var device = conn.Device;
    var selfMsg = bus.SelfDeviceServer.DeviceId == device.DeviceId ? "(self)" : "";
    Console.WriteLine($"device connected {device} {selfMsg}");

    device.Announced += (__, an) =>
    {
        var services = device.GetServices();
        foreach (var service in services)
        {
            service.ResolveSpecification();
            Console.WriteLine(service.ToString());
            var reading = service.GetRegister((ushort)Jacdac.SystemReg.Reading);
            if (reading != null)
                reading.ReportReceived += (___, rargs) =>
                {
                    Console.WriteLine($"  {reading}: ");
                    var values = reading.Values;
                    foreach (var value in values)
                        Console.WriteLine($"      {value}, ");
                };
        }
    };
};
