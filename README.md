[![License: GPL-3.0](https://badgen.net/github/license/CarolinaMPereira/Visual-Working-Memory-Test-Tool)](https://www.gnu.org/licenses/gpl-3.0)
[![Last release](https://badgen.net/github/release/CarolinaMPereira/Visual-Working-Memory-Test-Tool)](https://github.com/CarolinaMPereira/Visual-Working-Memory-Test-Tool)

# Visual Working Memory Test Tool

Visual Working Memory (VWM) is the short-term memory associated with cognitive tasks, namely the retention of visual information between eye fixations.
This Visual Working Memory Test Tool is a ReactJS App that measures VWM through an Image Change Detection task adapted from [Luck and Vogel's study][1].

This free tool allows to measure VWM through a customizable change detection test.

[1]: https://doi.org/10.1038/36846 "The capacity of visual working memory for features and conjunctions. (Luck and Vogel, 1997)"

## Preview

The image change detection test consists of a sequence of images with colored squares as shown bellow:

<p align="center">
    <img src="frontend\src\img\vwm-instructions.gif" alt="VWM Test Tool Demo" height="300" style="display: block; margin: 0 auto"/>
</p>

## Saved Data

```user_id```: Participant's unique identifier.
```vwm_capacity```: Visual Working Memory capacity (K) resulting from K = S(H-F), where S is the set size, H is the hit rate and F is the false alarm rate.
```size4_score```: Number of correct answers for sets of size 4.
```size8_score```: Number of correct answers for sets of size 8.
```size4_hit_rate```: Proportion of trials where a change trial was correctly identified as a change trial for sets of size 4.
```size8_hit_rate```: Proportion of trials where a change trial was correctly identified as a change trial for sets of size 8.
```size4_false_alarm```: Proportion of trials where a no change trial was incorrectly identified as a change trial for sets of size 4.
```size8_false_alarm```: Proportion of trials where a no change trial was incorrectly identified as a change trial for sets of size 8.
```correct_answers```: Correct answer for each trial. True if it is a change trial, False otherwise.
```user_answers```: Answers given by the user. True if user identified a change trial, False otherwise.
```set_sizes```: Sizes of the trials by order.
```duration```: Time spent taking the test in seconds.

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
