# Broccoli

Broccoli is a stack-based, semi-concatenative programming language.

You can try the JS interpreter at [this address](https://mathieucaroff.com/broccoli).

## Overview

- Hello world example:

  ```
  "Hello World!" output
  ```
  
- All operators have the same precedence. Computations are carried left to right. The below code prints 18, not 12:

  ```
  3 + 3 * 3 output
  ```

- Factorial computer:

  ```
  input number = a
  1 = b

  { a * b = b a - 1 = a }
  { a > 0 }
  while

  b output
  ```

- [Truth machine](https://esolangs.org/wiki/Truth-machine):

  ```
  { 0 output }
  { { 1 output } { true } while }
  input == 0
  if
  ```

## Control flow

Broccoli does not have keywords, but has predefined variables that can be used for codeflow instead.

## Predefined variables

Broccoli features the following predefined variables:

- if
  - pop three values from the stack:
    `<codeblock if yes> <codeblock if no> <boolean> if`
- while
  - pop two codeblocks from the stack:
    `<body codeblock> <test codeblock> while`
- printstack
  - stringify and output the stack. It is meant to be used for debugging.
- true
  - push the boolean value `true` on the stack
- false
  - push the boolean value `false` on the stack
- run
  - pop a codeblock from the stack and run it in the current frame
- eval
  - pop one string from the stack, parse it and run it in the current frame
- input
  - read one line from the stdin, removing the newline at the end
- number
  - convert a scalar value to a number
- output
  - prints a scalar value to stdout (without appending newline)

## Nearly grammar for broccoli

```ne
braced[X] -> "{" $X "}"
parenthesized[X] -> "(" $X ")"

main -> _ program _

program -> (expression (__ expression):*):?

expression -> identifier | string | number | operation | assignment | codeblock | group

identifier -> [A-Za-z_] [0-9A-Za-z_]:*

access -> "." identifier

string -> "\"" string_content:* "\""

string_content -> [^"\n\\] | "\\" .

number -> [1-9] [0-9]:*

operation -> operator __ expression

operator -> "==" | "!=" | "<=" | ">=" | "<<" | ">>" | [-+*/%<>&^|]

assignment -> "=" _ identifier

codeblock -> braced[_ program _]

group -> parenthesized[_ program _]

_  -> [ \t\n]:* (comment [ \t\n]:*):?
__ -> [ \t\n]:+ (comment [ \t\n]:*):?

comment -> "#" .:* "\n"
```

Also see [grammar.ne](./grammar.ne)

## Develop

```
git clone https://github.com/mathieucaroff/broccoli
# or git clone https://github.com/mathieucaroff/broccoli.git

cd broccoli

yarn install
# or npm install

yarn serve
# or npm run serve
```
