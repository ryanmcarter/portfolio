Keel is a bespoke new design system built from scratch to usher in a new design and development process for the New York Shipping Exchange (NYSHEX). Designed entirely in Figma and built on top of a robust design token system, it currently contains dozens of components, hundreds of tokens, and is fully live and deployed in the product. NYSHEX is a digital platform that connects carriers & shippers to create enforceable contracts and easy tracking of bookings and shipments.

## The problem

Before hiring me to design and build a new design system, NYSHEX was relying on the free & open source Material UI design system to build their product. While this worked for simple elements likes buttons and alerts, Material UI required a lot of hacks and overrides for components such as tables and filtering. And since NYSHEX is a very table-heavy app, this meant lots of extra work for designers and developers to customize Material UI to get it do what they needed it to do. Additionally, while Material UI looks and works great for a lot of apps, eventually your product starts to look like many other apps. And as NYSHEX matured and set its eyes on a Series C, it was decided that a new look and feel combined with the existing engineering challenges necessitated a new design system. I joined in January of 2023 to become the 3rd product designer at NYSHEX and set out to build a new design system that was:

- Atomic
- Documented
- Accessible
- Prototyped (with accessible components)
- Built on top of tokens
- Supported white labeling for NYSHEX's customers.

## My role

As the sole designer to work on the design system, my responsibilities included:

- Setting up the Figma project and component naming structure
- Creating the underlying design token system
- Working directly with engineers to implement components and adopt best practices

## Project timeline

![Keel design system phases](/assets/65b40b45bedf6d0cfdd8f730_ryancarter-designSystemCaseStudy-keelPhases.png)

## Naming & Logo

All great design systems have a name, and Keel was to be no exception. In sticking with the nautical theme of NYSHEX, I settled on "Keel" as the name. On a ship, the keel is "the bottom-most structural member around which the hull of a ship is built." And since a design system is the structure on which a product is built, it fit perfectly.

![Keel design system logo](/assets/65b147a4c1f7e28205a13085_ryancarter-designSystemCaseStudy-keelLogoBreakdown.png)

## Creating a consistent color palette

Based around the core brand color, I set out to create a new color palette that was both accessible, but also consistent between different colors at the same position in the ramp. To accomplish this, I used the Leonardo tool and manually tweaked contrast values to dial in a varied and consistent color palette.

#### Complete color palette

Split across 9 colors and each with at least 8 shades, a new palette was created that kept relative luminosity and saturation consistent across the same step in a different color. This means that ColorOcean600 has the same relative brightness and saturation when placed next to an element with a color of ColorCoral600. As you may notice, each color is nautically themed as well.As you may notice, each color is nautically themed as well. level. By using similar relative saturation and luminosity, none of the alerts stand out against each other in terms of color.

![Keel design system color palette](/assets/65b6f20d9d8f3fa3ce714354_ryancarter-designSystemCaseStudy-keelColorsFull2.png)

#### Color scale comparison

In the below example of an Alert component, the background of each alert has a 100 level background color, and the text and icons are 600 level. By using similar relative saturation and luminosity, none of the alerts stand out against each other in terms of color.

![Keel design system color palette comparison](/assets/65b15cee996a737b5a99bccf_ryancarter-designSystemCaseStudy-keelColorsComparison.png)

#### Grayscale comparison

When converted to grayscale, the uniform color ramp can be seen more clearly.

![Keel design system color palette comparison](/assets/65b6f278c78b959ebd5d1c76_ryancarter-designSystemCaseStudy-keelColorsFull2Grayscale.png)

## Keel's design tokens

To make component development easier, as well as support NYSHEX's goal of full white-label support for its customers, a full token architecture was created from scratch using Tokens Studio. Early on in the project, I met with the engineering team to define a token strategy and naming convention. After much discussion (and leaning on my past experience with Quilt, we settled on a Global to Alias level token nomenclature.

#### Global tokens

While every token starts as a global token, some also end as global tokens. For the sake of ease of use, these tokens remained as global tokens and never received an alias token:

- Spacing (margin, gap and padding)
- Sizing (specifically declared width & height)
- Corner radius

#### Alias tokens

Alias tokens take global tokens and apply one level of specificity to them. We applied alias tokens to:

- Typography
- Color
- Border

#### Component token example

![Keel design system token example](/assets/65b412c27905f0d14618f39f_ryancarter-designSystemCaseStudy-keelTokens.png)

#### Exposure in Figma Dev Mode

![Keel design system tokens in dev mode](/assets/65b41f3d8d36f94a09488a80_ryancarter-designSystemCaseStudy-keelTokensDevMode.png)

## Whitelabel support

Identified early on in the project was the absolute necessity for Keel and the tokens to support whitelabeling the app for NYSHEX's various carrier clients. To accomplish this, I built a "core" set of tokens that contained the tokens that would be consistent for all themes (such as spacing and sizing), and then a separate theme for each whitelabel that contained brand-specific colors and typography. Below is a video showing whitelabel theme switching within Figma. Note: carrier names have been anonymized and the video is slightly sped up.

#### Whitelabel theme switching in Figma

<Video src="/assets/65b51dfe090deec076eaff71_ryanCarter_designSystemCaseStudy_keelWhiteLabel_final-transcode.mp4" title="Keel design system video" autoplay="false" poster="/assets/65b51dfe090deec076eaff71_ryanCarter_designSystemCaseStudy_keelWhiteLabel_final-poster-00001.jpg" />

![](/assets/65b51dfe090deec076eaff71_ryanCarter_designSystemCaseStudy_keelWhiteLabel_final-poster-00001.jpg)

## Components

Below is a list of components such as Alert, Text Badge, Date Picker, and Stepper (which is the most complex component in Keel)

#### Alert

![Keel design system Alert component](/assets/65b590cefc4c59f7f26021c5_ryancarter-designSystemCaseStudy-keelAlert2.png)

#### Date Picker

![Keel design system Date Picker component](/assets/65b51ed55dd16ed98f0b9489_ryancarter-designSystemCaseStudy-keelDatePicker.png)

#### Text Badge

![Keel design system Text Badge component](/assets/65b51ed5d34067bac41aee0a_ryancarter-designSystemCaseStudy-keelTextBadge.png)

#### File Uploader

![Keel design system File Uploader component](/assets/65b51facdc53d035400d1527_ryancarter-designSystemCaseStudy-keelFileUploader.png)

#### FigJam Process Overview

I re-used the same successful FigJam overview from Quilt to handoff to devs & designers on the overall process of how to successfully use Keel or make changes and implement new components.

#### Figma-component-level engineering specs

Every component in Figma received detailed specs on how the component was setup, the different variants, states, as well as which tokens were being used.

![Keel design system component spec](/assets/65b5205aa8058948c00113e4_ryancarter-designSystemCaseStudy-keelComponentDocs.png)

#### Notion Documentation

For easier discovery and more engineering-focused documentation, I co-created documentation in Notion more centered around engineering.

![Keel design system notion documentation](/assets/65b6f5063061e1aff3887b22_ryancarter-designSystemCaseStudy-notionDocumentation2.jpg)

#### Keel Lunch & Learn Engineering Benefits

Below is a slide the front end engineers created to summarize the benefits Keel was providing the engineering team.

![Keel design system engineering benefits](/assets/65b6f61967fd9e59200b8a81_ryancarter-designSystemCaseStudy-keelEngineeringBenefits.png)

#### Keel in total

In total, Keel is currently 127 components. All in all, Keel has the following components (and sub-components):

![Keel design system component list](/assets/65b58f2e21078c5d276e691f_ryancarter-designSystemCaseStudy-keelComponentList.png)
