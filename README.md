# CFG Ambiguity Analyzer with Counterexample Generator

## Overview

This project is a web-based tool that analyzes a **Context-Free Grammar (CFG)** to determine whether it is **ambiguous**. It automatically generates strings from the grammar and identifies cases where multiple distinct derivations exist for the same string.

The system also classifies the **type of language** and determines whether the ambiguity is **removable or possibly inherent**.

---

## Features

* Detects whether a CFG is **ambiguous**
* Finds the **smallest ambiguous string**
* Displays **two distinct derivations** for proof
* Classifies the **language type**

  * Regular Language
  * Context-Free Language (Not Regular)
* Identifies ambiguity type:

  * Removable Ambiguity
  * Possibly Inherent Ambiguity
* Handles edge cases:

  * Left recursion
  * Epsilon productions
  * Infinite loops
  * Invalid grammar input

---

## Problem Statement

Develop a system that accepts a Context-Free Grammar (CFG) as input and determines whether the grammar is ambiguous by generating strings and identifying multiple distinct derivations for the same string. The system also identifies the smallest ambiguous string and classifies the type of language and ambiguity.

---

## Tech Stack

* HTML
* CSS
* Vanilla JavaScript

(No frameworks or external libraries used)

---

## Project Structure

```
project/
│── index.html
│── style.css
│── script.js
```

---

## How to Run

1. Download or clone the project
2. Open `index.html` in any browser
3. Enter a grammar in the input box
4. Click **"Analyze Grammar"**

---

## Example Inputs

### 1. Ambiguous Grammar

```
E -> E+E | E*E | i
```

### 2. Unambiguous Grammar

```
E -> E+T | T
T -> T*F | F
F -> i
```

### 3. Regular Grammar

```
S -> aS | bS | a | b
```

---

## Sample Output

```
Grammar is Ambiguous

Language Type: Context-Free Language (Not Regular)

Ambiguity Type: Removable Ambiguity

Ambiguous String: i+i*i

Derivation 1: ...
Derivation 2: ...
```

---

## Limitations

* Analysis is **bounded by depth limits**
* Some inherently ambiguous grammars may not be fully detected
* Language classification uses **heuristics**, not formal proofs

---

## Future Enhancements

* Parse tree visualization
* Automatic conversion to unambiguous grammar
* Better ambiguity classification
* Deployment with backend support

---

## Key Learning Outcomes

* Understanding ambiguity in CFG
* Practical implementation of derivations
* Language classification concepts
* Handling recursion and infinite states

---

## Author

**Tharun Reddy**

---

## Note

This project focuses on **logic and theory implementation**, not UI complexity, making it simple yet conceptually powerful.
