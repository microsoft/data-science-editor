---
hideToc: true
---

# Pull Request Template

This pull requests add support for Jacdac for this accessory
which allows users to use simulators in MakeCode. Jacdac support will be released in the next major release of MakeCode for micro:bit (summer 2022).

-   This change adds a new nested extension (`jacdac` folder)
and does not modify the existing extension.
-   No hardware modification is required for existing accessories, this feature
is [backward compatible](https://microsoft.github.io/jacdac-docs/ddk/microbit/software-only-accessory/). However, it requires a micro:bit V2 to run.

The benefits for the users and you will be:

-   **Simulator** Jacdac enables simulations of all sensors and actuators
-   **Digital twins** Jacdac surfaces the hardware state directly into the MakeCode editor
-   **Standardized blocks and lessons** the programming will be done through
Jacdac blocks maintained by the Microsoft team

We recommend reading the [Jacdac software only accessory](https://microsoft.github.io/jacdac-docs/ddk/microbit/software-only-accessory/) documentation page to learn more 
about the details of this approach. You can also review a list of similar [software only extensions](https://microsoft.github.io/jacdac-docs/ddk/microbit/extension-samples/).

Please do not hesitate to contact us through this pull request or at jacdac-tap@microsoft.com 
if you have any question or want to schedule a call.

## TODOs

- [ ] merge this pull request
- [ ] create a new release for the repository
- [ ] review the accessory page in the [Jacdac device catalog](https://microsoft.github.io/jacdac-docs/devices/) to make sure we got all the details right

Once the pull request is merged, we will update the catalog to point to it rather than our temporary fork.

## Future accessories TODO

- [ ] Review the [micro:bit accessory Jacdac integration guide](https://microsoft.github.io/jacdac-docs/ddk/microbit/) to learn how you can integrate Jacdac into your future accessories
for a better user experience. We provide various options to integrate Jacdac into your hardware at minimal cost.
- [ ] Review the [Jacdac Device Development Kit] for more details about hardware integration
of Jacdac in general.
- [ ] Contact us if you have any question about adding Jacdac to your next accessory.