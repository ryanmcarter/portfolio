thyme is a spend tracking app of mine being designed and developed on the side. Rather than looking at your expenditures through the lense of dollars and cents, thyme translates your transactions in to how much work time it took to fund that purchase. If you make $20/hr and you just splurged $20 on a burrito, queso, and guac; that burrito just cost you an hour of work time. Was it worth it? Probably, because burritos are awesome.

## It's about thyme

In 2019 I set out to design and build a somewhat new kind of spending tracking app. After using various apps like Clarity and Mint that pull in and aggregate spending by amount, I felt like there was a missing opportunity for an app to display spending by time instead of amount. When looking through my expenditures, I tend to become sort of blind to the actual amount of money I spend. $50 here, $10 there, in the end are just numbers adding up. However, if one could look at those same expenses through the lens of time, it might offer new revelations about how much things cost. If you're making $10/hr, that $50 pair of pants essentially cost you 5 hours of work, or more than half a day. If you love your job, great! Reward yourself. But if you dislike your job you might begin to question if it was really worth 5 hours of your boss asking where those reports are. The app is currently in design + development mode, ship date to be determined.

## The four main screens

![Thyme UI screenshots](/assets/5d87d1c0ad1d4b0842055956_cs-thyme-states.png)

After the splash screen (while the app loads), a general information screen will display to prime the user on what comes next and what the app does. Since we're using Plaid as the API to connect to banks, we didn't want to go from a splash (loading) screen right in to the Plaid gateway without any sort of primer on what was happening. The explainer screen will hopefully give users some info as to what the app does and will prime them for the gateway screen.

![Final setup screen for Thyme](/assets/5d87ebd58de89c7f20a2bb22_cs-thyme-finalsetup.png)

#### Final setup screen

To make the app work to its best, we require a few final details, centered around how the end user is paid. Getting hourly vs. salaried information including their pay rate, helps the app to determine how profitable a given week is.

![Main summary page for Thyme](/assets/5d87ecb1f0c5f33b0a926ec6_cs-thyme-mainsummary.png)

#### Main summary page

The top of the main summary page offers a quick way for a user to know how profitable this week was. In this example, the user worked a total of 38 hours, but "spent" 14 of those hours on various things, for a net positive of being up 24 hours for the week. In the main header, we offer some supplementary financial details, showcasing info such as hours worked, time spent, total income, and dollars spent. This is intended to offer a quick glance at finances. Below that, the main section sees transactions separated by days of the week, with each transaction showing how much time of work that transaction cost. The settings page offers the ability to adjust hourly rate, notification settings, and more.
