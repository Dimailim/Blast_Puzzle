# Logic Tests

This folder contains unit tests for the core game logic. These tests are built with **Jest** and are designed to verify the "Model" layer of the application, ensuring that the game mechanics work correctly independent of the Cocos Creator engine.

## What is covered
The tests focus on the logical part of the game, including:
- **GameBoard**: Grid generation, match detection, tile falling, and shuffling logic.
- **ProgressTracker**: Score calculation, move counting, and win/lose conditions.
- **Tile**: Individual tile states and properties.

## Getting Started

### 1. Install Dependencies
Before running the tests for the first time, make sure you are in the `tests` directory and install the necessary packages:

```bash
cd tests
npm install
```

### 2. Run Tests
To execute all tests once, run:

```bash
npm test
```

### 3. Watch Mode
To run tests in interactive watch mode (useful during development), use:

```bash
npm run test:watch
```
