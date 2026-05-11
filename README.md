# Blast puzzle

[![Play Demo](https://img.shields.io/badge/Demo-Play%20Now-brightgreen)](https://dimailim.github.io/Blast_Puzzle/)

## Overview
This project is a prototype of a **Blast** puzzle game developed using the **Cocos Creator 2.4.15** engine.

### Key Features
- **Core Blast Mechanics**: Tile burning (group matching) and coordinate-based tile falling animations.
- **Game Progress**: Integrated systems for counting moves and tracking player score.
- **Win/Lose Conditions**: Automatic handling of game outcomes based on target scores and remaining moves.
- **Smart Shuffle System**: Automatic board regeneration when no moves are available. The system attempts to shuffle the board up to 3 times; if no matches are found after the 3rd shuffle, the game results in a loss.
- **Bomb Booster**: An activatable power-up that destroys tiles within a specific radius (R).
- **Teleport Booster**: A strategic power-up that allows the player to swap any two tiles on the board.

---

## Get Started

### 1. Install Cocos Creator
To run and edit this project, you need Cocos Creator version **2.4.15**:
1. Visit the [Cocos Creator Download Page](https://www.cocos.com/en/creator-download).
2. Download and install the **Cocos Dashboard**.
3. Open the Dashboard, navigate to the **Installs** tab, and download engine version **2.4.15**.

### 2. Download the Project
You can get the project files in two ways:
- **Git**: Clone the repository using the command:
  ```bash
  git clone https://github.com/Dimailim/Blast_Puzzle
  ```
- **ZIP**: Download the project as a ZIP archive from the GitHub interface and extract it.

### 3. Open the Project
1. Open **Cocos Dashboard**.
2. Go to the **Projects** tab and click **Add**.
3. Select the folder where you cloned/extracted the project.
4. Click on the project name to open it in the Cocos Creator editor.

---

## Project Structure
The project follows the **MVC (Model-View-Controller)** design pattern to ensure clean separation of concerns and maintainability.

The `assets/scripts` directory is organized as follows:

- **core/**: Contains the core game logic and data models. This is the "Model" layer, independent of the rendering engine. It handles board state, match detection, and progress tracking.
- **view/**: Handles the visual representation and rendering via the Cocos engine. This is the "View" layer, responsible for animations, UI updates, and displaying tile states.
- **utils/**: Contains general utility classes. Currently, includes a `Random` class, abstracted to allow for easy mocking during Unit Testing.
- **GameManager.ts**: Acts as the **Orchestrator/Controller**. It links the `core` logic with the `view` components, managing the game flow and event handling.

In root diretory:
- **tests/**: Contains Unit tests for the core logic parts. It uses the **Jest** framework for testing independent logic (Models) without the need for the Cocos engine environment.
---

## Level Configuration
The game's parameters can be easily adjusted without modifying the core logic by editing the `assets/scripts/core/levelConfig.ts` file.

### Config Attributes
- **columns / rows**: Board dimensions (Minimum: 2x2, Maximum: 10x10).
- **colors**: Array of available tile colors for the level.
- **targetScore**: The score required to win the level.
- **maxMoves**: Total number of moves allowed to reach the target score.
- **bonusBombCount**: Initial number of Bomb boosters available.
- **bonusTeleportCount**: Initial number of Teleport boosters available.
- **bonusBombRadius**: The radius (R) of the Bomb explosion (e.g., 1 means a 3x3 area around the target).
- **maxShuffleCount**: Number of automatic shuffle attempts before a game over occurs due to no moves.
- **checkHasMovesDuration**: Delay (in seconds) between moves to check for available matches.

This approach allows for rapid balancing and creation of new level variations purely through configuration.

---
*Note: This is a technical prototype for demonstration purposes.*
