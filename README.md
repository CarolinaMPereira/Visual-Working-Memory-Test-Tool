[![License: GPL-3.0](https://badgen.net/github/license/CarolinaMPereira/Visual-Working-Memory-Test-Tool)](https://www.gnu.org/licenses/gpl-3.0)
[![Last release](https://badgen.net/github/release/CarolinaMPereira/Visual-Working-Memory-Test-Tool)](https://github.com/CarolinaMPereira/Visual-Working-Memory-Test-Tool)

# Visual Working Memory Test Tool

Visual Working Memory (VWM) is the short-term memory associated with cognitive tasks, namely the retention of visual information between eye fixations.
This Visual Working Memory Test Tool is a ReactJS App that measures VWM through an Image Change Detection task adapted from [Fukuda and Vogel's study][1].

[1]: https://doi.org/10.1523/JNEUROSCI.2145-09.2009 "Human Variation in Overriding Attentional Capture (Fukuda and Vogel, 2009)"

## Preview

The image change detection test consists of a sequence of images with colored squares as shown bellow:

<p align="center">
    <img src="frontend\src\img\vwm-instructions.gif" alt="VWM Test Tool Demo" height="300" style="display: block; margin: 0 auto"/>
</p>

## Run the application

In order to save results in the PostgreSQL database, please create a `.env` file as shown in the sample provided.

Clone the repository and open the folder:

```bash
git clone https://github.com/CarolinaMPereira/Visual-Working-Memory-Test-Tool.git
cd Visual-Working-Memory-Test-Tool
```

Initialize backend:

```bash
cd backend
npm i
npm run start
```

Initialize frontend in another terminal tab:

```bash
cd Visual-Working-Memory-Test-Tool/frontend
npm i
npm run start
```

Open http://localhost:3000/ in your web browser.
