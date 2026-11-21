# Changelog

## Unreleased

- The footer says "1 item left" (not "1 items left") when exactly one to-do is open.
- The footer also says how many to-dos are done, after a middle dot ("2 items left · 1 done"); with nothing done it stays as before.
- New storage module saves and loads the list (key `todo-list:v1`); a new to-do never reuses an id already in the list, so ids stay unique after loading. The page does not use it yet.
- The page keeps the list after a reload: it loads the stored list on start and saves it after every add, tick, delete and "Clear done".
- A new "Clear all" button under the list removes every to-do, done or not, without asking; the emptied list is saved, so it stays empty after a reload.
- After ticking a to-do, an "Undo" link under the footer unticks it again; it stays for 5 seconds and only for the last to-do ticked.
- A "Sort by" menu above the list shows the to-dos by date added (as before), by title A–Z, or with open ones first.
- A to-do title can be at most 100 characters; a longer one is refused with "A to-do title can be at most 100 characters", the same way an empty title is refused.
- The browser tab title reads "To-dos (N open)", N being the to-dos not ticked yet, and follows every change.
- The README says how to run the tests.
- New `countOpen(list)` in the to-do logic returns how many to-dos are not done yet. The page does not use it.
- New `renameItem(list, id, title)` in the to-do logic gives a to-do a new title, trimmed, with the same rules as adding one; an unknown id leaves the list unchanged. The page does not use it.
- New `countDone(list)` in the to-do logic returns how many to-dos are done. The page does not use it.
