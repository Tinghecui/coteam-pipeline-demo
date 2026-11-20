# Changelog

## Unreleased

- The footer says "1 item left" (not "1 items left") when exactly one to-do is open.
- The footer also says how many to-dos are done, after a middle dot ("2 items left · 1 done"); with nothing done it stays as before.
- New storage module saves and loads the list (key `todo-list:v1`); a new to-do never reuses an id already in the list, so ids stay unique after loading. The page does not use it yet.
